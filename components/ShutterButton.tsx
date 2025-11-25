import React from 'react';
import { motion } from 'framer-motion';

interface ShutterButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const ShutterButton: React.FC<ShutterButtonProps> = ({ onClick, disabled }) => {
  return (
    <div className="relative group">
      {/* Outer Ring - Metallic look */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-400 to-gray-700 blur-[1px] opacity-80" />
      
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onClick}
        disabled={disabled}
        className={`relative w-[84px] h-[84px] rounded-full flex items-center justify-center 
          bg-gradient-to-b from-gray-100 to-gray-300 shadow-[0_4px_10px_rgba(0,0,0,0.5),inset_0_-2px_4px_rgba(0,0,0,0.2)]
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {/* Inner Ring */}
        <div className="w-[76px] h-[76px] rounded-full bg-black flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
           {/* The Actual Button */}
           <div className="w-[68px] h-[68px] rounded-full bg-white transition-all duration-200 shadow-[0_0_10px_rgba(255,255,255,0.3)] group-active:bg-gray-200" />
        </div>
      </motion.button>
    </div>
  );
};