import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import techhub from "../assets/techhub.png";
import fcit from "../assets/fcit.png";
import bg from "../assets/background.png";
import crown from "../assets/crown.png";
import star from "../assets/star.png";
import win from "../assets/win.png";

const BACKEND_URL = "http://localhost:8000";

const LeaderboardScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPlayerData = location.state; // { score, avatar } passed from GameScreen

  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/leaderboard`)
      .then(res => res.json())
      .then(data => { setLeaderboard(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const highestScore = leaderboard[0] || null;

  const currentPlayerRank = currentPlayerData
    ? leaderboard.filter(e => e.score > currentPlayerData.score).length + 1
    : null;

  // Group by date, keep top score per day
  const dailyWinnersMap = {};
  leaderboard.forEach(entry => {
    if (!dailyWinnersMap[entry.date] || entry.score > dailyWinnersMap[entry.date].score) {
      dailyWinnersMap[entry.date] = entry;
    }
  });
  const dailyWinners = Object.entries(dailyWinnersMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, entry], index) => ({ label: `Day ${index + 1}`, ...entry }));

  const getName = (entry) => (entry?.username || "PLAYER");

  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      {/* background */}
      <img
        src={bg}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* logos */}
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

      {/* content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start px-3 sm:px-5 md:px-6 text-center gap-4 sm:gap-5 py-16 sm:py-20 md:py-24">
        {/* title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold [font-family:Oxanium,sans-serif] animate-game delay-1 mt-6 sm:mt-8 md:mt-10 leading-tight">
          Leaderboard
        </h1>

        {loading ? (
          <p className="text-cyan-400 text-lg animate-pulse">Loading scores...</p>
        ) : (
          <>
            {/* top section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-5 w-full max-w-[95vw] md:max-w-5xl xl:max-w-6xl animate-game delay-2">
              {/* Highest Score */}
              <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-300/20 rounded-3xl p-3 sm:p-4 md:p-5 shadow-[0_0_40px_rgba(34,211,238,0.1)] text-left hover:scale-[1.02] transition duration-300 min-w-0">
                <h2 className="mb-2 sm:mb-3">
                  <div className="flex items-center gap-2">
                    <img src={crown} alt="crown" className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                    <span className="text-cyan-400 text-sm sm:text-lg md:text-2xl font-semibold leading-tight">
                      Highest Score
                    </span>
                  </div>
                </h2>

                <div className="rounded-3xl border border-cyan-300/30 bg-cyan-400/10 px-3 py-4 sm:px-4 sm:py-5 md:px-5 md:py-6 flex flex-col items-center justify-center text-center shadow-[0_0_30px_rgba(34,211,238,0.12)] floatCard min-h-[160px] sm:min-h-[190px] md:min-h-[210px]">
                  {highestScore ? (
                    <>
                      <div className="text-3xl sm:text-4xl md:text-6xl mb-2 sm:mb-3">{highestScore.avatar}</div>
                      <div className="text-white text-sm sm:text-base md:text-xl font-semibold mb-1">
                        {getName(highestScore)}
                      </div>
                      <div className="text-cyan-300 text-xs sm:text-sm md:text-lg font-medium mb-1 sm:mb-2">
                        {`Day ${Object.keys(dailyWinnersMap).sort().indexOf(highestScore.date) + 1}`}
                      </div>
                      <div className="text-white text-lg sm:text-xl md:text-3xl font-bold">{highestScore.score} pts</div>
                      <div className="mt-2 sm:mt-3 text-slate-300 text-[10px] sm:text-xs md:text-base leading-snug">
                        All-time top score
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-400 text-sm">No scores yet</div>
                  )}
                </div>
              </div>

              {/* Current Player */}
              <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-300/20 rounded-3xl p-3 sm:p-4 md:p-5 shadow-[0_0_40px_rgba(34,211,238,0.1)] text-left hover:scale-[1.02] transition duration-300 min-w-0">
                <h2 className="mb-2 sm:mb-3">
                  <div className="flex items-center gap-2">
                    <img src={star} alt="star" className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                    <span className="text-cyan-400 text-sm sm:text-lg md:text-2xl font-semibold leading-tight">
                      Current Player
                    </span>
                  </div>
                </h2>

                <div className="rounded-3xl border border-cyan-300/40 bg-cyan-400/15 px-3 py-4 sm:px-4 sm:py-5 md:px-5 md:py-6 flex flex-col items-center justify-center text-center shadow-[0_0_35px_rgba(34,211,238,0.18)] glowPulse min-h-[160px] sm:min-h-[190px] md:min-h-[210px]">
                  {currentPlayerData ? (
                    <>
                      <div className="text-3xl sm:text-4xl md:text-6xl mb-2 sm:mb-3">{currentPlayerData.avatar}</div>
                      <div className="text-white text-sm sm:text-base md:text-xl font-semibold mb-1">
                        {currentPlayerData.username || "PLAYER"}
                      </div>
                      <div className="text-white text-base sm:text-lg md:text-2xl font-bold mb-1 sm:mb-2">
                        {currentPlayerData.score} pts
                      </div>
                      <div className="text-cyan-300 text-xs sm:text-sm md:text-lg font-medium">
                        Rank #{currentPlayerRank}
                      </div>
                      <div className="mt-2 sm:mt-3 text-slate-300 text-[10px] sm:text-xs md:text-base leading-snug">
                        Your score today
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-400 text-sm">Play a game to see your score here</div>
                  )}
                </div>
              </div>
            </div>

            {/* Daily Winners */}
            {dailyWinners.length > 0 && (
              <div className="w-full max-w-[92vw] md:max-w-4xl xl:max-w-6xl animate-game delay-3">
                <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-300/20 rounded-3xl p-4 sm:p-5 md:p-6 shadow-[0_0_40px_rgba(34,211,238,0.1)] text-left">
                  <h2 className="mb-3 sm:mb-4">
                    <div className="flex items-center gap-2">
                      <img src={win} alt="win" className="w-7 h-7 sm:w-8 sm:h-8" />
                      <span className="text-cyan-400 text-lg sm:text-xl md:text-2xl font-semibold">
                        Daily Winners
                      </span>
                    </div>
                  </h2>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                    {dailyWinners.map((winner, index) => (
                      <div
                        key={index}
                        className="rounded-2xl px-3 py-4 sm:px-4 sm:py-5 bg-slate-800/50 border border-white/10 flex flex-col items-center text-center transition duration-300 hover:scale-105 hover:shadow-[0_0_25px_rgba(34,211,238,0.12)] animate-game min-h-[140px] sm:min-h-[160px]"
                      >
                        <div className="text-cyan-300 font-semibold text-sm sm:text-base md:text-lg mb-1 sm:mb-2">
                          {winner.label}
                        </div>
                        <div className="text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-3 floatSmall">
                          {winner.avatar}
                        </div>
                        <div className="text-white text-xs sm:text-sm md:text-base font-semibold mb-1">
                          {getName(winner)}
                        </div>
                        <div className="text-white text-xs sm:text-sm md:text-lg font-semibold">
                          {winner.score} pts
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* button */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-game delay-3 pt-1 sm:pt-2">
          <button
            onClick={() => navigate('/')}
            className="px-6 sm:px-8 md:px-10 py-3 sm:py-4 rounded-2xl bg-cyan-500/90 hover:bg-cyan-400 text-white text-sm sm:text-base md:text-lg font-semibold shadow-[0_0_25px_rgba(34,211,238,0.25)] hover:scale-105 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardScreen;
