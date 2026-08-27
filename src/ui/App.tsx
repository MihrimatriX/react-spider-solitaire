import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CardBoard from "./CardBoard";
import Home from "./Home";
import Seo from "./Seo";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Seo />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<CardBoard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
