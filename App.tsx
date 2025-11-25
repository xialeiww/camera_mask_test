import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, Image as ImageIcon, X, Zap, RotateCcw, Sparkles, ChevronLeft, Download, Grid, Aperture, AlertCircle, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FilmDial } from './components/FilmDial';
import { ShutterButton } from './components/ShutterButton';
import { FilmGrain } from './components/FilmGrain';
import { FILM_STOCKS } from './constants';
import { FilmStock, Photo, ViewMode } from './types';
import { generatePhotoDescription } from './services/geminiService';

type CameraErrorType = 'permission' | 'general' | null;

export default function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('camera');
  const [currentFilm, setCurrentFilm] = useState<FilmStock>(FILM_STOCKS[0]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [capturedFlash, setCapturedFlash] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [cameraError, setCameraError] = useState<CameraErrorType>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize Camera
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      const constraints = {
        video: {
          facingMode: isFrontCamera ? 'user' : 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };
      
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('permission');
      } else {
        setCameraError('general');
      }
    }
  }, [isFrontCamera]);

  useEffect(() => {
    if (viewMode === 'camera') {
      startCamera();
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [viewMode, startCamera]);

  const toggleCamera = () => setIsFrontCamera(prev => !prev);
  const toggleFlash = () => setIsFlashOn(prev => !prev);
  const toggleGrid = () => setShowGrid(prev => !prev);

  // Capture Logic
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Haptic feedback if available
    if (navigator.vibrate) navigator.vibrate(50);

    setCapturedFlash(true);
    setTimeout(() => setCapturedFlash(false), 150);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.filter = currentFilm.canvasFilter;
    
    if (isFrontCamera) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.filter = 'none'; 

    // Manual Grain
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const grainStrength = currentFilm.grainOpacity * 255; 
    
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * grainStrength;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));     
      data[i+1] = Math.min(255, Math.max(0, data[i+1] + noise)); 
      data[i+2] = Math.min(255, Math.max(0, data[i+2] + noise)); 
    }
    ctx.putImageData(imageData, 0, 0);

    // Color Grading Overlay
    if (currentFilm.id === 'portra') {
        ctx.fillStyle = 'rgba(255, 200, 100, 0.05)';
        ctx.fillRect(0,0, canvas.width, canvas.height);
    } else if (currentFilm.id === 'cine') {
        ctx.fillStyle = 'rgba(0, 50, 100, 0.05)';
        ctx.fillRect(0,0, canvas.width, canvas.height);
    } else if (currentFilm.id === 'faded') {
         ctx.fillStyle = 'rgba(255, 100, 100, 0.02)';
         ctx.fillRect(0,0, canvas.width, canvas.height);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const newPhoto: Photo = {
      id: Date.now().toString(),
      dataUrl,
      timestamp: Date.now(),
      filmId: currentFilm.id
    };

    setPhotos(prev => [newPhoto, ...prev]);
  };

  const openGallery = () => setViewMode('gallery');
  const closeGallery = () => setViewMode('camera');

  const openPhotoDetail = (photo: Photo) => {
    setSelectedPhoto(photo);
    setViewMode('photo_detail');
  };

  const closePhotoDetail = () => {
    setSelectedPhoto(null);
    setViewMode('gallery');
  };

  const analyzePhoto = async () => {
    if (!selectedPhoto) return;
    setIsAnalyzing(true);
    const desc = await generatePhotoDescription(selectedPhoto.dataUrl);
    
    const updatedPhoto = { ...selectedPhoto, aiDescription: desc };
    setSelectedPhoto(updatedPhoto);
    setPhotos(prev => prev.map(p => p.id === updatedPhoto.id ? updatedPhoto : p));
    setIsAnalyzing(false);
  };

  const downloadPhoto = () => {
    if (!selectedPhoto) return;
    const link = document.createElement('a');
    link.href = selectedPhoto.dataUrl;
    link.download = `lumina_${selectedPhoto.id}.jpg`;
    link.click();
  }

  // --- COMPONENT: Viewfinder Grid ---
  const ViewfinderGrid = () => (
    <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-1/3 w-full h-px bg-white/50"></div>
        <div className="absolute top-2/3 w-full h-px bg-white/50"></div>
        <div className="absolute left-1/3 h-full w-px bg-white/50"></div>
        <div className="absolute left-2/3 h-full w-px bg-white/50"></div>
    </div>
  );

  // --- COMPONENT: Camera Error State ---
  const CameraErrorView = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-40 bg-gray-900">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
        <AlertCircle className="text-red-500" size={32} />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Camera Access Required</h2>
      <p className="text-gray-400 mb-6 text-sm leading-relaxed">
        {cameraError === 'permission' 
          ? "Please enable camera permissions in your browser settings to use Lumina Film." 
          : "An error occurred while initializing the camera. Please try refreshing."}
      </p>
      <button 
        onClick={startCamera}
        className="px-6 py-3 bg-white text-black font-medium rounded-full active:scale-95 transition-transform"
      >
        Retry Access
      </button>
    </div>
  );

  // --- RENDERERS ---

  const renderTopBar = () => (
    <div className="absolute top-0 left-0 right-0 p-4 pt-[max(1rem,env(safe-area-inset-top))] flex justify-between items-start z-30 pointer-events-none">
       {/* Left Controls */}
       <div className="flex flex-col gap-3 pointer-events-auto mt-2">
         <button onClick={toggleFlash} className={`w-10 h-10 rounded-full backdrop-blur-md border border-white/10 flex items-center justify-center transition-all ${isFlashOn ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' : 'bg-black/40 text-white/70 hover:bg-black/60'}`}>
           <Zap size={18} fill={isFlashOn ? "currentColor" : "none"} />
         </button>
         <button onClick={toggleGrid} className={`w-10 h-10 rounded-full backdrop-blur-md border border-white/10 flex items-center justify-center transition-all ${showGrid ? 'bg-white/20 text-white border-white/40' : 'bg-black/40 text-white/70 hover:bg-black/60'}`}>
           <Grid size={18} />
         </button>
       </div>

       {/* Top Center Status */}
       <div className="mt-2 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
         <span className="text-[10px] font-mono text-yellow-500/90 tracking-widest uppercase flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_red]"></span>
            REC
         </span>
       </div>

       {/* Right Controls */}
       <div className="pointer-events-auto mt-2">
         <button onClick={toggleCamera} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/90 active:rotate-180 transition-all duration-500 flex items-center justify-center hover:bg-black/60">
           <RotateCcw size={18} />
         </button>
       </div>
    </div>
  );

  const renderViewfinderData = () => (
    <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[10px] font-mono text-white/80 z-20 pointer-events-none opacity-80 mix-blend-difference">
        <div className="flex gap-4">
            <span>ISO <span className="text-yellow-400">400</span></span>
            <span>f/1.8</span>
        </div>
        <div className="text-right flex items-center gap-2">
            <span className="w-2 h-2 rounded-full border border-white/50 bg-transparent"></span>
            <span>RAW+J</span>
        </div>
    </div>
  )

  if (viewMode === 'camera') {
    return (
      <div className="relative h-screen w-full bg-black overflow-hidden flex flex-col font-sans">
        <canvas ref={canvasRef} className="hidden" />

        {/* --- VIEWFINDER --- */}
        <div className="relative flex-1 bg-gray-900 overflow-hidden rounded-b-[32px] shadow-2xl z-10">
          {renderTopBar()}
          
          {cameraError ? (
            <CameraErrorView />
          ) : (
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`w-full h-full object-cover transition-all duration-300 ${isFrontCamera ? '-scale-x-100' : ''}`}
              style={{ filter: currentFilm.filterStyle }}
            />
          )}

          {/* Overlays */}
          {!cameraError && (
            <>
              <FilmGrain opacity={currentFilm.grainOpacity} />
              <div className={`absolute inset-0 pointer-events-none mix-blend-overlay transition-colors duration-500 ${currentFilm.colorGrade}`} />
              
              {showGrid && <ViewfinderGrid />}
              {renderViewfinderData()}
            </>
          )}

          {/* Flash Effect */}
          <AnimatePresence>
            {capturedFlash && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white z-50 pointer-events-none"
              />
            )}
          </AnimatePresence>
        </div>

        {/* --- CONTROLS AREA --- */}
        <div className="bg-black pt-4 pb-[max(2rem,env(safe-area-inset-bottom))] flex flex-col justify-end relative z-20">
          
          {/* Film Selector Dial */}
          <div className="mb-2">
             <FilmDial currentFilmId={currentFilm.id} onSelect={setCurrentFilm} />
          </div>
          
          <div className="flex justify-between items-center px-8 sm:px-12 mt-2">
            {/* Gallery Button */}
            <button 
              onClick={openGallery}
              className="w-12 h-12 rounded-xl bg-gray-900 border border-gray-800/80 flex items-center justify-center overflow-hidden relative group active:scale-95 transition-transform"
            >
              {photos.length > 0 ? (
                <>
                    <img src={photos[0].dataUrl} alt="Last captured" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl"></div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-600">
                    <ImageIcon size={20} />
                </div>
              )}
            </button>

            {/* Shutter Button - Centered */}
            <div className="transform -translate-y-1">
                <ShutterButton onClick={capturePhoto} disabled={!!cameraError} />
            </div>

            {/* Settings / Extra Button */}
            <button className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-900/50 text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors">
               <Settings size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- GALLERY VIEW ---
  if (viewMode === 'gallery') {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="min-h-screen bg-black text-white pt-safe"
      >
        <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-bold tracking-wider font-mono">FILM_ROLL</h1>
          <button onClick={closeGallery} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
            <Camera size={18} />
          </button>
        </div>

        <div className="p-1 pb-safe">
            {photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[70vh] text-gray-500 gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-900 flex items-center justify-center">
                    <ImageIcon size={32} className="opacity-30" />
                </div>
                <p className="font-mono text-sm">NO_EXPOSURES_FOUND</p>
            </div>
            ) : (
            <div className="grid grid-cols-3 gap-0.5">
                {photos.map(photo => (
                <motion.div 
                    layoutId={`photo-${photo.id}`}
                    key={photo.id} 
                    className="aspect-square bg-gray-900 overflow-hidden cursor-pointer relative group"
                    onClick={() => openPhotoDetail(photo)}
                >
                    <img src={photo.dataUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </motion.div>
                ))}
            </div>
            )}
        </div>
      </motion.div>
    );
  }

  // --- DETAIL VIEW ---
  if (viewMode === 'photo_detail' && selectedPhoto) {
    const filmUsed = FILM_STOCKS.find(f => f.id === selectedPhoto.filmId) || FILM_STOCKS[0];
    
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col pt-safe pb-safe">
        {/* Header */}
        <div className="flex items-center justify-between p-6 z-20 absolute top-0 left-0 right-0 pt-[max(1.5rem,env(safe-area-inset-top))] bg-gradient-to-b from-black/90 to-transparent">
          <button onClick={closePhotoDetail} className="p-2 text-white/80 hover:text-white transition-colors bg-black/20 backdrop-blur-md rounded-full border border-white/5">
            <ChevronLeft size={24} />
          </button>
          <div className="flex gap-4">
             <button onClick={downloadPhoto} className="p-2 text-white/80 hover:text-white transition-colors bg-black/20 backdrop-blur-md rounded-full border border-white/5">
                <Download size={20} />
             </button>
          </div>
        </div>

        {/* Photo Container */}
        <div className="flex-1 flex items-center justify-center bg-black relative p-4">
          <div className="relative shadow-2xl shadow-black">
              {/* White border simulation for developed photo look */}
              <motion.div 
                layoutId={`photo-${selectedPhoto.id}`}
                className="bg-white p-2 pb-8 sm:p-4 sm:pb-12 shadow-lg max-h-[75vh] overflow-hidden rounded-sm"
              >
                 <img 
                    src={selectedPhoto.dataUrl} 
                    alt="Detail" 
                    className="max-w-full max-h-[60vh] object-contain block"
                 />
                 <div className="mt-4 flex justify-between items-end px-1 opacity-60">
                     <span className="text-[10px] text-black font-mono tracking-widest uppercase">{filmUsed.name}</span>
                     <span className="text-[8px] text-black font-mono text-right">{new Date(selectedPhoto.timestamp).toLocaleDateString()}</span>
                 </div>
              </motion.div>
          </div>
        </div>

        {/* AI Insight Drawer */}
        <div className="bg-gray-900 border-t border-white/5 p-6 pb-[max(2rem,env(safe-area-inset-bottom))] rounded-t-[32px] z-20 relative shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="w-12 h-1 bg-gray-700 rounded-full mx-auto mb-6 opacity-30"></div>
            
            <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Analysis</span>
                    <h3 className="text-white font-medium text-lg">Visual Poetry</h3>
                </div>
                {!selectedPhoto.aiDescription && (
                    <button 
                    onClick={analyzePhoto} 
                    disabled={isAnalyzing}
                    className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all overflow-hidden"
                    >
                        {isAnalyzing ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            </div>
                        ) : (
                            <Sparkles size={18} />
                        )}
                    </button>
                )}
            </div>

          {selectedPhoto.aiDescription ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-gray-300 font-serif italic leading-relaxed text-base border-l-2 border-indigo-500 pl-4">
                "{selectedPhoto.aiDescription}"
              </p>
            </motion.div>
          ) : (
             <p className="text-gray-600 text-sm">Tap the sparkles to reveal the poetic essence of this moment.</p>
          )}
        </div>
      </div>
    );
  }

  return null;
}