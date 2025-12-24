import { useEffect } from "react";

/**
 * Mede header/footer do portal e expõe alturas via CSS vars
 * para posicionamento seguro de elementos fixos (ex.: anúncios laterais).
 */
const ViewportSafeArea = () => {
  useEffect(() => {
    const root = document.documentElement;

    const setVars = () => {
      const header = document.querySelector("header");
      const footer = document.querySelector("footer");
      const headerH = header instanceof HTMLElement ? header.offsetHeight : 0;
      const footerH = footer instanceof HTMLElement ? footer.offsetHeight : 0;
      root.style.setProperty("--portal-header-h", `${headerH}px`);
      root.style.setProperty("--portal-footer-h", `${footerH}px`);
    };

    setVars();

    const headerEl = document.querySelector("header");
    const footerEl = document.querySelector("footer");

    const ro = new ResizeObserver(() => setVars());
    if (headerEl instanceof HTMLElement) ro.observe(headerEl);
    if (footerEl instanceof HTMLElement) ro.observe(footerEl);

    window.addEventListener("resize", setVars);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", setVars);
    };
  }, []);

  return null;
};

export default ViewportSafeArea;
