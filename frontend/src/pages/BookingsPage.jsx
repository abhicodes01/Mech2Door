import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MapCenterUpdater from "../components/MapCenterUpdater";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import L from "leaflet";
import "leaflet-routing-machine";
// ⬇️ *** ADD THIS IMPORT for route line styling ***
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// --- Custom marker icons (Your code is correct) ---
const userIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const shopIcon = new L.DivIcon({
  className: "shop-marker",
  html: `
    <div style="
      background:#ef4444;
      color:#fff;
      border-radius:9999px;
      width:28px;height:28px;
      display:flex;align-items:center;justify-content:center;
      border:2px solid white;box-shadow:0 0 6px rgba(0,0,0,0.3);
    ">🔧</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});
// --- End Icons ---


// --- RouteLine Component (Added OSRM router) ---
function RouteLine({ from, to }) {
  const map = useMap();

  useEffect(() => {
    if (!from || !to) return;
    // Check for valid numbers
    if (!Number.isFinite(from[0]) || !Number.isFinite(from[1]) || !Number.isFinite(to[0]) || !Number.isFinite(to[1])) {
      return; 
    }

    const control = L.Routing.control({
      waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
      // ⬇️ *** ADD THIS ROUTER CONFIGURATION ***
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1'
      }),
      // --- End router config ---
      lineOptions: {
        styles: [{ color: "#22c55e", weight: 5, opacity: 0.8 }],
      },
      addWaypoints: false,
      routeWhileDragging: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      collapsible: true,
      createMarker: () => null, // we provide our own markers
    }).addTo(map);

    return () => {
      map.removeControl(control);
    };
  }, [from, to, map]); // Simplified dependency array

  return null;
}
// --- End RouteLine ---


// --- Main BookingsPage Component ---
export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  
  // Default map center (e.g., Indore) if no bookings exist
  const DEFAULT_CENTER = [22.7196, 75.8577]; 

  // Function to fetch bookings
  const fetchBookings = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const email = user.email || "";

    fetch(`http://localhost:5000/api/bookings?userEmail=${email}`)
      .then((res) => res.json())
      .then((data) => {
        setBookings(data);
        // Automatically select the first booking if none is selected
        if (!selectedBooking && data.length > 0) {
          setSelectedBooking(data[0]);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch bookings:", err);
        setBookings([]);
      });
  };
  
  // Fetch on initial load
  useEffect(() => {
    fetchBookings();
  }, []);

  // Re-fetch when returning from Stripe
  useEffect(() => {
    fetchBookings();
  }, [params.toString()]); 

  // Handle Stripe redirect toasts
  useEffect(() => {
    const status = params.get("status");
    if (status === "success")
      toast.success("Payment successful! Booking confirmed.");
    if (status === "cancel") toast.info("Payment cancelled.");
    // Remove query params after reading them
    if (status) {
      navigate("/bookings", { replace: true });
    }
  }, [params, navigate]);

  // ⬇️ *** MOVED handleCancelBooking INSIDE the component ***
  const handleCancelBooking = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );
    if (!confirmed) return;
    try {
      const res = await fetch(`http://localhost:5000/api/bookings/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        // ⬇️ *** This can now access setBookings ***
        setBookings((prev) => prev.filter((b) => b._id !== id));
        if (selectedBooking?._id === id) {
          setSelectedBooking(null); // Clear selection if it was cancelled
        }
        toast.success("Booking cancelled!");
      } else {
        toast.error(data.error || "Failed to cancel.");
      }
    } catch (err) {
      toast.error("Network error.");
    }
  };

  // ⬇️ *** FIX for Problem 1: Set initial center correctly ***
  const initialCenter = [
    selectedBooking?.userLat || bookings[0]?.userLat || DEFAULT_CENTER[0],
    selectedBooking?.userLng || bookings[0]?.userLng || DEFAULT_CENTER[1],
  ];

  return (
    <div className="flex min-h-screen bg-[#121212] pt-16 text-white">
      {/* Left: Bookings list */}
      <div className="w-full md:w-1/2 lg:w-2/5 p-8 h-[600px] overflow-y-auto">
        <h1 className="text-3xl font-semibold mb-6">Bookings</h1>
        <div className="space-y-6">
          {bookings.map((b) => ( // Removed 'idx'
            <div
              key={b._id} // Use unique _id from database
              className={`flex gap-5 bg-[#343841] rounded-lg shadow p-4 items-center hover:bg-[#444950] transition-colors cursor-pointer ${
                selectedBooking?._id === b._id ? 'border-2 border-red-00' : 'border-2 border-transparent'
              }`} // Highlight selected
              onClick={() => setSelectedBooking(b)} // Click to select
            >
              <img
                src={b.mechanicImage || b.image}
                alt={b.mechanicName}
                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <h3 className="font-bold text-lg">
                  {b.mechanicName || "Booking"}
                </h3>
                <p className="text-[#A0A0A0] text-sm">
                  User location : {b.location}
                </p>
                <div className="flex text-[#A0A0A0] text-sm gap-3 mt-1">
                  <span>Vehicle: {b.vehicle}</span>
                  {/* <span>Reviews: {b.reviews || "N/A"}</span> */}
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-[#343841] px-2 py-1 rounded">
                    {b.date}
                  </span>
                  <span className="text-xs bg-[#343841] px-2 py-1 rounded">
                    {b.time}
                  </span>
                </div>
                <div className="mt-2 font-semibold">{b.price}</div>
                <div className="flex gap-4 mt-4">
                  {/* "View" button is no longer needed as the card is clickable */}
                  <button
                    className="text-red-500 hover:underline font-medium"
                    onClick={(e) => {
                      e.stopPropagation(); // Stop click from bubbling to parent
                      handleCancelBooking(b._id);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* "No Bookings" Modal */}
      {bookings.length === 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#23272e] p-8 rounded-xl shadow-lg max-w-md w-full flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-3 text-white">
              You have no bookings
            </h2>
            <p className="text-[#A0A0A0] mb-6 text-center">
              It looks like you haven&apos;t booked any service yet.
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition"
            >
              Book Now
            </button>
          </div>
        </div>
      )}

      {/* Right: Map */}
      <div className="flex flex-1 justify-center items-start p-8">
        <div className="w-full max-w-xl h-[600px] rounded-lg overflow-hidden shadow-lg border border-[#343841]">
          {bookings.length > 0 && (
            <MapContainer
              key={initialCenter.join("-")} // Force re-render if initial center changes
              center={initialCenter} // ⬅️ *** FIX 1: Set initial center
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true} // Enabled scroll
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapCenterUpdater
                lat={selectedBooking?.userLat} // Animate only when selectedBooking changes
                lng={selectedBooking?.userLng}
              />

              {/* Loop 1: Show ALL shop markers */}
              {bookings.map((b) =>
                Number.isFinite(b.shopLat) && Number.isFinite(b.shopLng) ? (
                  <Marker
                    key={`shop-${b._id}`} // Use unique ID
                    position={[b.shopLat, b.shopLng]}
                    icon={shopIcon}
                  >
                    {/* ⬇️ *** FIX 2: Fixed shop popup *** */}
                    <Popup>
                      <b>{b.mechanicName || "Shop"}</b>
                      <br />
                      Mechanic Location
                    </Popup>
                  </Marker>
                ) : null
              )}

              {/* Loop 2: Show User Marker and Route ONLY for selectedBooking */}
              {selectedBooking &&
                Number.isFinite(selectedBooking.userLat) &&
                Number.isFinite(selectedBooking.userLng) &&
                Number.isFinite(selectedBooking.shopLat) &&
                Number.isFinite(selectedBooking.shopLng) && (
                  <>
                    {/* User marker with userIcon */}
                    <Marker
                      position={[
                        selectedBooking.userLat,
                        selectedBooking.userLng,
                      ]}
                      icon={userIcon}
                    >
                      <Popup>Your location</Popup>
                    </Marker>

                    {/* ⬇️ *** REMOVED duplicate shop marker *** */}

                    {/* Route between user and shop */}
                    <RouteLine
                      from={[selectedBooking.userLat, selectedBooking.userLng]}
                      to={[selectedBooking.shopLat, selectedBooking.shopLng]}
                    />
                  </>
                )}
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
}