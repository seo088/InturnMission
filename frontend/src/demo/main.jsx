import React from 'react'
import ReactDOM from 'react-dom/client'
import DemoApp from './DemoApp'
import './demo.css'

ReactDOM.createRoot(document.getElementById('demo-root')).render(
  <React.StrictMode>
    <DemoApp />
  </React.StrictMode>,
)
