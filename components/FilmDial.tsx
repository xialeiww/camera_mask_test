import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FilmStock } from '../types';
import { FILM_STOCKS } from '../constants';

interface FilmDialProps {
  currentFilmId: string;
  onSelect: (film: FilmStock) => void;
}

export const FilmDial: React.FC<FilmDialProps> = ({ currentFilmId, onSelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll active item into center view when it changes
  useEffect(() => {
    if (scrollRef.current) {
      const activeBtn = scrollRef.current.querySelector(`[data-active="true"]`);
      if (activeBtn) {
        activeBtn.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [currentFilmId]);

  const currentFilm = FILM_STOCKS.find(f => f.id === currentFilmId) || FILM_STOCKS[0];

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Visual Indicator (The Badge) */}
      <div className="flex justify-center mb-1">
          <motion.div 
            key={currentFilmId}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`
                flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-gray-900/80 backdrop-blur-md shadow-xl
            `}
          >
             {/* Mini Icon */}
             <div className={`w-5 h-5 rounded-full border-2 ${currentFilm.borderColor} ${currentFilm.colorGrade} bg-gray-800`} />
             <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-mono leading-none tracking-widest uppercase">FILM STOCK</span>
                <span className="text-xs font-bold text-white tracking-wide">{currentFilm.name}</span>
             </div>
          </motion.div>
      </div>

      {/* Text Slider Dial */}
      <div className="relative w-full h-10 group">
        
        {/* Center Indicator Gradient */}
        <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />
        
        {/* The active marker */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-1 h-1 rounded-full bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)] z-20" />

        <div 
            ref={scrollRef}
            className="w-full overflow-x-auto no-scrollbar flex items-center snap-x snap-mandatory px-[50vw]"
        >
          {FILM_STOCKS.map((film) => {
            const isActive = film.id === currentFilmId;
            return (
              <button
                key={film.id}
                data-active={isActive}
                onClick={() => onSelect(film)}
                className={`
                  snap-center shrink-0 px-5 py-2 transition-all duration-300
                  flex flex-col items-center justify-center
                  ${isActive ? 'opacity-100 scale-100' : 'opacity-40 hover:opacity-70 scale-90'}
                `}
              >
                <span className={`
                    font-mono text-sm font-bold tracking-wider whitespace-nowrap
                    ${isActive ? 'text-yellow-400 text-shadow-glow' : 'text-white'}
                `}>
                  {film.id.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};