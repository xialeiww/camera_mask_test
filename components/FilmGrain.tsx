import React from 'react';
import { NOISE_SVG_URL } from '../constants';

interface FilmGrainProps {
  opacity: number;
}

export const FilmGrain: React.FC<FilmGrainProps> = ({ opacity }) => {
  return (
    <div 
      className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay"
      style={{
        backgroundImage: `url("${NOISE_SVG_URL}")`,
        opacity: opacity,
        backgroundSize: '150px 150px'
      }}
    />
  );
};