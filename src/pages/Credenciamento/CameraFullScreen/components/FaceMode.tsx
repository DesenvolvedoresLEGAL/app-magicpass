// src/components/FaceMode.tsx
import React from "react";
import FaceCamera from "./FaceCamera";
import MiraFuturista from "./MiraFuturista";
import './FaceMode.scss';

interface FaceModeProps {
  onCaptureComplete: (result: any, status: string) => void;
  setLoading: (loading: boolean) => void;
  loadingFace: boolean;
}

export default function FaceMode({ onCaptureComplete, setLoading, loadingFace }: FaceModeProps) {
  return (
    <>
      <FaceCamera onCaptureComplete={onCaptureComplete} setLoading={setLoading} />

      {/* Overlay e Mira */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <MiraFuturista loadingFace={loadingFace}/>

        <div className="absolute top-full mt-3 w-full text-center text-yellow-400 font-semibold select-none">
          Enquadre o seu rosto aqui
        </div>

        {/* Gradient + progress bar */}
        {loadingFace && (
            <div className="scanner-container">
                <div className="scanner-bar-lendo"></div>
            </div>
        )}

        {!loadingFace && (
            <div className="scanner-container">
                <div className="scanner-bar"></div>
            </div>
        )}


      </div>
    </>
  );
}
