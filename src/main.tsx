// src/main.tsx (MUDANÇA NA IMPORTAÇÃO)

import { createRoot } from "react-dom/client";
// Antes: import App from "./App.tsx";
import { App } from "./App.tsx"; // ⭐️ IMPORTAÇÃO NOMEADA ⭐️
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
