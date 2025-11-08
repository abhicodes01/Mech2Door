import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Route } from 'react-router-dom'
import {GoogleOAuthProvider} from "@react-oauth/google";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <GoogleOAuthProvider clientId='463156935417-klov8bdmc6o3d1ln5m1a6qojm5m95c7i.apps.googleusercontent.com'>
      <App/>
    </GoogleOAuthProvider>
  </BrowserRouter>
  </StrictMode>,
)
