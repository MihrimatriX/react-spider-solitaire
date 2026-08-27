import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { seoForPath } from "../seo";

const Seo: React.FC = () => {
  const { pathname } = useLocation();
  const { title, description } = seoForPath(pathname);

  useEffect(() => {
    document.title = title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", description);
  }, [title, description]);

  return null;
};

export default Seo;
