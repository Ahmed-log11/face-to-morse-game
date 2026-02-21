import React from 'react';

const Welcome = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-slate-800 p-10 rounded-2xl shadow-2xl border border-blue-500/30 max-w-2xl">
        <h1 className="text-5xl font-extrabold text-white mb-6 tracking-tight">
          👋 Hi <span className="text-blue-400">Team!</span>
        </h1>
        
        <p className="text-slate-300 text-lg mb-8 leading-relaxed">
          The <span className="font-mono text-yellow-400">Face-to-Morse</span> project is officially live on your local machine. 
          Everything is set up and ready for development.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
            <p className="text-blue-400 font-bold">AI & Input</p>
            <p className="text-slate-400">Webcam Ready</p>
          </div>
          <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
            <p className="text-green-400 font-bold">Game Logic</p>
            <p className="text-slate-400">Backend Linked</p>
          </div>
          <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
            <p className="text-purple-400 font-bold">Frontend</p>
            <p className="text-slate-400">Tailwind Active</p>
          </div>
        </div>

        <button className="mt-10 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all transform hover:scale-105 shadow-lg">
          Let's Build It
        </button>
      </div>
      
      <p className="mt-8 text-slate-500 text-xs">
        Check <code className="text-slate-400">README.md</code> for your next tasks.
      </p>
    </div>
  );
};

export default Welcome;