import { FilmStock } from './types';

export const FILM_STOCKS: FilmStock[] = [
  {
    id: 'standard',
    name: 'Std. Color',
    description: 'Natural, balanced colors suitable for everyday photography.',
    filterStyle: 'contrast(1.05) saturate(1.1)',
    canvasFilter: 'contrast(105%) saturate(110%)',
    grainOpacity: 0.05,
    colorGrade: 'bg-transparent',
    borderColor: 'border-white/20'
  },
  {
    id: 'portra',
    name: 'Portra 400',
    description: 'Warm skin tones, fine grain, and soft highlights. Perfect for portraits.',
    filterStyle: 'sepia(0.2) contrast(1.1) saturate(1.2) brightness(1.05)',
    canvasFilter: 'sepia(20%) contrast(110%) saturate(120%) brightness(105%)',
    grainOpacity: 0.12,
    colorGrade: 'bg-yellow-500/10',
    borderColor: 'border-yellow-200/50'
  },
  {
    id: 'cine',
    name: 'Cine 800T',
    description: 'Cool teal shadows and warm highlights. Cinematic night aesthetic.',
    filterStyle: 'hue-rotate(-10deg) contrast(1.2) saturate(1.1) brightness(0.9)',
    canvasFilter: 'hue-rotate(-10deg) contrast(120%) saturate(110%) brightness(90%)',
    grainOpacity: 0.15,
    colorGrade: 'bg-blue-900/10',
    borderColor: 'border-cyan-400/50'
  },
  {
    id: 'mono',
    name: 'Tri-X 400',
    description: 'Classic high-contrast black and white with gritty grain.',
    filterStyle: 'grayscale(1) contrast(1.3) brightness(0.9)',
    canvasFilter: 'grayscale(100%) contrast(130%) brightness(90%)',
    grainOpacity: 0.25,
    colorGrade: 'bg-transparent',
    borderColor: 'border-gray-400/50'
  },
  {
    id: 'faded',
    name: 'Expired 200',
    description: 'Low contrast, faded shadows, and color shifts. Nostalgic feel.',
    filterStyle: 'sepia(0.3) saturate(0.8) contrast(0.9) brightness(1.1)',
    canvasFilter: 'sepia(30%) saturate(80%) contrast(90%) brightness(110%)',
    grainOpacity: 0.20,
    colorGrade: 'bg-red-500/5',
    borderColor: 'border-red-200/30'
  }
];

export const NOISE_SVG_URL = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E`;