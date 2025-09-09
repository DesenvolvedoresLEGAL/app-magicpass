// src/components/HeaderBar.tsx
import React from "react";

export default function HeaderBar() {
  return (
    <header className="w-full py-4 text-center font-bold text-3xl shadow-md relative border-b border-yellow-500">
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
        <img
          src="https://audiosp.com.br/images/audio.png"
          alt="Logo da Empresa"
          className="h-8 object-contain"
        />
      </div>
      Bem-vindo ao Show do The Calling
    </header>
  );
}
