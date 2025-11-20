import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AdSense = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/login');

  useEffect(() => {
    // Não carregar AdSense em rotas administrativas
    if (isAdminRoute) return;

    // Verificar se o script já foi adicionado
    const existingScript = document.querySelector('script[src*="adsbygoogle"]');
    if (existingScript) return;

    // Adicionar o script do AdSense
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9437734393586924';
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);

    return () => {
      // Cleanup: remover o script se o componente for desmontado
      const scriptToRemove = document.querySelector('script[src*="adsbygoogle"]');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [isAdminRoute]);

  return null;
};

export default AdSense;
