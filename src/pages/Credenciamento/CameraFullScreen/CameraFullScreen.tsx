import React, { useState } from "react";
import FaceMode from "./components/FaceMode";
import QrScanner from "./components/QrScanner";
import BannerRotator from "./components/BannerRotator";
import Sidebar from "./components/Sidebar";
import HeaderBar from "./components/HeaderBar";
import FooterPowered from "./components/FooterPowered";
import "./CameraFullScreen.scss";

const theme = {
  primary: "#D4AF37",
  secondary: "#000",
  accent: "#ffffff",
};

export default function CameraFullScreen() {
  const [mode, setMode] = useState<"face" | "qr">("face");
  const [qrResult, setQrResult] = useState<string | null>(null);
  const [faceResult, setFaceResult] = useState<any>(null);
  const [loadingFace, setLoadingFace] = useState(false);
  const [faceStatus, setFaceStatus] = useState("");

  const handleQrScan = (result: string) => setQrResult(result);
  const handleFaceCapture = (result: any, status: string) => {
    setFaceResult(result);
    setFaceStatus(status);
  };

  return (
    <div
      className="h-screen w-screen flex flex-col"
      style={{ backgroundColor: theme.secondary, color: theme.accent }}
    >
      
      <HeaderBar />

      <div className="flex flex-1">
        {/* Banner */}
        <div className="w-1/5 bg-black p-6 border-r border-gray-700">
          <BannerRotator />
        </div>

        {/* Câmera */}
        <div className="w-3/5 relative flex items-center justify-center overflow-hidden bg-black">
          {mode === "qr" ? (
            <QrScanner onScanSuccess={handleQrScan} />
          ) : (
            <FaceMode
              onCaptureComplete={handleFaceCapture}
              setLoading={setLoadingFace}
              loadingFace={loadingFace}
            />
          )}
        </div>

        {/* Sidebar */}
        <Sidebar
          mode={mode}
          setMode={setMode}
          loadingFace={loadingFace}
          faceStatus={faceStatus}
          qrResult={qrResult}
        />
      </div>
      <FooterPowered />
    </div>
  );
}
