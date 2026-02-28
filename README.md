# face-to-morse-game

# Overview

🕹️ Face-to-Morse Game: Code & Architecture Guide

Welcome to the repository! To keep our 5-person team moving quickly for the tech event without stepping on each other's toes, we are using a strict separation of concerns.

This document explains our pipeline and exactly which folders you should be working in.

# 🔄 The 3-Step Game Pipeline
Our game relies on a clear data flow between the frontend and our Python backend:

- Frontend / UI: Captures the webcam feed and sends it to the backend via WebSockets. It also renders the game screen using React and Tailwind.

- AI & Input: Lives on the backend. It receives the video stream, tracks the face using MediaPipe, and detects a Morse code signal (e.g., a blink = dot).

- Game Logic: Takes that Morse signal, checks if it matches the target word from our dictionaries, updates the score in the database, and sends the new state back to the frontend.

# 📁 Where You Should Work (Folder Structure)
Do not edit files outside your designated areas without talking to the rest of the team first!

1. 🧠 AI Developer (Input Handling)
Because we are using MediaPipe's powerful Python library (feel free to share your thoughts about what library we should use), your code will live inside the backend folder.

Work in: backend/ai/ (Create this folder for your scripts)

Your Goal: Write the Python scripts that process incoming video frames, detect blinks/movements, and translate them into clean events (like "DOT" or "DASH").

Handoff: You will import your functions into main.py so the Game Logic can use your blink detections instantly.

2. ⚙️ Game Logic Developer (Rules & State)
You are the brain of the game. Your code lives entirely in the backend folder using FastAPI.

Work in: * backend/main.py: Set up the FastAPI routes and WebSocket endpoints.

backend/models/: Define the game state structure (e.g., game_state.py).

backend/constants/: Store static data (e.g., morse_dict.py, word_list.py).

Handoff: You will process the AI's Morse signals and send a JSON "Game State" object back to the Frontend.

3. 🎨 UI Developers (2 Members)
You are responsible for the look, feel, and user experience. Your work lives exclusively in the frontend folder.

Work in: frontend/src/components/, frontend/src/pages/, and frontend/src/assets/

Styling: Use Tailwind CSS (Example: see the current welcome code). Refer to the Tailwind Documentation if you get stuck.

Your Goal: Build the main menus, the game screen, and the scoreboards using React. Setup the webcam to stream frames to the backend.

Handoff: You will fetch the final "Game State" from the backend API and use it to update the numbers and animations on the screen. You should not be writing game logic or webcam processing code here.

# 🤝 How to Integrate
When putting the pieces together:

The Frontend components will open a WebSocket connection to the Backend (main.py) to stream the webcam video.

The AI scripts will process that stream in real-time, handing "DOT" or "DASH" to the Game Logic.

The Game Logic will calculate the new score and instantly send the updated Game State back through the connection to the Frontend to update the screen.

# 🚀 Getting Started: Setup & Installation
Because our game is split into a React Frontend and a Python Backend, you need to set up both environments before you can start working.

Prerequisites (Do this once)
Before you touch any code, ensure you have these tools installed on your computer:

Git (To download our code and save your changes)

Node.js (Choose the LTS version. For the frontend)

Python 3.x (For the backend and AI)

VS Code (Our code editor)

Step 1: Clone the Repository (Get the code)

Open your computer's terminal (or Git Bash if you are on Windows).

Navigate to where you want to save the project (e.g., cd Documents).

Run the following command to download the code:
git clone [INSERT_YOUR_GITHUB_REPO_URL_HERE]

Open the newly created FACE-TO-MORSE-GAME folder in VS Code.

Step 2: Install the Backend (Game Logic & AI)

In VS Code, open a new terminal (Terminal -> New Terminal).

Type cd backend and press Enter.

Create a virtual environment to keep our Python packages clean: python -m venv venv

Activate the virtual environment: venv\Scripts\activate (Note: You should see (venv) appear in your terminal prompt).

Install the required packages: pip install fastapi uvicorn mediapipe (Note: this might change as we add more tools).

Step 3: Install the Frontend (UI)

In a new terminal tab, type cd frontend and press Enter to move into the frontend folder.

Type npm install and press Enter. Wait for it to finish.

# ▶️ How to Run the Game
You must run two terminals at once to test the full game:

Terminal 1 (Backend): 1. cd backend
2. Make sure your virtual environment is active (run venv\Scripts\activate if not).
3. uvicorn main:app --reload

Terminal 2 (Frontend): 1. cd frontend
2. npm run dev

Open the link provided in Terminal 2 (usually http://localhost:5173) to play.

# 🛡️ GitHub Safety Rules and how to push
To make sure the game stays playable at all times:

Create a Branch: Before you start a task, create your own "workspace":
git checkout -b [your-name]-[task-name] (Example: git checkout -b ahmad-ui-fix)

How to Save and Push
When you finish a task, run these commands in your terminal:

Stage your changes (Tell Git which files you want to save):
git add .

Commit your work (Give your save point a name):
git commit -m "added morse detection logic" (Make sure your message describes exactly what you changed!)

Push to GitHub (Send your code to the cloud):
git push -u origin [your-branch-name]

The Merge: Once your feature is working perfectly, tell the Team Lead. We will merge your branch into the main code together.
