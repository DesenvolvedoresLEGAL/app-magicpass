// src/components/FaceMode.tsx
import React from "react";
import FaceCamera from "./FaceCamera";
import MiraFuturista from "./MiraFuturista";
import './FaceMode.scss';

interface FaceModeProps {
  onCaptureComplete: (result: any, status: string) => void;
  setLoading: (loading: boolean) => void;
  loadingFace: boolean;
  faceStatus: string;
}

export default function FaceMode({ onCaptureComplete, setLoading, loadingFace, faceStatus }: FaceModeProps) {
  return (
    <>
      <FaceCamera onCaptureComplete={onCaptureComplete} setLoading={setLoading} />

      {/* Overlay e Mira */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <MiraFuturista loadingFace={loadingFace}/>


        {/* Gradient + progress bar */}
        {loadingFace && (
            <div className="scanner-container">
                <div className="scanner-bar-lendo"></div>
            </div>
        )}

        {faceStatus && <span>{faceStatus}</span>}


        {!loadingFace && (
            <div className="scanner-container">
                <div className="scanner-bar"></div>
            </div>
        )}



      </div>
    </>
  );
}
