
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Load fonts before rendering
document.documentElement.classList.add('font-montserrat');

createRoot(document.getElementById("root")!).render(<App />);
