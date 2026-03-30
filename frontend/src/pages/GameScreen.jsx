import React, { useState, useEffect, useRef } from 'react';
import Webcam from 'react-webcam';

const BACKEND_URL = "http://localhost:8000";
const WS_URL = "ws://localhost:8000/ws";

// The cheat sheet for the UI
const MORSE_CODE = {
  "A": ".-", "B": "-...", "C": "-.-.", "D": "-..", "E": ".",
  "F": "..-.", "G": "--.", "H": "....", "I": "..", "J": ".---",
  "K": "-.-", "L": ".-..", "M": "--", "N": "-.", "O": "---",
  "P": ".--.", "Q": "--.-", "R": ".-.", "S": "...", "T": "-",
  "U": "..-", "V": "...-", "W": ".--", "X": "-..-", "Y": "-.--",
  "Z": "--.."
};

const GameScreen = () => {
  const webcamRef = useRef(null);
  const [gameState, setGameState] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [isGameActive, setIsGameActive] = useState(false);
  
  // Local timer state for smooth visual ticking
  const [localTime, setLocalTime] = useState(120);
// Word Success Flash Logic ---
  const [wordSuccessFlash, setWordSuccessFlash] = useState(false);
  const prevScoreRef = useRef(0);

  useEffect(() => {
    // If the new score is higher than the old score, they finished a word!
    if (gameState?.score > prevScoreRef.current) {
      setWordSuccessFlash(true); // Turn on the green flash
      
      // Turn it off after 800 milliseconds
      const timer = setTimeout(() => setWordSuccessFlash(false), 800); 
      
      prevScoreRef.current = gameState.score; // Update our tracker
      return () => clearTimeout(timer);
    }
  }, [gameState?.score]);
  // 1. Establish WebSocket Connection
 useEffect(() => {
    const ws = new WebSocket(WS_URL);
    ws.onopen = () => console.log("🟢 WebSocket Connected");
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setGameState(data);
      
    
    };
    ws.onclose = () => console.log("🔴 WebSocket Disconnected");
    return () => ws.close();
  }, []);
  // 2. The 3-2-1 Countdown & Start Game
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !isGameActive) {
      setIsGameActive(true);
      fetch(`${BACKEND_URL}/start-game`)
        .then(res => res.json())
        .catch(err => console.error("Error starting game:", err));
    }
  }, [countdown, isGameActive]);

  // 3. Send Webcam Frames for AI Processing
  useEffect(() => {
    const frameInterval = setInterval(async () => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          const base64Data = imageSrc.split(',')[1]; 
          try {
            await fetch(`${BACKEND_URL}/process-frame`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ frame: base64Data })
            });
          } catch (error) {
            console.error("Error sending frame:", error);
          }
        }
      }
    }, 150);
    return () => clearInterval(frameInterval);
  }, []);

  // 4. The Local Timer Tick (Visual Countdown)
  useEffect(() => {
    let interval;
    if (isGameActive && localTime > 0) {
      interval = setInterval(() => {
        setLocalTime((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameActive]); // We only re-run this if the game active state changes

  // Helper to format 120 seconds into "2:00"
  const formatTime = (time) => {
    if (time === undefined || time === null) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Helper to make Morse code look thicker and cooler in the UI
  const formatMorseStyle = (morseString) => {
    if (!morseString) return "";
    return morseString.replace(/\./g, '•').replace(/-/g, '—');
  };
  // RED ERROR FLASH ---
  const expectedMorse = gameState?.targetLetter ? MORSE_CODE[gameState.targetLetter] : "";
  const currentInput = gameState?.currentSequence || "";
  
  // It is an error if they have typed something, and it DOES NOT match the start of the correct answer
  const isError = currentInput.length > 0 && !expectedMorse.startsWith(currentInput);

  return (
    <div className="relative min-h-screen bg-[#0B1120] text-white overflow-hidden flex flex-col items-center [font-family:Oxanium,sans-serif]">
      
      <Webcam
        audio={false}
        ref={webcamRef}
        mirrored={true}
        screenshotFormat="image/jpeg"
        className="absolute opacity-0 pointer-events-none" 
      />

      {countdown > 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center z-10">
          <h1 className="text-4xl text-cyan-400 mb-4 tracking-wider uppercase">Calibrating AI...</h1>
          <p className="text-9xl font-black animate-pulse text-white drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]">
            {countdown}
          </p>
          <p className="mt-8 text-gray-400 text-lg">Hold your face still and look at the camera.</p>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col p-6 md:p-10 max-w-7xl mx-auto z-10 flex-1">
          
          {/* Top HUD */}
          <div className="flex justify-between items-center w-full mb-12 bg-gray-900/60 p-6 rounded-[34px] border-2 border-cyan-900/30 shadow-lg">
            <div className="text-center w-32">
              <p className="text-gray-400 text-sm uppercase tracking-widest mb-1 font-bold">Level</p>
              <p className="text-4xl font-black text-cyan-400">{gameState?.level || 1}</p>
            </div>
            
            <div className="text-center">
              <p className="text-gray-400 text-sm uppercase tracking-widest mb-1 font-bold">Time</p>
              <p className="text-5xl font-black text-white tracking-wider drop-shadow-md">
                {formatTime(localTime)} {/* <--- Now using our local ticking time! */}
              </p>
            </div>

            <div className="text-center w-32">
              <p className="text-gray-400 text-sm uppercase tracking-widest mb-1 font-bold">Score</p>
              <p className="text-4xl font-black text-green-400">{gameState?.score || 0}</p>
            </div>
          </div>

          {/* Main Play Area */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 mb-10">
            
            {/* Target Word Highlighting & Hint */}
            <div className="text-center">
              <p className="text-gray-500 text-xl tracking-[0.2em] uppercase mb-6 font-bold">Target Word</p>
              <div className="flex justify-center gap-6">
                {gameState?.targetWord?.split('').map((letter, index) => {
                  const isCurrentTarget = letter === gameState?.targetLetter;
                  const hint = MORSE_CODE[letter];

                  return (
                    <div key={index} className="flex flex-col items-center">
                       <span 
                        className={`text-8xl md:text-9xl font-black uppercase transition-all duration-300 ${
                          wordSuccessFlash
                            ? "text-green-400 scale-125 drop-shadow-[0_0_40px_rgba(74,222,128,1)] z-20" // <-- The Celebration Flash!
                            : isCurrentTarget 
                              ? "text-cyan-400 scale-110 drop-shadow-[0_0_25px_rgba(34,211,238,0.8)]" 
                              : "text-gray-700"
                        }`}
                      >
                        {letter}
                      </span>
                      
                      {/* The Morse Code Hint Dropdown */}
                      <div className={`mt-4 text-3xl font-bold tracking-[0.2em] transition-all duration-300 ${
                        isCurrentTarget ? "text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)] opacity-100" : "opacity-0"
                      }`}>
                        {formatMorseStyle(hint)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

     {/* Morse Code Input Visualizer */}
            <div className="flex flex-col items-center justify-center w-full max-w-3xl bg-gray-900/80 p-10 rounded-[40px] border-4 border-[#0B1120] shadow-[0_0_40px_rgba(8,145,178,0.15)] relative overflow-hidden mt-8">
               <p className="text-cyan-600/80 text-sm uppercase tracking-[0.3em] font-bold mb-4">Detected Signal</p>
               
               {/* ONLY ONE of these h-28 wrapper divs! */}
               <div className="h-28 w-full bg-black/60 rounded-3xl border border-gray-800 flex items-center justify-center overflow-hidden">
                  <span className={`text-7xl font-bold tracking-[0.3em] ml-[0.15em] transition-all duration-200 ${
                    isError 
                      ? "text-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.9)] animate-pulse scale-110" 
                      : "text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.6)]"
                  }`}>
                    {formatMorseStyle(currentInput)}
                    {!currentInput && <span className="animate-pulse text-gray-800">_</span>}
                  </span>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameScreen;