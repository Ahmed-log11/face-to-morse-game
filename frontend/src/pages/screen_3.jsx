import React, { useState, useRef } from 'react';
import Webcam from "react-webcam"; 
import background from "../assets/background.svg"; 
import bottomPatternImage from "../assets/bottomPatternImage.png"; 

const Calibration = ({ onCalibrationComplete }) => {
  const [status, setStatus] = useState("Stand in front of the camera...");
  const webcamRef = useRef(null);

  return (
    <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
      <img src={background} alt="background" className="absolute inset-0 w-full h-full object-cover" />

      <div className="relative w-[95%] max-w-[1400px] h-[92vh] rounded-[34px] overflow-hidden shadow-2xl bg-[#5288A0] z-10 flex flex-col">
        
        <img 
          src={bottomPatternImage} 
          alt="card bottom pattern" 
          className="absolute bottom-0 left-0 w-full z-0 pointer-events-none opacity-90"
        />

        <div className="relative z-10 flex-1 flex flex-col items-center justify-between py-8 px-6 md:px-12">
          
          <p className="text-3xl md:text-4xl font-bold text-[#0B1120] [font-family:Oxanium,sans-serif] drop-shadow-sm">
            {status}
          </p>

          <div className="relative w-full max-w-5xl h-[65vh] min-h-[400px] bg-[#0B1120] rounded-3xl overflow-hidden shadow-2xl border-4 border-[#0B1120]/50 my-6">
            
            <Webcam
              audio={false}
              ref={webcamRef}
              mirrored={true} /* <--- Added the mirror effect here */
              screenshotFormat="image/jpeg"
              className="absolute inset-0 z-0 rounded-3xl" /* <--- Added rounded-3xl here to lock the corners */
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              videoConstraints={{
                facingMode: "user" 
              }}
            />

            {/* The Face Targeting Box */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-2 border-dashed border-cyan-400 rounded-[34px] z-10 pointer-events-none">
               <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-cyan-400 rounded-tl-[30px]"></div>
               <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-cyan-400 rounded-tr-[30px]"></div>
               <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-cyan-400 rounded-bl-[30px]"></div>
               <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-cyan-400 rounded-br-[30px]"></div>
            </div>
          </div>

          <div className="z-10 pb-2">
            <button 
              onClick={onCalibrationComplete}
              className="px-12 py-4 bg-[#0B1120] hover:bg-black text-white text-xl font-bold rounded-full [font-family:Oxanium,sans-serif] transition-transform hover:scale-105 shadow-lg uppercase tracking-wider"
            >
              Click when you are ready
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Calibration;