// src/components/Sidebar.tsx
import React from "react";
import { BiSolidFace } from "react-icons/bi";

interface SidebarProps {
  mode: "face" | "qr";
  setMode: (mode: "face" | "qr") => void;
  loadingFace: boolean;
  faceStatus: string;
  qrResult: string | null;
}

export default function Sidebar({
  mode,
  setMode,
  loadingFace,
  faceStatus,
  qrResult,
}: SidebarProps) {
  return (
    <div className="w-1/4 bg-gray-800 flex flex-col p-8 space-y-6 shadow-md">
      <h2 className="text-xl font-semibold text-white text-center mb-4">
        Selecione o Método
      </h2>

      <div className="flex flex-col space-y-4">
        <button
          onClick={() => setMode("face")}
          className={`flex items-center justify-between px-6 py-4 rounded-lg text-lg font-medium transition-all border ${
            mode === "face"
              ? "bg-yellow-500 text-white border-yellow-600 shadow-md"
              : "bg-gray-700 text-white hover:bg-yellow-500/30 border-gray-600"
          }`}
        >
          <div className="flex items-center space-x-2">
            <BiSolidFace size={24} />
            <span>Reconhecimento Facial</span>
          </div>
          {mode === "face" && <span className="text-green-500 font-bold">✔</span>}
        </button>

        <button
          onClick={() => setMode("qr")}
          className={`flex items-center justify-between px-6 py-4 rounded-lg text-lg font-medium transition-all border ${
            mode === "qr"
              ? "bg-blue-500 text-white border-blue-600 shadow-md"
              : "bg-gray-700 text-white hover:bg-blue-500/30 border-gray-600"
          }`}
        >
          <div className="flex items-center space-x-2">
            <span>QR Code</span>
          </div>
          {mode === "qr" && <span className="text-green-500 font-bold">✔</span>}
        </button>
      </div>

      <div className="flex-grow bg-gray-700 rounded-md p-4 overflow-auto text-sm text-white">
        {mode === "qr" && qrResult && (
          <div className="text-center">
            <strong>QR Code detectado:</strong>
            <p>{qrResult}</p>
          </div>
        )}
        {mode === "face" && (
          <div className="min-h-[80px] flex flex-col justify-center items-center">
            {loadingFace && <span>Reconhecimento facial ativado...</span>}
            {!loadingFace && faceStatus && <span>{faceStatus}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
