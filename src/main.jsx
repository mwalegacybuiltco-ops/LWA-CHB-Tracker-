import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const swUrl = new URL('./sw.js', import.meta.env.BASE_URL || window.location.href)
      await navigator.serviceWorker.register(swUrl)
    } catch (error) {
      console.error('Service worker registration failed:', error)
    }
  })
}
