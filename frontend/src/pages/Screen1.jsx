import React from 'react';
import eye from "../assets/eye2.svg";
import techhub from "../assets/techhub.png";
import fcit from "../assets/fcit.png";
import bg from "../assets/background.png"; 

const Welcome = ({ onStart }) => {
  return (
    <div className="relative min-h-screen overflow-hidden text-white">

      {/* background image */}
      <img
        src={bg}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />

      {/* dark overlay */}

      {/* background glow */}
      <div className="absolute bottom-[-80px] left-1/2 -translate-x-1/2 w-[700px] h-[260px] bg-cyan-400/10 blur-3xl rounded-full" />
      <div className="absolute top-[180px] left-1/2 -translate-x-1/2 w-[500px] h-[180px] bg-blue-500/5 blur-3xl rounded-full" />

      {/* logos */}
      <div className="absolute top-6 left-6 md:top-8 md:left-10 z-20">
        <img src={techhub} className="h-14 md:h-20 w-auto opacity-85" />
      </div>

      <div className="absolute top-6 right-6 md:top-8 md:right-10 z-20">
        <img src={fcit} className="h-14 md:h-20 w-auto opacity-80" />
      </div>

      {/* content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start pt-40 px-6 text-center">
        
        {/* title */}
        <h1 className="text-5xl md:text-8xl font-bold tracking-wide [font-family:Oxanium,sans-serif] drop-shadow-[0_0_18px_rgba(255,255,255,0.12)]">
          Face to Morse
        </h1>

        {/* subtitle */}
        <p className="max-w-2xl text-sm md:text-lg text-slate-300 mb-6 md:mb-8 leading-relaxed">
          Transforms facial expressions into Morse-inspired communication
        </p>

        {/* eye */}
        <div className="relative flex justify-center items-center w-full h-[160px] md:h-[220px]">
          <img
            src={eye}
            alt="Eye"
            className="w-[320px] md:w-[400px] opacity-85 drop-shadow-[0_0_25px_rgba(56,189,248,0.25)]"
          />
        </div>

        {/* tap */}
        <div
          onClick={onStart}
          className="mt-8 cursor-pointer select-none transition-transform duration-300 hover:-translate-y-2 hover:scale-[1.02]"
        >
          <div className="relative flex items-center bg-slate-900/80 border border-cyan-300/20 rounded-full pl-3 pr-20 py-2 shadow-[0_0_20px_rgba(34,211,238,0.08)] hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] transition">

            {/* circle */}
            <div className="w-14 h-12 rounded-full bg-white flex items-center justify-center z-10">
              <div className="w-4 h-4 rounded-full border-2 border-cyan-400"></div>
            </div>

            {/* text centered */}
            <p className="pl-12 text-white/60 text-sm md:text-base tracking-[0.12em] font-medium">
              TAP TO START
            </p>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Welcome;