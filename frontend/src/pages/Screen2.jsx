import React from 'react';
import { useNavigate } from 'react-router-dom';
import techhub from "../assets/techhub.png";
import fcit from "../assets/fcit.png";
import bg from "../assets/background.png";

const Screen2 = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden text-white">

      {/* background */}
      <img
        src={bg}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* logos */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-10 z-20">
        <img
          src={techhub}
          alt="TechHub"
          className="h-10 sm:h-12 md:h-20 opacity-85 animate-game delay-1"
        />
      </div>

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-10 z-20">
        <img
          src={fcit}
          alt="FCIT"
          className="h-10 sm:h-12 md:h-20 opacity-80 animate-game delay-1"
        />
      </div>

      {/* content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 text-center gap-6 sm:gap-8">

        {/* title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold [font-family:Oxanium,sans-serif] animate-game delay-1 mt-8 sm:mt-10">
          Instructions &amp; Tutorial
        </h1>

        {/* boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 md:gap-8 w-full max-w-[95%] sm:max-w-5xl animate-game delay-2">

          {/* BOX 1 */}
          <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-300/20 rounded-3xl p-5 sm:p-6 md:p-8 shadow-[0_0_40px_rgba(34,211,238,0.1)] text-left">
            <h2 className="text-cyan-400 text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">
              About the Game
            </h2>

            <p className="text-slate-300 text-sm sm:text-base md:text-lg mb-5 leading-relaxed">
              Face to Morse is an interactive game that transforms your facial expressions
              into Morse code using eye movements.
            </p>

            <h3 className="text-cyan-300 text-base sm:text-lg font-semibold mb-3">
              Scoring
            </h3>

            <ul className="text-slate-300 text-sm sm:text-base md:text-lg space-y-2 sm:space-y-3 list-disc pl-5">
              <li>Correct signals = more points</li>
              <li>Faster completion = higher score</li>
              <li>Mistakes may reduce your score</li>
            </ul>
          </div>

          {/* BOX 2 */}
          <div className="bg-slate-900/50 backdrop-blur-lg border border-cyan-300/20 rounded-3xl p-5 sm:p-6 md:p-8 shadow-[0_0_40px_rgba(34,211,238,0.1)] text-left">
            <h2 className="text-cyan-400 text-lg sm:text-xl md:text-2xl font-semibold mb-3 sm:mb-4">
              Instructions
            </h2>

            <ul className="text-slate-300 text-sm sm:text-base md:text-lg space-y-2 sm:space-y-3 list-disc pl-5">
              <li>Stand in front of the camera</li>
              <li>Keep your face in the frame</li>
              <li>Follow the target word on screen</li>
              <li>
                <span className="text-cyan-300 font-medium">
                  Left wink = (-)
                </span>
              </li>
              <li>
                <span className="text-cyan-300 font-medium">
                  Right wink = (.)
                </span>
              </li>
              <li>Finish before time runs out</li>
            </ul>
          </div>
        </div>

        {/* button */}
        <button
          onClick={() => navigate('/3')}
          className="px-8 sm:px-10 py-3 sm:py-4 rounded-2xl bg-cyan-500/90 hover:bg-cyan-400 text-white text-base sm:text-lg font-semibold shadow-[0_0_25px_rgba(34,211,238,0.25)] hover:scale-105 transition animate-game delay-3 mt-2 sm:mt-4"
        >
          Continue
        </button>

      </div>
    </div>
  );
};

export default Screen2;