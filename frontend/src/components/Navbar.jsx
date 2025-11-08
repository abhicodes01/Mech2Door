import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import user from "../assets/icons8-user-50.png";
import RequireAuthModal from "./RequireAuthmodal";
import { toast } from "react-toastify";

function Navbar({ onLogout }) {
  const [blur, setBlur] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const [profileImg, setProfileImg] = useState(user);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  // Single source of truth for auth inside Navbar
  const [authed, setAuthed] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );

  // Re-sync auth state when route changes (after login/signout)
  useEffect(() => {
    setAuthed(localStorage.getItem("isAuthenticated") === "true");
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (storedUser.image && storedUser.image.length > 8) setProfileImg(storedUser.image);
    else setProfileImg(user);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setBlur(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (pathname) => location.pathname === pathname;

  const guardNav = (path) => {
    if (authed) navigate(path);
    else setAuthPromptOpen(true);
  };

  const handleSignOut = async () => {
    try {
      await fetch("http://localhost:5000/api/user/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (_) {
      // ignore network error for smooth UX
    }
    toast.success("Signed out");

    // Clear client-side auth and inform App.jsx
    localStorage.setItem("isAuthenticated", "false");
    localStorage.removeItem("user");
    onLogout?.();

    setAuthed(false);
    setShowDropdown(false);
    navigate("/", { replace: true });
  };

  return (
    <>
      <nav
        className={`w-full z-50 fixed top-0 left-0 transition ${
          blur ? "backdrop-blur-lg shadow" : "bg-transparent"
        }`}
      >
        <div className="w-full flex items-center justify-between px-6 py-3">
          <div>
            <h1 className="font-bold text-white text-2xl">
              Mech<span className="text-red-600">2</span>Door
            </h1>
          </div>

          <div className="space-x-3 flex items-center">
            <button
              onClick={() => navigate("/")}
              className={`font-semibold px-3 py-1 rounded-full transition ${
                isActive("/")
                  ? "text-[#EAEAEA] bg-red-600"
                  : "text-white hover:bg-gray-600"
              }`}
            >
              Home
            </button>

            <button
              onClick={() => guardNav("/bookings")}
              className={`font-semibold px-3 py-1 rounded-full transition ${
                isActive("/bookings")
                  ? "text-[#EAEAEA] bg-red-600"
                  : "text-white hover:bg-gray-600"
              }`}
            >
              Bookings
            </button>

            <button
              onClick={() => guardNav("/help")}
              className={`font-semibold px-3 py-1 rounded-full transition ${
                isActive("/help")
                  ? "text-[#EAEAEA] bg-red-600"
                  : "text-white hover:bg-gray-600"
              }`}
            >
              Help
            </button>

            <button
              onClick={() => guardNav("/profile")}
              className={`font-semibold px-3 py-1 rounded-full transition ${
                isActive("/profile")
                  ? "text-[#EAEAEA] bg-red-600"
                  : "text-white hover:bg-gray-600"
              }`}
            >
              Profile
            </button>
          </div>

          <div className="relative">
            <img
              src={profileImg}
              alt="Profile"
              className="w-10 h-10 rounded-full cursor-pointer object-cover"
              onClick={() =>
                authed ? setShowDropdown((p) => !p) : setAuthPromptOpen(true)
              }
            />
            {showDropdown && (
              <div className="absolute right-0 mt-3 w-32 bg-[#1e1e1e] text-white rounded shadow-lg flex flex-col z-50">
                <button
                  className="text-left px-4 py-2 hover:bg-red-600 transition"
                  onClick={handleSignOut}
                >
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <RequireAuthModal
        open={authPromptOpen}
        onClose={() => setAuthPromptOpen(false)}
      />
    </>
  );
}

export default Navbar;
