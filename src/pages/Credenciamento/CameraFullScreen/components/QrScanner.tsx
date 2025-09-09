import React, { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QrScannerProps {
  onScanSuccess: (result: string) => void;
}

export default function QrScanner({ onScanSuccess }: QrScannerProps) {
  const qrRegionId = "qr-code-region";
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const startScanner = async () => {
      const html5QrCode = new Html5Qrcode(qrRegionId);
      html5QrCodeRef.current = html5QrCode;

      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 300, height: 300 } },
          (decodedText) => {
            onScanSuccess(decodedText);
            html5QrCode.stop().then(() => html5QrCode.clear());
          },
          () => {}
        );
      } catch (err) {
        alert("Erro ao iniciar scanner QR Code: " + (err as Error).message);
      }
    };

    startScanner();

    return () => {
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().then(() => html5QrCodeRef.current?.clear());
      }
    };
  }, []);

  return <div id={qrRegionId} className="w-full h-full" />;
}
