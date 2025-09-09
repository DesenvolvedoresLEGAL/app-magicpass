import React, { useEffect, useRef } from "react";

interface FaceCameraProps {
  onCaptureComplete: (result: any, status: string) => void;
  setLoading: (loading: boolean) => void;
}

export default function FaceCamera({ onCaptureComplete, setLoading }: FaceCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      startDrawLoop();
    } catch (err) {
      alert("Erro ao acessar câmera: " + (err as Error).message);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    stopDrawLoop();
  };

  const startDrawLoop = () => {
    const draw = () => {
      if (!canvasRef.current || !videoRef.current) return;

      const canvas = canvasRef.current;
      const video = videoRef.current;

      if (video.readyState === 4) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };
    animationFrameRef.current = requestAnimationFrame(draw);
  };

  const stopDrawLoop = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const captureAndSendFace = async () => {
    if (!canvasRef.current) return;

    canvasRef.current.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "captured-image.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("imagem", file);

      try {
        setLoading(true);

        const response = await fetch("http://127.0.0.1:5000/api/magicpass/v1/participantes/facial", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        const status = data.mensagem?.includes("reprovado") ? "Usuário reprovado!" : "Usuário liberado!";

        onCaptureComplete(data, status);
      } catch (err) {
        alert("Erro no reconhecimento facial: " + (err as Error).message);
      } finally {
        setLoading(false);
      }
    });
  };

  useEffect(() => {
    startCamera();

    const timer = setTimeout(() => {
      captureAndSendFace();
    }, 3000);

    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, []);

  return (
    <>
      <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
}
