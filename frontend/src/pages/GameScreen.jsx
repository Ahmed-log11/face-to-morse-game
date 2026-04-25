import React, { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { useLocation, useNavigate } from "react-router-dom";

const AVATARS = ["🤖", "🐱", "🦊", "🐼", "👾", "🐯", "🐸", "🐧", "🦁", "🦄"];

const BACKEND_URL = "http://localhost:8000";
const WS_URL = "ws://localhost:8000/ws";

const CHAOS_GIF_URLS = Object.entries(
  import.meta.glob("../assets/*.gif", { eager: true, import: "default" }),
)
  .filter(([path]) => /\/\d+\.gif$/i.test(path))
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, url]) => url);

// The cheat sheet for the UI
const MORSE_CODE = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
};

const GameScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const webcamRef = useRef(null);
  const wsRef = useRef(null);
  const [gameState, setGameState] = useState(null);
  const [countdown, setCountdown] = useState(3);
  const [isGameActive, setIsGameActive] = useState(false);

  const [localTime, setLocalTime] = useState(120);
  const [wordSuccessFlash, setWordSuccessFlash] = useState(false);
  const prevScoreRef = useRef(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameOverMessage, setGameOverMessage] = useState("Time's Up!");
  const gameEndedRef = useRef(false);
  const gameStartedRef = useRef(false);
  const avatarRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [level2HintIndex, setLevel2HintIndex] = useState(null);
  const [level3HintVisible, setLevel3HintVisible] = useState(false);
  const level3HintTimerRef = useRef(null);
  const [level4HintGateOpen, setLevel4HintGateOpen] = useState(false);
  const level4HintTimerRef = useRef(null);
  const [chaosSprites, setChaosSprites] = useState(null);
  const usernameRef = useRef(
    (
      location?.state?.username ||
      (() => {
        try {
          return localStorage.getItem("ftm_username") || "";
        } catch {
          return "";
        }
      })()
    ).trim(),
  );

  const [displayError, setDisplayError] = useState(false);

  useEffect(() => {
    fetch(`${BACKEND_URL}/reset-detector`);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mq) return;
    const update = () => setReducedMotion(Boolean(mq.matches));
    update();
    mq.addEventListener?.("change", update);
    return () => mq.removeEventListener?.("change", update);
  }, []);

  useEffect(() => {
    if (avatarRef.current === null) {
      avatarRef.current = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    }
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
      wsRef.current = ws;

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
      if (wsRef.current === ws) wsRef.current = null;
    };
  }, []);

	  useEffect(() => {
	    if (countdown > 0) {
	      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
	      return () => clearTimeout(timer);
	    } else if (countdown === 0 && !isGameActive) {
	      setIsGameActive(true);
	      fetch(`${BACKEND_URL}/start-game`)
	        .then((res) => res.json())
	        .then((state) => {
	          setGameState(state);
	          gameStartedRef.current = true;
	        })
	        .catch((err) => {
	          console.error("Error starting game:", err);
	        });
	    }
	  }, [countdown, isGameActive]);

  useEffect(() => {
    if (!isGameActive) return;
    const interval = setInterval(() => {
      const ws = wsRef.current;
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send("ping");
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isGameActive]);

  useEffect(() => {
    const frameInterval = setInterval(async () => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
          const base64Data = imageSrc.split(",")[1];
          try {
            await fetch(`${BACKEND_URL}/process-frame`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ frame: base64Data }),
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
    if (isGameActive && typeof gameState?.timeLeft === "number") {
      setLocalTime(gameState.timeLeft);
    }
  }, [isGameActive, gameState?.timeLeft]);

  useEffect(() => {
    const isEnded =
      isGameActive &&
      gameStartedRef.current &&
      !gameEndedRef.current &&
      (gameState?.endReason ||
        (localTime === 0 && gameState?.isActive === false));

    if (isEnded) {
      gameEndedRef.current = true;
      setGameOver(true);
      setGameOverMessage(
        gameState?.endReason === "FINISHED_ALL_LEVELS"
          ? "YOU WIN!"
          : "Time's Up!",
      );
      const finalScore = gameState?.score || 0;
      const avatar = avatarRef.current;
      const username = usernameRef.current || "PLAYER";
      (async () => {
        try {
          await fetch(`${BACKEND_URL}/submit-score`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ score: finalScore, avatar, username }),
          });
        } catch {
          // ignore submit errors; still navigate
        }
        navigate("/leaderboard", {
          state: { score: finalScore, avatar, username },
        });
      })();
    }
  }, [
    localTime,
    isGameActive,
    gameState?.isActive,
    gameState?.endReason,
    gameState?.score,
    navigate,
  ]);

  const formatTime = (time) => {
    if (time === undefined || time === null) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const formatMorseStyle = (morseString) => {
    if (!morseString) return "";
    return morseString.replace(/\./g, "•").replace(/-/g, "—");
  };

  const renderMorseHint = (morseString, isCurrentTarget) => {
    const styled = formatMorseStyle(morseString);
    if (!styled) return null;

    if (reducedMotion) {
      return styled;
    }

    const renderPerSlotScramble = () => (
      <span className="inline-flex items-center justify-center gap-2">
        {Array.from(styled).map((ch, idx) => (
          <span
            key={idx}
            className={`inline-block w-[1.1ch] text-center transition-opacity duration-75 ${
              level2HintIndex === idx ? "opacity-100" : "opacity-15 blur-[1px]"
            }`}
          >
            {level2HintIndex === idx ? ch : "·"}
          </span>
        ))}
      </span>
    );

    if (gameState?.level === 2 && isCurrentTarget) {
      // Reveal one symbol at a time, but keep each symbol in its own position.
      return renderPerSlotScramble();
    }

    if (gameState?.level === 3 && isCurrentTarget) {
      if (!level3HintVisible) {
        return <span className="opacity-0 select-none">{styled}</span>;
      }
      return styled;
    }

    if (gameState?.level === 4 && isCurrentTarget) {
      // Mix of level 2 + 3: scrambled, but only during a short gate window per letter.
      if (!level4HintGateOpen) {
        return <span className="opacity-0 select-none">{styled}</span>;
      }
      return renderPerSlotScramble();
    }

    return styled;
  };

  // ERROR FLASH LOGIC
  const expectedMorse = gameState?.targetLetter
    ? MORSE_CODE[gameState.targetLetter]
    : "";
  const currentInput = gameState?.currentSequence || "";
  const isError =
    currentInput.length > 0 && !expectedMorse.startsWith(currentInput);

  useEffect(() => {
    const scrambleActive =
      isGameActive &&
      !reducedMotion &&
      (gameState?.level === 2 ||
        (gameState?.level === 4 && level4HintGateOpen));

    if (!scrambleActive) {
      setLevel2HintIndex(null);
      return;
    }

    const targetLetter = gameState?.targetLetter;
    const morse = targetLetter ? MORSE_CODE[targetLetter] : "";
    if (!morse) {
      setLevel2HintIndex(null);
      return;
    }

    const buildOrder = () => {
      const lastIndex = morse.length - 1;
      const rest = [];
      for (let i = 0; i < lastIndex; i += 1) rest.push(i);
      for (let i = rest.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [rest[i], rest[j]] = [rest[j], rest[i]];
      }
      return [lastIndex, ...rest];
    };

    let cancelled = false;
    let order = buildOrder();
    let pos = 0;

    // Slightly slower than before, but still "blink and you miss it".
    const showMs = 170;
    const hideMs = 150;

    const stepShow = () => {
      if (cancelled) return;
      const idx = order[pos];
      setLevel2HintIndex(idx);
      setTimeout(stepHide, showMs);
    };

    const stepHide = () => {
      if (cancelled) return;
      setLevel2HintIndex(null);
      pos += 1;
      if (pos >= order.length) {
        order = buildOrder();
        pos = 0;
      }
      setTimeout(stepShow, hideMs);
    };

    stepShow();

    return () => {
      cancelled = true;
    };
  }, [
    isGameActive,
    reducedMotion,
    gameState?.level,
    gameState?.targetLetter,
    level4HintGateOpen,
  ]);

  useEffect(() => {
    if (level3HintTimerRef.current) {
      clearTimeout(level3HintTimerRef.current);
      level3HintTimerRef.current = null;
    }

    if (
      !isGameActive ||
      reducedMotion ||
      gameState?.level !== 3 ||
      !gameState?.targetLetter
    ) {
      setLevel3HintVisible(false);
      return;
    }

    setLevel3HintVisible(true);
    level3HintTimerRef.current = setTimeout(() => {
      setLevel3HintVisible(false);
      level3HintTimerRef.current = null;
    }, 1500);

    return () => {
      if (level3HintTimerRef.current) {
        clearTimeout(level3HintTimerRef.current);
        level3HintTimerRef.current = null;
      }
    };
  }, [isGameActive, reducedMotion, gameState?.level, gameState?.targetLetter]);

  useEffect(() => {
    if (!isGameActive || reducedMotion || gameState?.level !== 3) return;
    if (!isError) return;

    if (level3HintTimerRef.current) {
      clearTimeout(level3HintTimerRef.current);
      level3HintTimerRef.current = null;
    }

    setLevel3HintVisible(true);
    level3HintTimerRef.current = setTimeout(() => {
      setLevel3HintVisible(false);
      level3HintTimerRef.current = null;
    }, 1500);
  }, [isGameActive, reducedMotion, gameState?.level, isError]);

  useEffect(() => {
    if (level4HintTimerRef.current) {
      clearTimeout(level4HintTimerRef.current);
      level4HintTimerRef.current = null;
    }

    if (
      !isGameActive ||
      reducedMotion ||
      gameState?.level !== 4 ||
      !gameState?.targetLetter
    ) {
      setLevel4HintGateOpen(false);
      return;
    }

    setLevel4HintGateOpen(true);
    level4HintTimerRef.current = setTimeout(() => {
      setLevel4HintGateOpen(false);
      level4HintTimerRef.current = null;
    }, 1400);

    return () => {
      if (level4HintTimerRef.current) {
        clearTimeout(level4HintTimerRef.current);
        level4HintTimerRef.current = null;
      }
    };
  }, [isGameActive, reducedMotion, gameState?.level, gameState?.targetLetter]);

  useEffect(() => {
    if (!isGameActive || reducedMotion || gameState?.level !== 4) {
      setChaosSprites(null);
      return;
    }

    if (chaosSprites) return;

    const sources =
      CHAOS_GIF_URLS.length > 0
        ? CHAOS_GIF_URLS
        : Array.from({ length: 10 }, (_, i) => `/chaos/${i + 1}.gif`);

    const vw = window.innerWidth || 1200;
    const vh = window.innerHeight || 800;
    const minSide = Math.min(vw, vh);

    // Place GIFs evenly around the edges, keeping the center clear for gameplay.
    const margin = Math.max(16, Math.min(44, Math.round(minSide * 0.04)));
    const baseSize = Math.max(64, Math.min(104, Math.round(minSide * 0.09)));

    const topCount = 6;
    const bottomCount = 6;
    const sideCount = 4;

    const slots = [];
    const usableW = Math.max(1, vw - margin * 2);
    const usableH = Math.max(1, vh - margin * 2);

    for (let i = 0; i < topCount; i += 1) {
      slots.push({
        cx: Math.round(margin + (usableW * (i + 1)) / (topCount + 1)),
        cy: margin,
      });
    }
    for (let i = 0; i < bottomCount; i += 1) {
      slots.push({
        cx: Math.round(margin + (usableW * (i + 1)) / (bottomCount + 1)),
        cy: vh - margin,
      });
    }
    for (let i = 0; i < sideCount; i += 1) {
      slots.push({
        cx: margin,
        cy: Math.round(margin + (usableH * (i + 1)) / (sideCount + 1)),
      });
      slots.push({
        cx: vw - margin,
        cy: Math.round(margin + (usableH * (i + 1)) / (sideCount + 1)),
      });
    }

    setChaosSprites(
      slots.map((slot, i) => {
        const src = sources[i % sources.length];
        const size = baseSize - (i % 3) * 6;
        const floatDur = 2.0 + (i % 4) * 0.25; // 2.0..2.75
        const delay = (i % 5) * 0.06;
        return {
          key: `${i}-${Date.now()}`,
          src,
          size,
          left: `${slot.cx - Math.round(size / 2)}px`,
          top: `${slot.cy - Math.round(size / 2)}px`,
          floatDur,
          delay,
        };
      }),
    );
  }, [isGameActive, reducedMotion, gameState?.level, chaosSprites]);

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
      return (
        <span className="animate-pulse text-gray-800 tracking-[0.3em]">_</span>
      );
    }

    // 3. Default green output if correct
    return (
      <span className="text-green-400 drop-shadow-[0_0_15px_rgba(74,222,128,0.6)] tracking-[0.3em] ml-[0.15em] text-5xl md:text-7xl">
        {formatMorseStyle(currentInput)}
      </span>
    );
  };

  return (
    <div
      className={`relative h-screen bg-[#0B1120] text-white overflow-hidden flex flex-col items-center [font-family:Oxanium,sans-serif] ${
        gameState?.level === 4 && !reducedMotion ? "chaos-shake" : ""
      }`}
    >
      {gameState?.level === 4 && !reducedMotion && chaosSprites && (
        <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
          {chaosSprites.map((s) => (
            <img
              key={s.key}
              src={s.src}
              alt=""
              className="chaos-corner-cat"
              style={{
                left: s.left,
                top: s.top,
                width: `${s.size}px`,
                height: "auto",
                animationDelay: `${s.delay}s`,
                "--floatDur": `${s.floatDur}s`,
              }}
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ))}
        </div>
      )}

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
        style={{
          transform:
            gameState?.level === 4 && countdown === 0
              ? "rotate(180deg)"
              : undefined,
        }}
      />

      {gameOver && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm">
          <p className="text-cyan-400 text-xl uppercase tracking-widest mb-4 font-bold animate-pulse">
            {gameOverMessage}
          </p>
          <h1 className="text-7xl md:text-9xl font-black text-white drop-shadow-[0_0_40px_rgba(34,211,238,0.6)] mb-6">
            GAME OVER
          </h1>
          <p className="text-3xl md:text-4xl font-bold text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.6)]">
            {gameState?.score || 0} pts
          </p>
          <p className="mt-6 text-gray-400 text-lg">
            Heading to leaderboard...
          </p>
        </div>
      )}

      {countdown > 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 w-full h-full bg-black/50 backdrop-blur-sm">
          <h1 className="text-4xl text-cyan-400 mb-4 tracking-wider uppercase">
            Calibrating AI...
          </h1>
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
            <p className="text-cyan-500 text-[10px] uppercase tracking-widest text-center font-bold mb-1 border-b border-gray-700 pb-1">
              Controls
            </p>
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
              <p className="text-gray-400 text-xs md:text-sm uppercase tracking-widest mb-1 font-bold">
                Level
              </p>
              <p className="text-3xl md:text-4xl font-black text-cyan-400">
                {gameState?.level || 1}
              </p>
            </div>

            <div className="text-center">
              <p className="text-gray-400 text-xs md:text-sm uppercase tracking-widest mb-1 font-bold">
                Time
              </p>
              <p className="text-4xl md:text-5xl font-black text-white tracking-wider drop-shadow-md">
                {formatTime(localTime)}
              </p>
            </div>

            <div className="text-center w-24 md:w-32">
              <p className="text-gray-400 text-xs md:text-sm uppercase tracking-widest mb-1 font-bold">
                Score
              </p>
              <p className="text-3xl md:text-4xl font-black text-green-400">
                {gameState?.score || 0}
              </p>
            </div>
          </div>

          {/* Word Highlighting & Hint */}
          <div className="text-center mb-6">
            <div className="flex flex-wrap justify-center gap-3 md:gap-6">
              {gameState?.targetWord?.split("").map((letter, index) => {
                const isCurrentTarget = index === gameState?.targetWordIndex;
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
                    <div
                      className={`mt-2 text-xl md:text-2xl font-bold tracking-[0.2em] transition-all duration-300 ${
                        isCurrentTarget
                          ? gameState?.level === 2
                            ? "text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]"
                            : "text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)] opacity-100"
                          : "opacity-0"
                      }`}
                    >
                      {renderMorseHint(hint, isCurrentTarget)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Morse Code Input Visualizer*/}
          <div className="flex flex-col items-center justify-center w-full md:w-2/3 bg-gray-900/80 p-4 md:p-6 rounded-[32px] border-4 border-[#0B1120] shadow-[0_0_40px_rgba(8,145,178,0.15)] relative overflow-hidden">
            <p className="text-cyan-600/80 text-xs md:text-sm uppercase tracking-[0.3em] font-bold mb-3">
              Detected Signal
            </p>

            {/* Dynamic border that flashes red with displayError */}
            <div
              className={`h-20 md:h-24 w-full bg-black/60 rounded-2xl border flex items-center justify-center overflow-hidden transition-all duration-300 relative ${
                displayError
                  ? "border-red-500 bg-red-950/30 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                  : "border-gray-800"
              }`}
            >
              {renderVisualizer()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameScreen;
