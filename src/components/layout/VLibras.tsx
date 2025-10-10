import { useEffect } from "react";

const VLibras = () => {
  useEffect(() => {
    // Criar div do VLibras primeiro
    const vlibrasDiv = document.createElement("div");
    vlibrasDiv.setAttribute("vw", "");
    vlibrasDiv.className = "enabled";
    vlibrasDiv.innerHTML = `
      <div vw-access-button class="active"></div>
      <div vw-plugin-wrapper>
        <div class="vw-plugin-top-wrapper"></div>
      </div>
    `;
    document.body.appendChild(vlibrasDiv);

    // Carregar o script do VLibras
    const script = document.createElement("script");
    script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // Inicializar o VLibras após o carregamento
      if (window.VLibras) {
        new window.VLibras.Widget("https://vlibras.gov.br/app");
      }
    };

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
