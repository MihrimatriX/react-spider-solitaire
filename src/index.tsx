import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./ui/App";

const root = createRoot(document.getElementById("root")!);
root.render(<App />);