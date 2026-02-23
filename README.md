# face-to-morse-game


# Overview
*🕹️ Face-to-Morse Game: Code & Architecture Guide*
Welcome to the repository! To keep our 5-person team moving quickly for the tech event without stepping on each other's toes, we are using a strict separation of concerns.

This document explains our pipeline and exactly which folders you should be working in.

*🔄 The 3-Step Game Pipeline*
Our game relies on a simple, one-way data flow:

- AI & Input: Captures the webcam, tracks the face, and detects a Morse code signal (e.g., a blink = dot).

- Game Logic: Takes that Morse signal, checks if it's correct according to the game rules, and updates the score/timer.

- Frontend / UI: Takes the updated score/timer and renders it nicely on the screen.



*📁 Where You Should Work (Folder Structure)*
Do not edit files outside your designated areas without talking to the rest of the team first!

1. 🧠 AI Developer (Input Handling)
Since the webcam and face recognition (MediaPipe, etc.) run in the browser, your code will live inside the frontend folder, but kept strictly separate from the UI components.

- Work in: frontend/src/utils/ and frontend/src/hooks/

- Your Goal: Write the scripts that access the camera, process the face data, and output clean events (like "DOT" or "DASH").

- Handoff: You will send this cleaned data to the Backend API (Game Logic).

2. ⚙️ Game Logic Developer (Rules & State)
You are the brain of the game. Your code lives entirely in the backend folder. You don't need to worry about what the game looks like or how the camera works.

- Work in: * backend/controllers/: Write the actual game rules here (e.g., checking if the morse code matches the target word, updating points).

- backend/routes/: Set up the API endpoints that the Frontend will call to send you the AI's Morse signals.

- backend/models/: Define how the game state is structured (e.g., current score, time left).

- Handoff: You will process the incoming data and send back a "Game State" object to the Frontend.

3. 🎨 UI Developers (2 Members)
You are responsible for the look, feel, and user experience. Your work lives exclusively in the frontend folder.

- Work in: frontend/src/components/, frontend/src/pages/, and frontend/src/assets/
- use Tailwind CSS
Example: in the current welcome code
Refer to the Tailwind Documentation if you get stuck.
- Your Goal: Build the main menus, the game screen, and the scoreboards using React.

- Handoff: You will fetch the final "Game State" from the backend/routes/ and use it to update the numbers and animations on the screen. You should not be writing game logic or webcam processing code here.



*🤝 How to Integrate*
When putting the pieces together:

- The AI scripts in frontend/utils will trigger an API call to the backend.

- The Logic scripts in backend/controllers will process that call and update the score.

- The UI components in frontend/components will read that new score from the backend and update the screen.


# 🚀 Getting Started: Setup & Installation

Because our game is split into two halves (Frontend and Backend), you need to set up the code for both folders before you can start working.

Prerequisites (Do this once)
Before you touch any code, ensure you have these three tools installed on your computer:

- Git (To download our code and save your changes)

- Node.js (Choose the LTS version. This lets your computer run our JavaScript)

- VS Code (Our code editor)

Step 1: Clone the Repository (Get the code)

- Open your computer's terminal (or Git Bash if you are on Windows).

- Navigate to where you want to save the project (e.g., cd Documents).

Run the following command to download the code:
- git clone [INSERT_YOUR_GITHUB_REPO_URL_HERE]

- Open the newly created FACE-TO-MORSE-GAME folder in VS Code.

Step 2: Install the Backend (Game Logic)

- Inside VS Code, go to the top menu: Terminal -> New Terminal.

- Type cd backend and press Enter to move into the backend folder.

- Type npm install and press Enter. Wait for the loading bar to finish.

Step 3: Install the Frontend (UI & AI)

- In that same terminal, type cd .. and press Enter to move back to the main folder.

- Type cd frontend and press Enter to move into the frontend folder.

- Type npm install and press Enter. Wait for it to finish.


# ▶️ How to Run the Game
You must run two terminals at once:

Terminal 1 (Backend): cd backend then node index.js

Terminal 2 (Frontend): cd frontend then npm run dev

Open the link provided in Terminal 2 (usually http://localhost:5173) to play.

# 🛡️ GitHub Safety Rules and how to push
To make sure the game stays playable at all times:

- Create a Branch: Before you start a task, create your own "workspace":
git checkout -b [your-name]-[task-name] (Example: git checkout -b ahmad-ui-fix)

- How to Save and Push 
When you finish a task, run these commands in your terminal:
1. Stage your changes (Tell Git which files you want to save):
- git add .
2. Commit your work (Give your save point a name):
- git commit -m "added morse detection logic" 
(Make sure your message describes exactly what you changed!)
3. Push to GitHub (Send your code to the cloud):
- git push -u origin [your-branch-name]

  
The Merge: Once your feature is working perfectly, tell the Team Lead. We will merge your branch into the main code together.
