import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SITE_URL } from "@/lib/site";

const upsertCanonical = (url: string) => {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');

  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }

  link.href = url;
};

const upsertOgUrl = (url: string) => {
  let meta = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", "og:url");
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", url);
};

const CanonicalUrl = () => {
  const location = useLocation();

  useEffect(() => {
    const url = `${SITE_URL}${location.pathname}`;

    upsertCanonical(url);
    upsertOgUrl(url);
  }, [location.pathname]);

  return null;
};

export default CanonicalUrl;
