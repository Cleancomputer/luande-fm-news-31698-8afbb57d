import { useEffect } from "react";

const VLibras = () => {
  useEffect(() => {
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

    // Criar div do VLibras de forma mais explícita
    const vlibrasDiv = document.createElement("div");
    vlibrasDiv.setAttribute("vw", "");
    vlibrasDiv.className = "enabled";
    
    // Estrutura completa do VLibras
    vlibrasDiv.innerHTML = `
      <div vw-access-button class="active"></div>
      <div vw-plugin-wrapper>
        <div class="vw-plugin-top-wrapper"></div>
      </div>
    `;
    
    document.body.appendChild(vlibrasDiv);

    return () => {
      // Limpar o script ao desmontar o componente
      if (script.parentNode) {
        document.body.removeChild(script);
      }
      if (vlibrasDiv.parentNode) {
        document.body.removeChild(vlibrasDiv);
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
