
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Adiciona informação de debug para verificar se o script está carregando
console.log("Script principal carregado");

// Verificar elemento root
const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<App />);
} else {
  console.error("Elemento root não encontrado");
}
