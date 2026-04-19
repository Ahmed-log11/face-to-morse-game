import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import eye from "../assets/eye2.svg";
import techhub from "../assets/techhub.png";
import fcit from "../assets/fcit.png";
import bg from "../assets/background.png"; 

const Welcome = () => {
  const navigate = useNavigate();

  const [position, setPosition] = useState(0);
  const [dragging, setDragging] = useState(false);

  const handleMouseMove = (e) => {
    if (!dragging) return;

    const rect = e.currentTarget.getBoundingClientRect();
    let x = e.clientX - rect.left;

    const sliderWidth = 56;

    if (x < 0) x = 0;
    if (x > rect.width - sliderWidth - 4) x = rect.width - sliderWidth - 4;

    setPosition(x);

    if (x >= rect.width - sliderWidth - 8) {
      navigate('/instructions');
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setPosition(0);
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white">

      {/* background */}
      <img
        src={bg}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* glow */}
      <div className="absolute top-[140px] left-1/2 -translate-x-1/2 w-[300px] sm:w-[400px] md:w-[500px] h-[140px] sm:h-[160px] md:h-[180px] bg-blue-500/5 blur-3xl rounded-full" />

      {/* logos */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-10 z-20">
        <img
          src={techhub}
          alt="TechHub"
          className="h-10 sm:h-12 md:h-20 opacity-85 animate-fadeUp delay-1"
        />
      </div>

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-10 z-20">
        <img
          src={fcit}
          alt="FCIT"
          className="h-10 sm:h-12 md:h-20 opacity-80 animate-fadeUp delay-1"
        />
      </div>

      {/* content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 text-center gap-4 sm:gap-6">
        
        {/* title */}
        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-wide [font-family:Oxanium,sans-serif] animate-fadeUp delay-2 mt-8 sm:mt-10">
          Face to Morse
        </h1>

        {/* description */}
        <p className="max-w-[90%] sm:max-w-2xl text-xs sm:text-sm md:text-lg text-slate-300 animate-fadeUp delay-3">
          Transforms facial expressions into Morse-inspired communication
        </p>

        {/* eye */}
        <div className="flex justify-center items-center w-full h-[170px] sm:h-[210px] md:h-[240px]">
          <img
            src={eye}
            alt="Eye"
            className="w-[300px] sm:w-[360px] md:w-[420px] opacity-85 drop-shadow-[0_0_25px_rgba(56,189,248,0.25)] animate-zoomIn delay-4"
          />
        </div>

        {/* slider */}
        <div
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="mt-4 sm:mt-6 w-[260px] sm:w-[300px] md:w-[340px] h-12 sm:h-14 bg-slate-900/80 rounded-2xl relative flex items-center border border-cyan-300/20 overflow-hidden animate-fadeUp delay-5"
        >
          <p className="absolute w-full text-center pl-5 sm:pl-7 text-white/60 text-[10px] sm:text-sm tracking-[0.12em]">
            SLIDE TO START
          </p>

          <div
            onMouseDown={() => setDragging(true)}
            style={{ transform: `translateX(${position}px)` }}
            className="ml-1 w-12 sm:w-14 h-10 sm:h-12 bg-white rounded-2xl flex items-center justify-center z-10 cursor-pointer"
          >
            <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-2xl border-2 border-cyan-400"></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Welcome;