import React, { useState, useEffect } from 'react';
import './CurtainOverlay.scss';

const CurtainOverlay = ({ faceStatus }) => {
  const [showMessage, setShowMessage] = useState(false);

  // Quando faceStatus mudar para false, exibe a mensagem após um pequeno atraso
  useEffect(() => {
    if (!faceStatus) {
      setTimeout(() => {
        setShowMessage(true);
      }, 500);  // Atraso de 0.5 segundos após o fechamento das cortinas
    }
  }, [faceStatus]);

  return (
    <>
      {faceStatus && (
        <>
        
        <div className="curtain-wrapper">
          <div className="curtain curtain-top"></div>
          <div className="curtain curtain-bottom"></div>
        </div>

        <div className="welcome-message">
          <h1>Credenciamento Realizado com Sucesso</h1>
          <p>Bem-vindo ao evento! Prepare-se para uma experiência incrível.</p>
        </div>
        </>
      )}
    </>
  );
};

export default CurtainOverlay;
