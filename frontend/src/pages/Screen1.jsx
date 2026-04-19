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

    if (x < 0) x = 0;
    if (x > rect.width - 56) x = rect.width - 56;

    setPosition(x);

    // إذا وصل النهاية ➜ انتقال
    if (x >= rect.width - 60) {
      navigate('/instructions');
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setPosition(0);
  };

  return (
    <div className="relative min-h-screen overflow-hidden text-white">

      {/* background image */}
      <img
        src={bg}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />

      {/* glow */}
      <div className="absolute bottom-[-80px] left-1/2 -translate-x-1/2 w-[700px] h-[260px] bg-cyan-400/10 blur-3xl rounded-full" />
      <div className="absolute top-[180px] left-1/2 -translate-x-1/2 w-[500px] h-[180px] bg-blue-500/5 blur-3xl rounded-full" />

      {/* logos */}
      <div className="absolute top-6 left-6 md:top-8 md:left-10 z-20">
        <img src={techhub} className="h-14 md:h-20 opacity-85" />
      </div>

      <div className="absolute top-6 right-6 md:top-8 md:right-10 z-20">
        <img src={fcit} className="h-14 md:h-20 opacity-80" />
      </div>

      {/* content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-start pt-40 px-6 text-center">
        
        <h1 className="text-5xl md:text-8xl font-bold tracking-wide [font-family:Oxanium,sans-serif]">
          Face to Morse
        </h1>

        <p className="max-w-2xl text-sm md:text-lg text-slate-300 mb-6">
          Transforms facial expressions into Morse-inspired communication
        </p>

        {/* eye */}
        <div className="flex justify-center items-center w-full h-[160px] md:h-[220px]">
          <img
            src={eye}
            alt="Eye"
            className="w-[320px] md:w-[400px] opacity-85 drop-shadow-[0_0_25px_rgba(56,189,248,0.25)] hover:scale-105 transition duration-500"
          />
        </div>

        {/* SLIDE BUTTON */}
        <div
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="mt-8 w-[300px] h-14 bg-slate-900/80 rounded-full relative flex items-center border border-cyan-300/20 overflow-hidden"
        >
          {/* text */}
          <p className="absolute w-full text-center pl-7 text-white/60 text-sm tracking-[0.12em]">
            SLIDE TO START
          </p>

          {/* circle */}
          <div
            onMouseDown={() => setDragging(true)}
            style={{ transform: `translateX(${position}px)` }}
            className="w-14 h-12 bg-white rounded-full flex items-center justify-center z-10 cursor-pointer"
          >
            <div className="w-4 h-4 rounded-full border-2 border-cyan-400"></div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Welcome;