from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from models.game_state import game_state
from ai import MorseDetector
from pydantic import BaseModel
import json

app = FastAPI(title="Face to Morse")

origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

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
    if active_connection is None:
        return
    try:
        await active_connection.send_text(json.dumps(game_state.get_state_dict()))
    except:
        # connection probably dropped, the ws endpoint will clean it up
        pass


# pydantic classes
class SignalRequest(BaseModel):
    signal: str

class FrameRequest(BaseModel):
    # base64 encoded jpeg frame from the frontend webcam
    frame: str


@app.get("/start-game")
async def start_game():
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
    return {"message": "signal added", "signal": request.signal}


@app.post("/process-frame")
async def process_frame(request: FrameRequest):
    """To be used by frontend to send raw webcam frames
       the backend runs the AI and updates the game state automatically
    """
    signal = detector.process(request.frame)
    
    if signal:
        game_state.add_signal(signal)
        await broadcast_state()

    return {"signal": signal}


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
            # just keep the connection alive, we dont expect messages from the client
            await websocket.receive_text()

    except WebSocketDisconnect:
        active_connection = None
    except:
        active_connection = None
