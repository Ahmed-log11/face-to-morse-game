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
  const [wordSuccessFlash, setWordSuccessFlash] = useState(false);
  const prevScoreRef = useRef(0);

  
  const [displayError, setDisplayError] = useState(false);
  useEffect(() => {
    fetch(`${BACKEND_URL}/reset-detector`);
}, []);
  useEffect(() => {
    if (gameState?.score > prevScoreRef.current) {
      setWordSuccessFlash(true); 
      const timer = setTimeout(() => setWordSuccessFlash(false), 800); 
      prevScoreRef.current = gameState.score; 
      return () => clearTimeout(timer);
    }
  }, [gameState?.score]);

  useEffect(() => {
    let ws;
    let reconnectTimer;

    const connect = () => {
        ws = new WebSocket(WS_URL);
        
        ws.onopen = () => console.log("🟢 WebSocket Connected");
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log("WS data:", data);
            setGameState(data);
        };
        
        ws.onclose = () => {
            console.log("🔴 WebSocket Disconnected, retrying...");
            reconnectTimer = setTimeout(connect, 1000);
        };
        
        ws.onerror = (err) => {
            console.error("WebSocket error:", err);
            ws.close();
        };
    };

    connect();

    return () => {
        clearTimeout(reconnectTimer);
        if (ws) ws.close();
    };
}, []);

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
    }, 100);
    return () => clearInterval(frameInterval);
  }, []);

  useEffect(() => {
    let interval;
    if (isGameActive && localTime > 0) {
      interval = setInterval(() => {
        setLocalTime((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isGameActive]); 

  const formatTime = (time) => {
    if (time === undefined || time === null) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const formatMorseStyle = (morseString) => {
    if (!morseString) return "";
    return morseString.replace(/\./g, '•').replace(/-/g, '—');
  };

  // ERROR FLASH LOGIC
  const expectedMorse = gameState?.targetLetter ? MORSE_CODE[gameState.targetLetter] : "";
  const currentInput = gameState?.currentSequence || "";
  const isError = currentInput.length > 0 && !expectedMorse.startsWith(currentInput);

  // Trigger the 800ms flash when an error occurs
  useEffect(() => {
    if (isError) {
      setDisplayError(true);
      const timer = setTimeout(() => setDisplayError(false), 800);
      return () => clearTimeout(timer);
    } else {
      setDisplayError(false);
    }
  }, [isError, currentInput]);

  // Helper to render the sequence beautifully
  const renderVisualizer = () => {
    // 1. If we are currently flashing the error
    if (displayError) {
      return (
        <span className="text-red-500 font-black uppercase tracking-widest text-2xl md:text-4xl animate-pulse drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">
          INCORRECT
        </span>
      );
    }

    // 2. If there is no input OR the error flash finished (reset back to waiting)
    if (!currentInput || isError) {
      return <span className="animate-pulse text-gray-800 tracking-[0.3em]">_</span>;
    }

    // 3. Default green output if correct
    return (
      <span className="text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.6)] tracking-[0.3em] ml-[0.15em] text-5xl md:text-7xl">
        {formatMorseStyle(currentInput)}
      </span>
    );
  };

  return (
    <div className="relative h-screen bg-[#0B1120] text-white overflow-hidden flex flex-col items-center [font-family:Oxanium,sans-serif]">
      
      <Webcam
        audio={false}
        ref={webcamRef}
        mirrored={true}
        screenshotFormat="image/jpeg"
        className={`absolute object-cover transition-all duration-700 ease-in-out z-0 ${
          countdown > 0 
            ? "inset-0 w-full h-full opacity-30 pointer-events-none" 
       
            : "top-4 left-1/2 -translate-x-1/2 w-40 h-30 rounded-2xl border-2 border-cyan-800 shadow-[0_0_20px_rgba(8,145,178,0.4)] z-50 opacity-100"
        }`} 
      />

      {countdown > 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 w-full h-full bg-black/50 backdrop-blur-sm">
          <h1 className="text-4xl text-cyan-400 mb-4 tracking-wider uppercase">Calibrating AI...</h1>
          <p className="text-9xl font-black animate-pulse text-white drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]">
            {countdown}
          </p>
          <p className="mt-8 text-gray-200 text-lg font-bold bg-black/40 px-6 py-2 rounded-full">
            Center your face in the camera and open your eyes.
          </p>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 max-w-7xl mx-auto z-10 relative">
          
          {/* CHEAT SHEET */}
          <div className="absolute top-4 right-6 w-40 md:w-48 bg-gray-900/80 border border-gray-700 rounded-xl p-3 shadow-lg flex flex-col space-y-2 z-50 hidden md:flex">
             <p className="text-cyan-500 text-[10px] uppercase tracking-widest text-center font-bold mb-1 border-b border-gray-700 pb-1">Controls</p>
             <div className="flex justify-between items-center text-sm font-bold text-gray-300">
                <span>Right Wink</span> 
                <span className="text-green-400 text-lg">•</span>
             </div>
             <div className="flex justify-between items-center text-sm font-bold text-gray-300">
                <span>Left Wink</span> 
                <span className="text-green-400 text-lg">—</span>
             </div>
          </div>

          {/* Top HUD  */}
          <div className="flex justify-between items-center w-full md:w-2/3 mb-6 bg-gray-900/60 p-4 rounded-[28px] border-2 border-cyan-900/30 shadow-lg mt-32">
            <div className="text-center w-24 md:w-32">
              <p className="text-gray-400 text-xs md:text-sm uppercase tracking-widest mb-1 font-bold">Level</p>
              <p className="text-3xl md:text-4xl font-black text-cyan-400">{gameState?.level || 1}</p>
            </div>
            
            <div className="text-center">
              <p className="text-gray-400 text-xs md:text-sm uppercase tracking-widest mb-1 font-bold">Time</p>
              <p className="text-4xl md:text-5xl font-black text-white tracking-wider drop-shadow-md">
                {formatTime(localTime)}
              </p>
            </div>

            <div className="text-center w-24 md:w-32">
              <p className="text-gray-400 text-xs md:text-sm uppercase tracking-widest mb-1 font-bold">Score</p>
              <p className="text-3xl md:text-4xl font-black text-green-400">{gameState?.score || 0}</p>
            </div>
          </div>

          {/* Target Word Highlighting & Hint */}
          <div className="text-center mb-6">
            <p className="text-gray-500 text-sm md:text-lg tracking-[0.2em] uppercase mb-2 md:mb-4 font-bold">Target Word</p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-6">
              {gameState?.targetWord?.split('').map((letter, index) => {
                const isCurrentTarget = letter === gameState?.targetLetter;
                const hint = MORSE_CODE[letter];

                return (
                  <div key={index} className="flex flex-col items-center">
                     <span 
                      className={`text-6xl md:text-8xl font-black uppercase transition-all duration-300 ${
                        wordSuccessFlash
                          ? "text-green-400 scale-110 drop-shadow-[0_0_40px_rgba(74,222,128,1)] z-20"
                          : isCurrentTarget 
                            ? "text-cyan-400 scale-105 drop-shadow-[0_0_25px_rgba(34,211,238,0.8)]" 
                            : "text-gray-700"
                      }`}
                    >
                      {letter}
                    </span>
                    
                    {/* The Morse Code Hint Dropdown */}
                    <div className={`mt-2 text-xl md:text-2xl font-bold tracking-[0.2em] transition-all duration-300 ${
                      isCurrentTarget ? "text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)] opacity-100" : "opacity-0"
                    }`}>
                      {formatMorseStyle(hint)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Morse Code Input Visualizer*/}
          <div className="flex flex-col items-center justify-center w-full md:w-2/3 bg-gray-900/80 p-4 md:p-6 rounded-[32px] border-4 border-[#0B1120] shadow-[0_0_40px_rgba(8,145,178,0.15)] relative overflow-hidden">
             <p className="text-cyan-600/80 text-xs md:text-sm uppercase tracking-[0.3em] font-bold mb-3">Detected Signal</p>
             
             {/* Dynamic border that flashes red with displayError */}
             <div className={`h-20 md:h-24 w-full bg-black/60 rounded-2xl border flex items-center justify-center overflow-hidden transition-all duration-300 relative ${
                displayError ? 'border-red-500 bg-red-950/30 shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'border-gray-800'
             }`}>
                {renderVisualizer()}
             </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default GameScreen;