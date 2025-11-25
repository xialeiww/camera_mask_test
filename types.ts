export interface FilmStock {
  id: string;
  name: string;
  description: string;
  filterStyle: string; // CSS filter string for preview
  canvasFilter: string; // Canvas filter string for capture
  grainOpacity: number;
  colorGrade: string; // A Tailwind class for overlay tint if needed
  borderColor: string;
}

export interface Photo {
  id: string;
  dataUrl: string;
  timestamp: number;
  filmId: string;
  aiDescription?: string;
}

export type ViewMode = 'camera' | 'gallery' | 'photo_detail';