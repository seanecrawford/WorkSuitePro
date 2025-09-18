import React, { useState, useCallback, useEffect, useRef } from 'react';

export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenRef = useRef(null);

  const toggleFullscreen = useCallback(() => {
    const element = fullscreenRef.current;
    if (!element) {
      console.warn("Fullscreen element ref is not set.");
      return;
    }

    if (!document.fullscreenElement) {
      element.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  useEffect(() => {
    const handleChange = () => {
      setIsFullscreen(document.fullscreenElement != null);
    };

    document.addEventListener('fullscreenchange', handleChange);
    document.addEventListener('webkitfullscreenchange', handleChange);
    document.addEventListener('mozfullscreenchange', handleChange);
    document.addEventListener('MSFullscreenChange', handleChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleChange);
      document.removeEventListener('webkitfullscreenchange', handleChange);
      document.removeEventListener('mozfullscreenchange', handleChange);
      document.removeEventListener('MSFullscreenChange', handleChange);
    };
  }, []);

  return { isFullscreen, toggleFullscreen, fullscreenRef };
};