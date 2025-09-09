import React from "react";
import "./MiraFuturista.scss";

// Tipagem das props para permitir 'loadingFace'
interface MiraFuturistaProps {
  loadingFace: boolean;
}

const MiraFuturista: React.FC<MiraFuturistaProps> = ({ loadingFace }) => {
  const stars = Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    size: `${1 + Math.random() * 3}px`, // 1 a 4 px
    animationType: `move${(i % 5) + 1}`, // 5 tipos de movimento
    bigBlink: Math.random() < 0.3, // 30% chance de brilho maior
  }));

  return (
    <div className="tela-com-blur">
        {!loadingFace && (
      <div className="mira-futurista">
        <div className="canto canto-tl"></div>
        <div className="canto canto-tr"></div>
        <div className="canto canto-bl"></div>
        <div className="canto canto-br"></div>
      </div>

        )}
      <div className="stars">
        {stars.map(({ id, top, left, delay, size, animationType, bigBlink }) => (
          <div
            key={id}
            className={`star ${animationType} ${bigBlink ? "bigBlink" : ""}`}
            style={{
              top: `${top}%`,
              left: `${left}%`,
              "--delay": `${delay}s`,
              "--size": size,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default MiraFuturista;
