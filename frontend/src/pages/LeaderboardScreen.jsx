import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import techhub from "../assets/techhub.png";
import fcit from "../assets/fcit.png";
import bg from "../assets/background.png";
import star from "../assets/star.png";
import win from "../assets/win.png";

const BACKEND_URL = "http://localhost:8000";

const LeaderboardScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPlayerData = location.state;

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/leaderboard`)
      .then(res => res.json())
      .then(data => {
        setLeaderboard(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.score - a.score);
  const top10Leaderboard = sortedLeaderboard.slice(0, 10);

  const currentPlayerRank = currentPlayerData
    ? sortedLeaderboard.filter(e => e.score > currentPlayerData.score).length + 1
    : null;

  const getName = (entry) => entry?.username || "PLAYER";

  const isCurrentPlayer = (player) => {
    return (
      currentPlayerData &&
      player.username === currentPlayerData.username &&
      player.score === currentPlayerData.score
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <img
        src={bg}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      <div className="absolute top-3 left-3 sm:top-5 sm:left-5 md:top-6 md:left-8 z-20">
        <img
          src={techhub}
          alt="TechHub"
          className="h-9 sm:h-10 md:h-14 lg:h-18 opacity-85 animate-game delay-1"
        />
      </div>

      <div className="absolute top-3 right-3 sm:top-5 sm:right-5 md:top-6 md:right-8 z-20">
        <img
          src={fcit}
          alt="FCIT"
          className="h-9 sm:h-10 md:h-14 lg:h-18 opacity-80 animate-game delay-1"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 py-20 px-4">
        <h1 className="text-4xl md:text-5xl font-bold [font-family:Oxanium,sans-serif]">
          Leaderboard
        </h1>

        {loading ? (
          <p className="text-cyan-400 animate-pulse">Loading...</p>
        ) : (
          <>
            <div className="w-full max-w-xl bg-slate-900/60 border border-cyan-300/20 rounded-3xl p-6 text-center shadow-lg">
              <div className="flex justify-center items-center gap-2 mb-3">
                <img src={star} alt="star" className="w-6" />
                <h2 className="text-cyan-400 text-xl font-semibold">
                  Your Score
                </h2>
              </div>

              {currentPlayerData ? (
                <>
                  <div className="text-5xl mb-2">
                    {currentPlayerData.avatar}
                  </div>

                  <div className="text-lg font-semibold">
                    {currentPlayerData.username || "PLAYER"}
                  </div>

                  <div className="text-2xl font-bold mt-1">
                    {currentPlayerData.score} pts
                  </div>

                  <div className="text-cyan-300 mt-2">
                    Rank #{currentPlayerRank}
                  </div>
                </>
              ) : (
                <p className="text-slate-400">
                  Play a game to see your score
                </p>
              )}
            </div>

            <div className="w-full max-w-5xl bg-slate-900/60 border border-cyan-300/20 rounded-3xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <img src={win} alt="win" className="w-7" />
                <h2 className="text-cyan-400 text-xl font-semibold">
                  Top Players
                </h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {top10Leaderboard.map((player, index) => {
                  const highlighted = isCurrentPlayer(player);

                  return (
                    <div
                      key={index}
                      className={`rounded-2xl p-4 text-center hover:scale-105 transition duration-300 ${
                        highlighted
                          ? "bg-cyan-400/20 border-2 border-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.35)]"
                          : "bg-slate-800/60 border border-white/10"
                      }`}
                    >
                      <div
                        className={
                          highlighted
                            ? "text-white font-bold mb-1"
                            : "text-cyan-300 font-semibold mb-1"
                        }
                      >
                        #{index + 1}
                      </div>

                      <div className="text-4xl mb-2">
                        {player.avatar}
                      </div>

                      <div className="text-sm font-semibold break-words">
                        {getName(player)}
                      </div>

                      <div className="text-lg font-bold">
                        {player.score} pts
                      </div>

                      {highlighted && (
                        <div className="mt-2 text-[10px] md:text-xs text-cyan-100 font-semibold tracking-wide">
                          YOU
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 font-semibold shadow-lg"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default LeaderboardScreen;