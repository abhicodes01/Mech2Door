import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import signIn from "../assets/signIn.mp4";

function SigninPage({ onLogin }) {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [isMechanicSignup, setIsMechanicSignup] = useState(false);

  // Regular user form
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  // Mechanic form
  const [mechanicData, setMechanicData] = useState({
    shopName: "",
    gstNumber: "",
    ownerName: "",
    mobile: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleMechanicChange = (e) => {
    setMechanicData({ ...mechanicData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    let newErrors = {};
    if (isSignup && !formData.firstName)
      newErrors.firstName = "First name is required";
    if (isSignup && !formData.lastName)
      newErrors.lastName = "Last name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateMechanic = () => {
    let newErrors = {};
    if (!mechanicData.shopName) newErrors.shopName = "Shop Name is required";
    if (!mechanicData.ownerName) newErrors.ownerName = "Owner Name is required";
    if (!mechanicData.gstNumber) newErrors.gstNumber = "GST Number is required";
    if (!mechanicData.mobile) newErrors.mobile = "Mobile Number is required";
    if (!mechanicData.email) newErrors.email = "Email is required";
    if (!mechanicData.address) newErrors.address = "Shop Address is required";
    if (!mechanicData.password) newErrors.password = "Password is required";
    if (mechanicData.password !== mechanicData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (isSignup) {
      try {
        const res = await fetch("http://localhost:5000/api/user/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success("Account created! Please sign in.");
          setIsSignup(false);
          setFormData({
            firstName: "",
            lastName: "",
            email: "",
            password: "",
          });
        } else {
          toast.error(data.error || "Registration failed!");
        }
      } catch (err) {
        toast.error("Network error: " + err.message);
      }
    } else {
      try {
        const res = await fetch("http://localhost:5000/api/user/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          toast.success("Signed in!");

          // persist user + auth
          localStorage.setItem(
            "user",
            JSON.stringify({
              email: formData.email,
              firstName: data.user.firstName,
              lastName: data.user.lastName,
            })
          );
          localStorage.setItem("isAuthenticated", "true");

          // notify App state immediately
          onLogin?.();

          // support deep-link/continue flow (if you passed state from modal)
          const redirectTo = location.state?.redirectTo || "/"; // requires: const location = useLocation();
          navigate(redirectTo, { replace: true });
          toast.success("Signed In")
        } else {
          toast.error(data.error || "Wrong email or password.");
        }
      } catch (err) {
        toast.error("Network error: " + err.message);
      }
    }
  };

  const handleMechanicSubmit = async (e) => {
    e.preventDefault();
    if (!validateMechanic()) return;

    try {
      const response = await fetch(
        "http://localhost:5000/api/shop-owners/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            shopName: mechanicData.shopName,
            ownerName: mechanicData.ownerName,
            gstNumber: mechanicData.gstNumber,
            mobile: mechanicData.mobile,
            email: mechanicData.email,
            address: mechanicData.address,
            password: mechanicData.password,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Mechanic shop registration submitted for admin review!");
        setIsMechanicSignup(false);
        setIsSignup(false);
        setMechanicData({
          shopName: "",
          gstNumber: "",
          ownerName: "",
          mobile: "",
          email: "",
          address: "",
          password: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.error || "Something went wrong.");
      }
    } catch (err) {
      toast.error("Network error: " + err.message);
    }
  };

  return (
    <div className="flex h-screen bg-[#0f0f0f] overflow-hidden">
      {/* Left Side - Form - Fixed height, no overflow */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-hidden">
        <div className="w-full max-w-md h-full flex flex-col justify-center">
          {/* Logo */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">
              Mech<span className="text-red-600">2</span>Door
            </h1>
          </div>

          {isMechanicSignup ? (
            <>
              {/* Mechanic Signup */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">
                  Mechanic Shop Registration
                </h2>
                <p className="text-gray-400 text-sm">
                  Register your shop to get more customers
                </p>
              </div>

              {/* Mechanic Form - Scrollable with hidden scrollbar */}
              <form
                onSubmit={handleMechanicSubmit}
                className="space-y-4 overflow-y-auto pr-2 flex-1"
                style={{
                  maxHeight: "calc(100vh - 400px)", // Adjust based on header/footer height
                  scrollbarWidth: "none", // Firefox
                  msOverflowStyle: "none", // IE/Edge
                }}
              >
                {/* Hide scrollbar for Chrome/Safari */}
                <style jsx>{`
                  form::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Shop Name
                    </label>
                    <input
                      type="text"
                      name="shopName"
                      value={mechanicData.shopName}
                      onChange={handleMechanicChange}
                      className="w-full p-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Owner Name
                    </label>
                    <input
                      type="text"
                      name="ownerName"
                      value={mechanicData.ownerName}
                      onChange={handleMechanicChange}
                      className="w-full p-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    GST Number
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={mechanicData.gstNumber}
                    onChange={handleMechanicChange}
                    className="w-full p-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    value={mechanicData.mobile}
                    onChange={handleMechanicChange}
                    className="w-full p-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={mechanicData.email}
                    onChange={handleMechanicChange}
                    className="w-full p-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Shop Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={mechanicData.address}
                    onChange={handleMechanicChange}
                    className="w-full p-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={mechanicData.password}
                    onChange={handleMechanicChange}
                    placeholder="Min 8 chars"
                    className="w-full p-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={mechanicData.confirmPassword}
                    onChange={handleMechanicChange}
                    className="w-full p-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                >
                  Register Shop
                </button>
              </form>

              <p className="text-center text-sm text-gray-400 mt-6">
                Normal user?{" "}
                <button
                  onClick={() => {
                    setIsMechanicSignup(false);
                    setIsSignup(false);
                  }}
                  className="text-red-600 hover:underline"
                >
                  Back to login
                </button>
              </p>
            </>
          ) : (
            <>
              {/* Regular Login/Signup */}
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {isSignup ? "Get Started Now" : "Welcome back"}
                </h2>
                <p className="text-gray-400 text-sm">
                  {isSignup
                    ? "Enter your credentials to access your account"
                    : "Enter your credentials to access your account"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignup && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Rafiqur Rahman"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full p-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="rafiqur51@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm text-gray-400">
                      Password
                    </label>
                    {!isSignup && (
                      <button
                        type="button"
                        className="text-sm text-red-600 hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <input
                    type="password"
                    name="password"
                    placeholder="Min 8 chars"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full p-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-600"
                  />
                </div>

                {isSignup && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      className="w-4 h-4 rounded border-gray-700"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-400">
                      I agree to the{" "}
                      <a href="#" className="text-red-600 hover:underline">
                        Terms & Privacy
                      </a>
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
                >
                  {isSignup ? "Create account" : "Login"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-400 mt-6">
                {isSignup ? (
                  <>
                    Have an account?{" "}
                    <button
                      onClick={() => setIsSignup(false)}
                      className="text-red-600 hover:underline"
                    >
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    Don't have an account?{" "}
                    <button
                      onClick={() => setIsSignup(true)}
                      className="text-red-600 hover:underline"
                    >
                      Sign up
                    </button>
                    {" | "}
                    <button
                      onClick={() => setIsMechanicSignup(true)}
                      className="text-red-600 hover:underline"
                    >
                      Shop Owner?
                    </button>
                  </>
                )}
              </p>
            </>
          )}

          <p className="text-center text-xs text-gray-600 mt-8">
            2022 Acme. All right Reserved
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-br from-yellow-600 to-red-700 relative overflow-hidden">
        <video
          src={signIn}
          autoPlay
          loop
          muted
          playsInline
          className="absolute left-20 top-45 rounded-2xl w-[80%] h-auto object-cover"
        />
      </div>
    </div>
  );
}

export default SigninPage;
