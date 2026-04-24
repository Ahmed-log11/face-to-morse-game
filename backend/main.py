from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models.game_state import game_state
from ai import MorseDetector
from pydantic import BaseModel
from datetime import date as date_type
import json
import os

SCORES_FILE = os.path.join(os.path.dirname(__file__), "scores.json")

def _load_scores() -> list:
    if os.path.exists(SCORES_FILE):
        with open(SCORES_FILE, "r") as f:
            return json.load(f)
    return []

def _save_scores(scores: list):
    with open(SCORES_FILE, "w") as f:
        json.dump(scores, f)

scores_db: list = _load_scores()

app = FastAPI(title="Face to Morse")

origins = [
    "http://localhost:3000", 
    "http://127.0.0.1:3000",
    "http://localhost:5173",  
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"]
)

# one detector instance for the whole app (stateful, do not re-init per frame)
detector = MorseDetector()

# since one person plays at a time, we only need one connection
active_connection: WebSocket | None = None


async def broadcast_state():
    """push the latest game state to the connected client"""
    global active_connection
    if active_connection is None:
        return
    try:
        await active_connection.send_text(json.dumps(game_state.get_state_dict()))
    except Exception:
        active_connection = None


# pydantic classes
class SignalRequest(BaseModel):
    signal: str

class FrameRequest(BaseModel):
    # base64 encoded jpeg frame from the frontend webcam
    frame: str

class ScoreRequest(BaseModel):
    score: int
    avatar: str
    username: str | None = None


# ─────────────────────────────────────────────
# NEW ENDPOINT: Call this when GameScreen loads
# This resets the detector so calibration starts
# fresh during the countdown for each new player
# ─────────────────────────────────────────────
@app.get("/reset-detector")
async def reset_detector():
    """Called when GameScreen mounts, before countdown starts.
    Resets the blink detector so it calibrates during the 3-second
    countdown using the current player's face."""
    detector.reset()
    return {"status": "detector reset"}


@app.get("/start-game")
async def start_game():
    # REMOVED detector.reset() from here — it now happens earlier
    # via /reset-detector so calibration runs DURING the countdown,
    # not AFTER it
    game_state.start_game()
    await broadcast_state()
    return game_state.get_state_dict()


@app.get("/state")
def get_state():
    """To be used by the frontend team to make the timer work
        you will basically keep hitting this endpoint to keep updating the time
        left from the json it returns
        Note: if u dont want this lmk so i can make it async but this 
        is the preferred way
    """

    return game_state.get_state_dict()


@app.post("/add-signal")
async def add_signal(request: SignalRequest):
    """To be used by AI team to send detected signals to be added to
    the game state dictionray 
    """
    game_state.add_signal(signal=request.signal)
    await broadcast_state()
    return {"message": "signal added", "signal": request.signal, "gameState": game_state.get_state_dict()}


@app.post("/process-frame")
async def process_frame(request: FrameRequest):
    """To be used by frontend to send raw webcam frames
       the backend runs the AI and updates the game state automatically
    """
    try:
        signal = detector.process(request.frame)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI processing failed: {str(e)}")
    
    if signal:
        game_state.add_signal(signal)
        await broadcast_state()

    return {"signal": signal}


@app.post("/submit-score")
def submit_score(request: ScoreRequest):
    username = (request.username or "").strip()
    if not username:
        username = "PLAYER"
    entry = {"score": request.score, "avatar": request.avatar, "username": username, "date": str(date_type.today())}
    scores_db.append(entry)
    _save_scores(scores_db)
    return {"status": "saved", "entry": entry}


@app.get("/leaderboard")
def get_leaderboard():
    return sorted(scores_db, key=lambda x: x["score"], reverse=True)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """frontend connects here once, and we push state updates to it"""
    global active_connection

    await websocket.accept()
    active_connection = websocket

    try:
        # send the current state as soon as they connect
        await websocket.send_text(json.dumps(game_state.get_state_dict()))

        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))

    except WebSocketDisconnect:
        pass
    finally:
        if active_connection is websocket:
            active_connection = None
