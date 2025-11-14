import { useEffect } from "react";

const VLibras = () => {
  useEffect(() => {
    // Criar div do VLibras
    const vlibrasDiv = document.createElement("div");
    vlibrasDiv.setAttribute("vw", "");
    vlibrasDiv.className = "enabled";
    document.body.appendChild(vlibrasDiv);

    // Carregar o script do VLibras
    const script = document.createElement("script");
    script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    script.async = true;
    script.onload = () => {
      // Aguardar um pouco para garantir que o DOM está pronto
      setTimeout(() => {
        if (window.VLibras) {
          new window.VLibras.Widget("https://vlibras.gov.br/app");
        }
      }, 100);
    };
    document.body.appendChild(script);

    // Adicionar estilos customizados para posicionar o VLibras
    const style = document.createElement("style");
    style.innerHTML = `
      div[vw-access-button] {
        position: fixed !important;
        right: 0 !important;
        top: 50% !important;
        transform: translateY(-50%) !important;
        bottom: auto !important;
        z-index: 40 !important;
      }
      
      div[vw-plugin-wrapper] {
        right: 0 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Limpar ao desmontar o componente
      const existingScript = document.querySelector('script[src="https://vlibras.gov.br/app/vlibras-plugin.js"]');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
      const existingDiv = document.querySelector('[vw]');
      if (existingDiv && existingDiv.parentNode) {
        existingDiv.parentNode.removeChild(existingDiv);
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  return null;
};

// Adicionar tipagem do VLibras ao Window
declare global {
  interface Window {
    VLibras: any;
  }
}

export default VLibras;
