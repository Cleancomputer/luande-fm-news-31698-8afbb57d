import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Ensure we're in browser environment
    if (typeof window === 'undefined') return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Initial check
    checkMobile();

    // Use matchMedia if available
    if (window.matchMedia) {
      const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
      const onChange = () => checkMobile();
      
      // Modern browsers
      if (mql.addEventListener) {
        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
      }
      // Legacy browsers
      else if (mql.addListener) {
        mql.addListener(onChange);
        return () => mql.removeListener(onChange);
      }
    }

    // Fallback to resize event
    const onResize = () => checkMobile();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return !!isMobile;
}
