import React, { useRef, useState } from "react";
import defaultUser from "../assets/icons8-profile-50.png";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

function ProfilePage() {
  // State for editable info
  const [profileImg, setProfileImg] = useState(defaultUser);
  const [name, setName] = useState("Maria Fernanda");
  const [email, setEmail] = useState("maria@example.com");
  const [phone, setPhone] = useState("+1 123-456-7890");
  const [vehicle, setVehicle] = useState("MH01AB1234");
  const [dob, setDob] = useState("1998-01-01");
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/"); // Redirect to home, triggers sign-in screen if you're using auth logic on "/"
  };
  // Image upload handler
  const handleImgChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfileImg(ev.target.result);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Example save handler
  const handleSave = async (e) => {
  e.preventDefault();
  try {
    const res = await fetch("http://localhost:5000/api/user/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email, // use the current user's email for lookup
        firstName: name.split(" ")[0],
        lastName: name.split(" ").slice(1).join(" "),
        image: profileImg,
        vehicle,
        phone,
        dob
      })
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Profile updated!");
      // Optionally update localStorage or context
    } else {
      toast.error(data.error || "Update failed.");
    }
  } catch (err) {
    toast.error("Network error.");
  }
};



  return (
    <section className="min-h-screen bg-[#121212] px-4 py-10">
      <div className="container mx-auto px-7 mt-16">
        <h2 className="text-4xl font-bold text-white">Profile</h2>
        <p className="text-[#A0A0A0] mb-8">View and edit your profile details here.</p>
        <form className="flex flex-col md:flex-row gap-8" onSubmit={handleSave}>
          {/* Left: Profile card */}
          <div className="flex-1 bg-[#262a31] rounded-2xl border border-[#343841] flex flex-col items-center justify-center shadow py-8">
            <div className="relative">
              <div className="w-40 h-40 rounded-full border-4 border-[#343841] overflow-hidden mb-4">
                <img src={profileImg} alt="Profile" className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                className="absolute bottom-4 right-2 bg-[#343841] hover:bg-[#444950] text-white px-4 py-1 text-xs rounded-full"
                onClick={() => fileInputRef.current.click()}
              >
                Update Image
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImgChange}
              />
            </div>
            <input
              className="text-2xl font-semibold text-center text-white mb-1 bg-transparent border-b border-[#444] py-1 my-2 w-3/4 focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          {/* Right: Info card */}
          <div className="flex-[2] bg-[#262a31] rounded-2xl border border-[#343841] p-8 md:p-10 flex flex-col gap-3 shadow">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-semibold text-white">Bio &amp; details</h4>
              <span className="w-3 h-3 rounded-full bg-green-400 block"></span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6">
              <div>
                <span className="text-[#A0A0A0]">Email</span>
                <input
                  className="text-white font-semibold bg-transparent border-b border-[#444] py-1 w-full focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                />
              </div>
              <div>
                <span className="text-[#A0A0A0]">Phone Number</span>
                <input
                  className="text-white font-semibold bg-transparent border-b border-[#444] py-1 w-full focus:outline-none"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  required
                />
              </div>
              <div>
                <span className="text-[#A0A0A0]">Vehicle Number</span>
                <input
                  className="text-white font-semibold bg-transparent border-b border-[#444] py-1 w-full focus:outline-none"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  type="text"
                  required
                />
              </div>
              <div>
                <span className="text-[#A0A0A0]">Date of Birth</span>
                <input
                  className="text-white font-semibold bg-transparent border-b border-[#444] py-1 w-full focus:outline-none"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  type="date"
                  required
                />
              </div>
            </div>
            <div className="flex justify-end mt-10">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded text-white font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

export default ProfilePage;
