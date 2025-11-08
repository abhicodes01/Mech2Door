import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage";
import SigninPage from "./pages/SigninPage";
import ProfilePage from "./pages/ProfilePage";
import BookingsPage from "./pages/BookingsPage";
import HelpPage from "./pages/HelpPage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Chatbot from "./components/ChatBot.jsx";

// Guard wrapper for protected pages
function PrivateRoute({ isAuthenticated, children }) {
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });

  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated ? "true" : "false");
  }, [isAuthenticated]);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  const location = useLocation();

  // Hide navbar/chatbot on the login page
  const onLoginPage = location.pathname === "/login";
  const hideNavbar = onLoginPage && !isAuthenticated;
  const hideChatbot = onLoginPage;

  return (
    <>
      {!hideNavbar && <Navbar onLogout={handleLogout} />}

      <Routes>
        {/* PUBLIC landing page */}
        <Route path="/" element={<HomePage />} />

        {/* LOGIN */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <SigninPage onLogin={handleLogin} />
          }
        />

        {/* PROTECTED PAGES */}
        <Route
          path="/bookings"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <BookingsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/help"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <HelpPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute isAuthenticated={isAuthenticated}>
              <ProfilePage />
            </PrivateRoute>
          }
        />

        {/* Fallback: if authed go home; else go login */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
      </Routes>

      {/* Chatbot visible on all pages except login */}
      {!hideChatbot && <Chatbot />}

      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} theme="dark" />
    </>
  );
}

export default App;
