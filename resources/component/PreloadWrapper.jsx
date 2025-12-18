import React, { useState, useEffect } from "react";
import FallbackLoader from "./FallbackLoader";
import { preloadImage } from "./PreloadImage";

const PreloadWrapper = ({ children, resources = [] }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const preloadResources = async () => {
      try {
        await Promise.all(resources.map((src) => preloadImage(src)));
        setIsReady(true);
      } catch (error) {
        console.error("Failed to preload resources:", error);
        setIsReady(true); // Fallback to render even if resources fail to load
      }
    };

    preloadResources();
  }, [resources]);

  if (!isReady) {
    return <FallbackLoader />;
  }

  return children;
};

export default PreloadWrapper;
