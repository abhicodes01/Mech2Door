import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { FiSliders, FiStar, FiMapPin, FiTrendingUp } from "react-icons/fi";
import { toast } from "react-toastify";
import RequireAuthModal from "./RequireAuthmodal";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const filters = [
  { label: "Most Popular", icon: <FiTrendingUp /> },
  { label: "Top Rated", icon: <FiStar /> },
  { label: "Nearby", icon: <FiMapPin /> },
];

const mechanicFilters = [
  "All Cars",
  "Sedan",
  "SUV",
  "Electric",
  "Open Now",
  "Within 5km",
  "⭐️ 4.5+",
];

const mechanicCards = [
  {
    name: "AutoFix Garage",
    desc: "Expert car repairs • Open now",
    rating: "4.8",
    distance: "2.1km",
    image:
      "https://i.pinimg.com/1200x/fc/d6/99/fcd699e0cc41c3f549a34c43fa7fcfd8.jpg",
    carType: "Sedan",
    status: "Open",
    location: "Delhi,India",
    priceInINR: 799,
    shopLat: 28.6139, // <-- ADD THIS
    shopLng: 77.209,
  },
  {
    name: "Speedy Auto Care",
    desc: "Quick service. Affordable rates.",
    rating: "4.6",
    distance: "3.5km",
    image:
      "https://i.pinimg.com/1200x/92/c0/0b/92c00bd333b48da672aade7bfc1f7caa.jpg",
    carType: "SUV",
    status: "Closed",
    location: "Mumbai,India",
    priceInINR: 500,
    shopLat: 19.076, // <-- ADD THIS
    shopLng: 72.8777,
  },
  {
    name: "Express Mechanix",
    desc: "All models. Genuine parts.",
    rating: "4.7",
    distance: "1.8km",
    image:
      "https://i.pinimg.com/736x/c6/6f/cd/c66fcd35627eb27e612c504902555131.jpg",
    carType: "Electric",
    status: "Open",
    location: "Indore,India",
    priceInINR: 1000,
    shopLat: 22.7196, // <-- ADD THIS
    shopLng: 75.8577,
  },
  {
    name: "Premium Wheels Garage",
    desc: "Electric cars specialist.",
    rating: "4.9",
    distance: "4.2km",
    image:
      "https://i.pinimg.com/1200x/1c/4f/f2/1c4ff29a720412ac7a1f7df4c78e1e01.jpg",
    carType: "Sedan",
    status: "Open",
    location: "Delhi,India",
    priceInINR: 400,
    shopLat: 22.7196, // <-- ADD THIS
    shopLng: 75.8577,
  },
  {
    name: "Wheels Garage",
    desc: "Electric cars specialist.",
    rating: "4.9",
    distance: "4.2km",
    image:
      "https://i.pinimg.com/1200x/c0/26/a1/c026a1d4d7f68f4ec07d2aac28c937f5.jpg",
    carType: "Sports",
    status: "Open",
    location: "Mumbai,India",
    priceInINR: 2000,
    shopLat: 22.7196, // <-- ADD THIS
    shopLng: 75.8577,
  },
];

function ServicesSection() {
  const location = useLocation();

  const [activeFilter, setActiveFilter] = useState(filters[0].label);
  const [activeMechanicFilters, setActiveMechanicFilters] = useState(new Set());
  const INITIAL_VISIBLE = 4;
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedMechanic, setSelectedMechanic] = useState(null);

  const [problemDescription, setProblemDescription] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");

  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [homeAddress, setHomeAddress] = useState("");

  const [bookingName, setBookingName] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  // Reactive auth
  const [authed, setAuthed] = useState(
    localStorage.getItem("isAuthenticated") === "true"
  );
  useEffect(() => {
    setAuthed(localStorage.getItem("isAuthenticated") === "true");
  }, [location.pathname]);

  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude.toFixed(5),
            lng: position.coords.longitude.toFixed(5),
          });
          setUseCurrentLocation(true);
        },
        () => {
          setCurrentLocation(null);
          setUseCurrentLocation(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
      setUseCurrentLocation(false);
    }
  };

  async function geocodeAddress(address) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}`
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return { lat: data[0].lat, lng: data[0].lon };
    }
    return null;
  }

  const toggleMechanicFilter = (filter) => {
    const updated = new Set(activeMechanicFilters);
    updated.has(filter) ? updated.delete(filter) : updated.add(filter);
    setActiveMechanicFilters(updated);
    setVisibleCount(INITIAL_VISIBLE);
  };

  const filteredCards = mechanicCards.filter((card) => {
    if (activeMechanicFilters.size > 0) {
      if (activeMechanicFilters.has("Open Now") && card.status !== "Open") {
        return false;
      }
      if (
        Array.from(activeMechanicFilters).some(
          (f) => f === "Sedan" || f === "SUV" || f === "Electric"
        ) &&
        !activeMechanicFilters.has(card.carType)
      ) {
        return false;
      }
    }

    if (activeFilter === "Top Rated" && parseFloat(card.rating) < 4.7)
      return false;
    if (activeFilter === "Nearby" && parseFloat(card.distance) > 5)
      return false;

    const search = searchTerm.trim().toLowerCase();
    if (search) {
      if (
        !card.name.toLowerCase().includes(search) &&
        (!card.location || !card.location.toLowerCase().includes(search))
      ) {
        return false;
      }
    }

    return true;
  });

  const total = filteredCards.length;
  const shown = Math.min(visibleCount, total);
  const canShowMore = shown < total;
  const canShowLess = shown > INITIAL_VISIBLE;

  const openBookingPopup = (mechanic) => {
    setSelectedMechanic(mechanic);
    setPopupOpen(true);
    setProblemDescription("");
    setBookingDate("");
    setBookingTime("");
    setBookingName("");
    setVehicleNumber("");
    setHomeAddress("");
    setUseCurrentLocation(false);
    setCurrentLocation(null);
  };

  const closeBookingPopup = () => {
    setPopupOpen(false);
    setSelectedMechanic(null);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    async function geocodePlace(q) {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q
        )}`
      );
      const data = await res.json();
      if (data?.length)
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      return null;
    }

    // 1) Determine user's coords (you already compute coords)
    let userCoords = currentLocation;
    if (!useCurrentLocation && homeAddress) {
      userCoords = await geocodeAddress(homeAddress);
      if (!userCoords) {
        toast.error("Could not find coordinates for the provided address.");
        return;
      }
    }

    // 2) Determine shop coords from card location string (e.g., "Mumbai,India")
    const shopCoords =
      selectedMechanic.lat && selectedMechanic.lng
        ? { lat: selectedMechanic.lat, lng: selectedMechanic.lng } // if you already have them in the card
        : await geocodePlace(selectedMechanic.location);

    if (!shopCoords) {
      toast.error("Could not find coordinates for the shop location.");
      return;
    }

    const bookingPayload = {
      userEmail: localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user")).email
        : "",
      name: bookingName,
      vehicle: vehicleNumber,
      location: useCurrentLocation
        ? `Lat: ${coords.lat}, Lng: ${coords.lng}`
        : homeAddress,
      userLat: userCoords?.lat, // Use userLat
      userLng: userCoords?.lng, // Use userLng
      shopLat: selectedMechanic.shopLat, // Send shopLat
      shopLng: selectedMechanic.shopLng,
      mechanicName: selectedMechanic.name,
      mechanicImage: selectedMechanic.image,
      problemDescription,
      date: bookingDate,
      time: bookingTime || "1PM",
      priceInINR: selectedMechanic.priceInINR, // use price from the card
    };

    try {
      const res = await fetch(
        "http://localhost:5000/api/payments/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingPayload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to initiate payment.");
        return;
      }

      const stripe = await stripePromise;
      // Redirect to Stripe Checkout
      window.location.href = data.url; // or await stripe.redirectToCheckout({ sessionId: data.id });
    } catch (err) {
      toast.error("Network error.");
    }
  };

  return (
    <section className="flex gap-8 py-10 px-8 bg-[#121212] relative">
      {/* Left Filters */}
      <aside className="max-w-[220px] bg-[#1E1E1E] rounded-xl p-6 flex flex-col gap-3 shadow-lg h-[520px] overflow-y-auto">
        <h3 className="font-bold text-[#EAEAEA] text-lg mb-4 flex items-center gap-2">
          <FiSliders />
          Filter Options
        </h3>
        {mechanicFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => toggleMechanicFilter(filter)}
            className={`text-left px-3 py-2 rounded transition font-medium ${
              activeMechanicFilters.has(filter)
                ? "bg-red-600 text-white"
                : "text-[#A0A0A0] hover:bg-gray-500"
            }`}
          >
            {filter}
          </button>
        ))}
      </aside>

      {/* Right: Heading, FilterBar, Cards */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-2xl font-bold mb-4 text-[#EAEAEA]">
          Find Mechanic Shop Services
        </h2>

        <div className="flex gap-3 mb-6">
          {filters.map((f) => (
            <button
              key={f.label}
              onClick={() => {
                setActiveFilter(f.label);
                setVisibleCount(INITIAL_VISIBLE);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border font-medium transition ${
                activeFilter === f.label
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-red-100"
              }`}
            >
              {f.icon} {f.label}
            </button>
          ))}

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setVisibleCount(INITIAL_VISIBLE);
            }}
            placeholder="Search by name or location"
            className="px-4 py-2 rounded-full bg-gray-200 placeholder:text-gray-700 font-medium border border-[#343841] focus:outline-none"
            style={{ minWidth: 240 }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
          {filteredCards.slice(0, shown).map((card, idx) => (
            <div
              key={`${card.name}-${idx}`}
              className="bg-[#1E1E1E] rounded-xl shadow-sm p-5 flex flex-col gap-3 transition hover:shadow-lg relative"
            >
              <img
                src={card.image}
                alt={card.name}
                className="rounded-lg h-36 w-full object-cover mb-3"
              />
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-lg text-[#EAEAEA]">
                    {card.name}
                  </h3>
                  <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded font-medium">
                    {card.rating} ★
                  </span>
                </div>
                <p className="text-sm text-gray-400">{card.location}</p>
                <p className="text-sm text-gray-500">{card.desc}</p>
              </div>
              <div className="mt-1 font-semibold text-green-400">
                ₹{card.priceInINR}
              </div>
              <span className="text-xs text-gray-400">
                {card.distance} away
              </span>

              <button
                onClick={() => {
                  if (authed) openBookingPopup(card);
                  else setAuthPromptOpen(true);
                }}
                className="absolute bottom-2 right-3 bg-red-600 text-white font-semibold px-2 py-1 rounded hover:bg-red-700 transition"
              >
                Book Now
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-center gap-3">
          {canShowMore && (
            <button
              onClick={() => setVisibleCount((c) => Math.min(c + 4, total))}
              className="px-6 py-2 rounded-full bg-red-600 text-white font-semibold shadow hover:bg-red-700 transition"
            >
              Show More
            </button>
          )}
          {canShowLess && (
            <button
              onClick={() => setVisibleCount(INITIAL_VISIBLE)}
              className="px-6 py-2 rounded-full bg-gray-700 text-white font-semibold shadow hover:bg-gray-600 transition"
            >
              Show Less
            </button>
          )}
        </div>
      </div>

      {/* Booking Popup */}
      {popupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 px-4">
          <div className="bg-[#262a31] rounded-xl px-6 py-3 max-w-4xl w-full shadow-lg flex gap-6">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">
                Booking for {selectedMechanic.name}
              </h3>

              <form onSubmit={handleBookingSubmit} className="space-y-2">
                <div>
                  <label className="block text-[#A0A0A0] mb-2">Your Name</label>
                  <input
                    required
                    type="text"
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded border border-gray-600 bg-[#1E1E1E] px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#A0A0A0] mb-2">
                    Vehicle Number
                  </label>
                  <input
                    required
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="Enter vehicle number"
                    className="w-full rounded border border-gray-600 bg-[#1E1E1E] px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 items-center">
                  <label className="block text-[#A0A0A0] mb-2">Date</label>
                  <input
                    required
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full rounded border border-gray-600 bg-[#1E1E1E] px-3 py-2 text-white focus:outline-none"
                  />

                  <label className="block text-[#A0A0A0] mb-2">Timings</label>
                  <input
                    required
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full rounded border border-gray-600 bg-[#1E1E1E] px-3 py-2 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#A0A0A0] mb-2">Location</label>
                  <div className="flex gap-3 mb-2">
                    <button
                      type="button"
                      className={`px-3 py-1 rounded ${
                        useCurrentLocation
                          ? "bg-red-600 text-white"
                          : "bg-gray-700 text-gray-300"
                      }`}
                      onClick={getCurrentLocation}
                    >
                      Current Location
                    </button>
                    <button
                      type="button"
                      className={`px-3 py-1 rounded ${
                        !useCurrentLocation
                          ? "bg-red-600 text-white"
                          : "bg-gray-700 text-gray-300"
                      }`}
                      onClick={() => {
                        setUseCurrentLocation(false);
                        setCurrentLocation(null);
                      }}
                    >
                      Home Address
                    </button>
                  </div>
                  {useCurrentLocation ? (
                    <div className="text-sm text-white mb-3">
                      {currentLocation
                        ? `Lat: ${currentLocation.lat}, Lng: ${currentLocation.lng}`
                        : "Fetching current location..."}
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="Enter your home address"
                      className="w-full rounded border border-gray-600 bg-[#1E1E1E] px-3 py-2 text-white focus:outline-none"
                      value={homeAddress}
                      onChange={(e) => setHomeAddress(e.target.value)}
                      required={!useCurrentLocation}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[#A0A0A0] mb-2">
                    Describe problem with vehicle
                  </label>
                  <textarea
                    required
                    placeholder="Describe the issue"
                    className="w-full rounded border border-gray-600 bg-[#1E1E1E] px-3 py-2 text-white resize-none focus:outline-none"
                    rows={4}
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                  />
                </div>

                <div className="bg-[#1E1E1E] rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Amount</span>
                    <span className="text-xl font-bold text-green-400">
                      ₹{selectedMechanic?.priceInINR ?? 0}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={closeBookingPopup}
                    className="px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <RequireAuthModal
        open={authPromptOpen}
        onClose={() => setAuthPromptOpen(false)}
      />
    </section>
  );
}

export default ServicesSection;
