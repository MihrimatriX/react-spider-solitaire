import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CardBoard from "./CardBoard";
import Home from "./Home";

const App: React.FC = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/game" element={<CardBoard />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;