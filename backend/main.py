from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.game_state import game_state
from pydantic import BaseModel

app = FastAPI(title="Face to Morse")

origins = ["http://localhost:3000", "http://127.0.0.1:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_headers=["*"],
    allow_methods=["*"]
)


# pydantic class
class SignalRequest(BaseModel):
    signal: str


@app.get("/start-game")
def start_game():
    game_state.start_game()
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
def add_signal(request: SignalRequest):
    """To be used by AI team to send detected signals to be added to
    the game state dictionray 
    """
    game_state.add_signal(signal=request.signal)
    return {"message": "signal added", "signal": request.signal}
