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
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />

      {/* overlay */}
      <div className="absolute inset-0 bg-[#020617]/70" />

      {/* logos */}
      <div className="absolute top-6 left-6 md:top-8 md:left-10 z-20">
        <img src={techhub} className="h-14 md:h-20 opacity-85" />
      </div>

      <div className="absolute top-6 right-6 md:top-8 md:right-10 z-20">
        <img src={fcit} className="h-14 md:h-20 opacity-80" />
      </div>

      {/* content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        
        <div className="max-w-3xl w-full bg-slate-900/50 backdrop-blur-lg border border-cyan-300/20 rounded-3xl p-8 md:p-12 text-center shadow-[0_0_40px_rgba(34,211,238,0.1)]">

          <h1 className="text-4xl md:text-6xl font-bold mb-6 [font-family:Oxanium,sans-serif]">
            Instructions
          </h1>

          <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-4">
            Look at the camera and follow the instructions.
          </p>

          <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-4">
            Your facial expressions will be translated into Morse signals.
          </p>

          <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-8">
            Stay focused and enjoy the experience.
          </p>

          {/* button */}
          <button
            onClick={() => navigate('/3')}
            className="px-8 py-3 rounded-full bg-cyan-500/90 hover:bg-cyan-400 text-white font-semibold text-lg shadow-[0_0_25px_rgba(34,211,238,0.25)] transition"
          >
            Continue
          </button>

        </div>
      </div>
    </div>
  );
};

export default Screen2;