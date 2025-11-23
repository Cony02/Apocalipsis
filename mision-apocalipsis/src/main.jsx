import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <>
      <video
        className="bg-video"
        src="/videobackground.mp4"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="app-overlay">
        <App />
      </div>
    </>
  </StrictMode>,
)