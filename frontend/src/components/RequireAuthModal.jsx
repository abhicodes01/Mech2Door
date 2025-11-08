import React from "react";
import { useNavigate } from "react-router-dom";

export default function RequireAuthModal({ open, onClose }) {
  const navigate = useNavigate();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center px-4">
      <div className="bg-[#1E1E1E] border border-[#343841] rounded-xl w-full max-w-md p-6 shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-2">Sign in required</h3>
        <p className="text-sm text-gray-300 mb-6">
          Please sign in or create an account to continue.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              onClose();
              navigate("/login");
            }}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded px-4 py-2"
          >
            Sign in
          </button>
        </div>
        <button
          onClick={onClose}
          className="mt-4 text-sm text-gray-400 hover:text-white"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
