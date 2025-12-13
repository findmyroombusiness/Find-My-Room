
import Footer from "../components/Footer";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  DollarSign,
  MapPin,
  Phone,
  Bed,
  Home,
  Users,
  Utensils,
  Zap,
  Droplet,
  Beef,
  Bath,
  ChefHat,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { apiFetch } from "../utils/apiFetch";

// Reusable Detail Item Component
const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
    <div className="text-[rgb(77,95,171)]">{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-gray-800 font-semibold">{value}</p>
    </div>
  </div>
);

const RoomDetail = () => {
  const { id } = useParams();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const mobileScrollRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/roommaterooms/${id}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch room");
        setRoom(data);
        setCurrentIndex(0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchRoom();
  }, [id]);

  const handleNext = () => {
    if (!room || !room.images) return;
    const nextIndex = (currentIndex + 1) % room.images.length;
    setCurrentIndex(nextIndex);
    scrollToIndex(nextIndex);
  };

  const handlePrev = () => {
    if (!room || !room.images) return;
    const prevIndex =
      currentIndex === 0 ? room.images.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    scrollToIndex(prevIndex);
  };

  const scrollToIndex = (index) => {
    if (mobileScrollRef.current) {
      mobileScrollRef.current.scrollTo({
        left: index * mobileScrollRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const distance = touchStartX.current - touchEndX.current;
    const threshold = 50;
    if (!room || !room.images || room.images.length <= 1) return;
    if (distance > threshold) {
      const nextIndex = (currentIndex + 1) % room.images.length;
      setCurrentIndex(nextIndex);
      scrollToIndex(nextIndex);
    } else if (distance < -threshold) {
      const prevIndex = currentIndex === 0 ? room.images.length - 1 : currentIndex - 1;
      setCurrentIndex(prevIndex);
      scrollToIndex(prevIndex);
    } else {
      scrollToIndex(currentIndex);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-gray-500 text-xl">Loading room details...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-red-500 text-xl">{error}</p>
        </div>
      </div>
    );

  if (!room) return null;

  return (
    <div className="min-h-[81vh] bg-white">
      <Navbar />
      <div className="bg-gray-100 md:py-7 px-4 pb-4 pt-20 md:pt-10">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Desktop Slider */}
          <div className="relative overflow-hidden hidden md:block">
            {room.images && room.images.length > 0 ? (
              <img
                src={room.images[currentIndex]}
                alt={`Room ${currentIndex + 1}`}
                className="w-full h-80 md:h-[500px] object-cover transition-all duration-700"
              />
            ) : (
              <div className="w-full h-80 md:h-[500px] flex items-center justify-center bg-gray-200 text-gray-500 text-lg">
                No image provided
              </div>
            )}
            {room.images && room.images.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-[rgb(77,95,171)] text-white p-2 rounded-full shadow hover:opacity-90 transition"
                >
                  <ChevronLeft />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-[rgb(77,95,171)] text-white p-2 rounded-full shadow hover:opacity-90 transition"
                >
                  <ChevronRight />
                </button>
                <div className="absolute bottom-3 w-full flex justify-center space-x-2">
                  {room.images.map((_, i) => (
                    <span
                      key={i}
                      className={`h-2 w-2 rounded-full ${
                        i === currentIndex ? "bg-[rgb(77,95,171)]" : "bg-gray-300"
                      } cursor-pointer`}
                      onClick={() => {
                        setCurrentIndex(i);
                        scrollToIndex(i);
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Mobile Slider */}
          <div className="block md:hidden">
            <div
              className="flex overflow-hidden w-full h-80"
              ref={mobileScrollRef}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              {room.images && room.images.length > 0 ? (
                room.images.map((img, i) => (
                  <div key={i} className="flex-shrink-0 w-full h-80">
                    <img
                      src={img}
                      alt={`Room ${i + 1}`}
                      className="h-80 w-full object-cover rounded-lg"
                    />
                  </div>
                ))
              ) : (
                <div className="flex-shrink-0 w-full h-80 flex items-center justify-center bg-gray-200 text-gray-500 text-lg">
                  No image provided
                </div>
              )}
            </div>
            {/* Mobile Dots */}
            <div className="w-full flex justify-center space-x-2 mt-2">
              {room.images && room.images.length > 0 && room.images.map((_, i) => (
                <span
                  key={i}
                  className={`h-2 w-2 rounded-full ${i === currentIndex ? "bg-[rgb(77,95,171)]" : "bg-gray-300"}`}
                  onClick={() => {
                    setCurrentIndex(i);
                    scrollToIndex(i);
                  }}
                />
              ))}
            </div>
          </div>
          {/* Details Section */}
          <div className="p-6 md:p-10">
            <h1 className="text-2xl font-bold text-[rgb(77,95,171)] mb-4">
              Room Details
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem
                icon={<DollarSign />}
                label="Rent"
                value={`₹${room.rent}`}
              />
              <DetailItem icon={<MapPin />} label="Address" value={room.address} />
              {/* Contact + Call Button (only phone screens) */}
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                <div className="text-[rgb(77,95,171)]">
                  <Phone />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="text-gray-800 font-semibold">{room.contact}</p>
                </div>
                <a
                  href={`tel:${room.contact}`}
                  className="ml-auto block bg-[rgb(77,95,171)] text-white px-4 py-2 rounded-lg text-sm font-medium shadow transform active:scale-95 transition duration-200 hover:opacity-90"
                  style={{ maxWidth: 100, textAlign: "center" }}
                >
                  Call
                </a>
              </div>
              <DetailItem
                icon={<Bed />}
                label="Rooms"
                value={`${room.rooms} Rooms`}
              />
              <DetailItem
                icon={<Home />}
                label="Furnishing"
                value={room.furnishing}
              />
              <DetailItem
                icon={<Users />}
                label="For Whom"
                value={room.forWhom}
              />
              <DetailItem
                icon={<Bed />}
                label="Type"
                value={room.independent}
              />
              <DetailItem
                icon={<Utensils />}
                label="Cooking"
                value={room.cooking}
              />
              <DetailItem
                icon={<Zap />}
                label="Electricity Bill"
                value={room.electricitybill}
              />
              <DetailItem
                icon={<Droplet />}
                label="Water Bill"
                value={room.waterbill}
              />
              <DetailItem icon={<Beef />} label="Food" value={room.food} />
              <DetailItem icon={<Bath />} label="Washroom" value={room.washroom} />
              <DetailItem icon={<ChefHat />} label="Kitchen" value={room.kitchen} />
            </div>
            {/* Description */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-[rgb(77,95,171)] mb-2">
                Description
              </h2>
              <p className="text-gray-700">{room.description}</p>
            </div>
            {/* Map Link */}
            {room.mapLink && (
              <div className="mt-6">
                <a
                  href={room.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-[rgb(77,95,171)] text-white font-medium rounded-xl inline-block hover:opacity-90 transition"
                >
                  View on Google Maps
                </a>
              </div>
            )}
            {/* Posted info */}
            {room.user || room.createdAt ? (
              <div className="mt-6 text-sm text-gray-600">
                {room.user && (
                  <div>
                    Posted by:{" "}
                    <span className="font-semibold text-gray-800">
                      {room.user.name || room.user.email}
                    </span>
                  </div>
                )}
                {room.createdAt && (
                  <div className="mt-1">
                    Posted on:{" "}
                    <span className="text-gray-500">
                      {new Date(room.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const RoommateRoomDetailWithFooter = () => (
  <>
    <RoomDetail />
    <Footer />
  </>
);
export default RoommateRoomDetailWithFooter;
