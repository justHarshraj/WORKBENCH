import React from 'react';
import { motion } from 'framer-motion';

export const DBZLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950 overflow-hidden">
      
      {/* Container for the avatar and its animated border */}
      <div className="relative flex items-center justify-center w-56 h-56 mt-[-40px]">
        
        {/* Animated Aura Background (The GIF, allowed to flow naturally, no circular clipping) */}
        <motion.div
          className="absolute -inset-12 -translate-y-4 z-0 mix-blend-screen flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* We use the GIF without clipping it to a circle, stretched horizontally */}
          <img 
            src="https://i.sstatic.net/AqIwa.gif" 
            alt="Aura" 
            className="w-full h-full object-contain scale-x-[1.3]"
          />
        </motion.div>

        {/* Center Static Image */}
        <motion.div
          className="absolute inset-0 rounded-full overflow-hidden z-10 border-4 border-zinc-950 bg-black"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <img 
            src="/goku-new.jpeg" 
            alt="Super Saiyan" 
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>
        
      {/* Loading Text */}
      <motion.h1 
        className="mt-20 text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-white to-gray-300 tracking-[0.3em] uppercase italic drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] z-10"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
      >
        Ascending...
      </motion.h1>
      
    </div>
  );
};
//fix