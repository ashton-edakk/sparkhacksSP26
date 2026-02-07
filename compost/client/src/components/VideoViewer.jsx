import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import VideoCard from './VideoCard';

export default function VideoViewer({ videos }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex((prev) => (prev + 1) % videos.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [videos.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  if (!videos || videos.length === 0) {
    return null;
  }

  const currentVideo = videos[currentIndex];

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto h-[calc(100vh-12rem)] flex items-center justify-center"
    >
      {/* Navigation Arrows */}
      {videos.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 z-20 p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/20 hover:bg-black/80 hover:border-white/40 transition-all group"
            aria-label="Previous video"
          >
            <ChevronLeft className="w-6 h-6 text-white group-hover:text-emerald-400 transition-colors" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 z-20 p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/20 hover:bg-black/80 hover:border-white/40 transition-all group"
            aria-label="Next video"
          >
            <ChevronRight className="w-6 h-6 text-white group-hover:text-emerald-400 transition-colors" />
          </button>
        </>
      )}

      {/* Video Counter */}
      {videos.length > 1 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-sm text-slate-300">
          {currentIndex + 1} / {videos.length}
        </div>
      )}

      {/* Current Video */}
      <div className="w-full h-full flex items-center justify-center px-4">
        <div className="w-full max-w-4xl h-full flex flex-col">
          <VideoCard 
            key={`${currentVideo.id}-${currentVideo.startAt || 0}`} 
            video={currentVideo} 
            autoplay={true} 
          />
        </div>
      </div>
    </div>
  );
}

