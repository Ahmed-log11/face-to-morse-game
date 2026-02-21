# face-to-morse-game
Gemini said
This picture helps perfectly! You have a classic, clean full-stack setup with a distinct backend and frontend. Knowing that you are using what looks like React (with Vite) for the frontend and Node.js for the backend makes organizing the team's workflow much easier.

Since you are leading this 5-person team for the tech event, you can use this exact folder structure to enforce that simple 3-step pipeline (AI -> Logic -> UI).

Here is a customized README tailored exactly to your screenshot that explains where everyone should work:

🕹️ Face-to-Morse Game: Code & Architecture Guide
Welcome to the repository! To keep our 5-person team moving quickly for the tech event without stepping on each other's toes, we are using a strict separation of concerns.

This document explains our pipeline and exactly which folders you should be working in.

🔄 The 3-Step Game Pipeline
Our game relies on a simple, one-way data flow:

AI & Input: Captures the webcam, tracks the face, and detects a Morse code signal (e.g., a blink = dot).

Game Logic: Takes that Morse signal, checks if it's correct according to the game rules, and updates the score/timer.

Frontend / UI: Takes the updated score/timer and renders it nicely on the screen.

📁 Where You Should Work (Folder Structure)
Do not edit files outside your designated areas without talking to the rest of the team first!

1. 🧠 AI Developer (Input Handling)
Since the webcam and face recognition (MediaPipe, etc.) run in the browser, your code will live inside the frontend folder, but kept strictly separate from the UI components.

Work in: frontend/src/utils/ and frontend/src/hooks/

Your Goal: Write the scripts that access the camera, process the face data, and output clean events (like "DOT" or "DASH").

Handoff: You will send this cleaned data to the Backend API (Game Logic).

2. ⚙️ Game Logic Developer (Rules & State)
You are the brain of the game. Your code lives entirely in the backend folder. You don't need to worry about what the game looks like or how the camera works.

Work in: * backend/controllers/: Write the actual game rules here (e.g., checking if the morse code matches the target word, updating points).

backend/routes/: Set up the API endpoints that the Frontend will call to send you the AI's Morse signals.

backend/models/: Define how the game state is structured (e.g., current score, time left).

Handoff: You will process the incoming data and send back a "Game State" object to the Frontend.

3. 🎨 UI Developers (2 Members)
You are responsible for the look, feel, and user experience. Your work lives exclusively in the frontend folder.

Work in: frontend/src/components/, frontend/src/pages/, and frontend/src/assets/

Your Goal: Build the main menus, the game screen, and the scoreboards using React.

Handoff: You will fetch the final "Game State" from the backend/routes/ and use it to update the numbers and animations on the screen. You should not be writing game logic or webcam processing code here.

🤝 How to Integrate
When putting the pieces together:

The AI scripts in frontend/utils will trigger an API call to the backend.

The Logic scripts in backend/controllers will process that call and update the score.

The UI components in frontend/components will read that new score from the backend and update the screen.
