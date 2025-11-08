import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MapCenterUpdater from "../components/MapCenterUpdater";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import L from "leaflet";
import "leaflet-routing-machine";

const parseLatLngFromString = (str) => {
  const m = String(str || "").match(/Lat:\s*([-\d.]+)\s*,\s*Lng:\s*([-\d.]+)/i);
  if (!m) return null;
  const lat = parseFloat(m[1]);
  const lng = parseFloat(m[2]);
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
};

// Custom marker icons
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
      setBookings((prev) => prev.filter((b) => b._id !== id));
      toast.success("Booking cancelled!");
    } else {
      toast.error(data.error || "Failed to cancel.");
    }
  } catch (err) {}
};

function RouteLine({ from, to }) {
  const map = useMap();

  useEffect(() => {
    if (!from || !to) return;

    const control = L.Routing.control({
      waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
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
  }, [from?.[0], from?.[1], to?.[0], to?.[1], map]);

  return null;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Replace this with your actual user logic (localStorage, context, etc.)
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const email = user.email || "";

    // Fetch from your backend API
    fetch(`http://localhost:5000/api/bookings?userEmail=${email}`)
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .catch((err) => {
        setBookings([]);
      });
  }, []);

  const [params] = useSearchParams();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const email = user.email || "";
    fetch(`http://localhost:5000/api/bookings?userEmail=${email}`)
      .then((res) => res.json())
      .then((data) => setBookings(data))
      .catch(() => setBookings([]));
  }, [params.toString()]); // re-fetch when returning from Stripe

  useEffect(() => {
    const status = params.get("status");
    if (status === "success")
      toast.success("Payment successful! Booking confirmed.");
    if (status === "cancel") toast.info("Payment cancelled.");
  }, [params]);

  return (
    <div className="flex min-h-screen bg-[#121212] pt-16 text-white">
      {/* Left: Bookings list */}
      <div className="w-full md:w-1/2 lg:w-2/5 p-8 h-[600px] overflow-y-auto">
        <h1 className="text-3xl font-semibold mb-6">Bookings</h1>
        <div className="space-y-6">
          {bookings.map((b, idx) => (
            <div
              key={idx}
              className="flex gap-5 bg-[#343841] rounded-lg shadow p-4 items-center hover:bg-[#444950] transition-colors"
            >
              <img
                src={b.mechanicImage || b.image}
                alt={b.name}
                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <h3 className="font-bold text-lg">
                  {b.mechanicName || b.name}
                </h3>
                <p className="text-[#A0A0A0] text-sm">
                  User location : {b.location}
                </p>
                <div className="flex text-[#A0A0A0] text-sm gap-3 mt-1">
                  <span>Vehicle: {b.vehicle}</span>
                  <span>Reviews: {b.reviews || "N/A"}</span>
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
                  <button
                    className="text-blue-400 hover:underline font-medium"
                    onClick={() => setSelectedBooking(b)}
                  >
                    View
                  </button>
                  <button
                    className="text-red-500 hover:underline font-medium"
                    onClick={() => handleCancelBooking(b._id)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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

      {/* Right: Map, showing all bookings as markers */}
      <div className="flex flex-1 justify-center items-start p-8">
        <div className="w-full max-w-xl h-[600px] rounded-lg overflow-hidden shadow-lg border border-[#343841]">
          {bookings.length > 0 && (
            <MapContainer
              center={[
                selectedBooking?.lat || bookings[0]?.lat || 0,
                selectedBooking?.lng || bookings[0]?.lng || 0,
              ]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapCenterUpdater
  lat={selectedBooking?.userLat ?? selectedBooking?.userlat ?? bookings[0]?.userLat ?? 0}
  lng={selectedBooking?.userLng ?? selectedBooking?.userlng ?? bookings[0]?.userLng ?? 0}
/>

              {bookings.map((b, idx) =>
                Number.isFinite(b.shopLat) && Number.isFinite(b.shopLng) ? (
                  <Marker
                    key={idx}
                    position={[b.shopLat, b.shopLng]}
                    icon={shopIcon}
                  >
                    <Popup>
                      <b>{b.mechanicName || b.name}</b>
                      <br />
                      {b.location /* user-readable address string */}
                    </Popup>
                  </Marker>
                ) : null
              )}

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

                    {/* Highlight shop marker */}
                    <Marker
                      position={[
                        selectedBooking.shopLat,
                        selectedBooking.shopLng,
                      ]}
                      icon={shopIcon}
                    >
                      <Popup>
                        <b>
                          {selectedBooking.mechanicName || selectedBooking.name}
                        </b>
                        <br />
                        {selectedBooking.location}
                      </Popup>
                    </Marker>

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
