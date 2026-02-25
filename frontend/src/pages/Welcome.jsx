import React from 'react';
import background from "../assets/background.svg"; 
import eye from "../assets/eye2.svg";        
import techhub from "../assets/techhub.png"; 
import fcit from "../assets/fcit.png";       
import cardGradient from "../assets/cardgraideint.png"; 

const Welcome = ({ onStart }) => {
  return (
    <div className="relative min-h-screen text-white overflow-hidden">
      {/* Background image */}
      <img
        src={background}
        alt="background"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Logos */}
      <div className="absolute top-10 left-10 z-20">
        <img src={techhub} className="h-20 w-auto" />
      </div>

      <div className="absolute top-10 right-10 z-20 flex gap-4">
        <img src={fcit} className="h-25 w-auto" />
      </div>

      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center p-6">
      <div className="relative w-[92%] max-w-[1600px] rounded-[34px] overflow-hidden">          
          {/*cardGradient image */}
          <img
            src={cardGradient}
            alt="card overlay"
            className="absolute inset-0 h-full w-full object-cover "
          />          

          {/* Content*/}
          <div className="relative px-10 py-10">


            {/* title */}
            <h1 className="mt-12 text-center text-7xl font-bold [font-family:Oxanium,sans-serif]">
              Face to Morse
            </h1>

            {/* Eye */}
            <div className="relative mt-8 flex justify-center h-[320px] md:h-[420px]">
              <img
                src={eye}
                alt="Eye"
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] max-w-none opacity-90 z-10"
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;