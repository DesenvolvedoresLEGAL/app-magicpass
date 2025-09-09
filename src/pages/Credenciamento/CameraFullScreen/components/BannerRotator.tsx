// src/components/BannerRotator.tsx

import React, { useEffect, useState } from "react";
import { bannerUrls } from "../data/banners";

const ROTATE_INTERVAL = 5000; // 5 segundos

export default function BannerRotator() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % bannerUrls.length);
    }, ROTATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <img
        src={bannerUrls[currentIndex]}
        alt={`Banner ${currentIndex + 1}`}
        className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
      />
      {/* <div
        className="absolute top-0 right-0 transform text-white text-xs font-bold p-2"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: '5px' }}
      >
        Publicidade
      </div> */}
    </div>
  );
}
