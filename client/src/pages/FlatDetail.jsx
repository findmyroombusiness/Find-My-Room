// FlatDetail.jsx
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
  Zap,
  Droplet,
  Beef,
  Bath,
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

const FlatDetail = () => {
  const { id } = useParams();
  const [flat, setFlat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const mobileScrollRef = useRef(null);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Fetch flat details
  useEffect(() => {
    const fetchFlat = async () => {
      setLoading(true);
      setError("");
      try {
          const res = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/flats/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch flat");
        setFlat(data);
        setCurrentIndex(0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchFlat();
  }, [id]);

  // Slider handlers
  const handleNext = () => {
    if (!flat || !flat.images) return;
    const nextIndex = (currentIndex + 1) % flat.images.length;
    setCurrentIndex(nextIndex);
    scrollToIndex(nextIndex);
  };

  const handlePrev = () => {
    if (!flat || !flat.images) return;
    const prevIndex = currentIndex === 0 ? flat.images.length - 1 : currentIndex - 1;
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

  // Mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const distance = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (!flat || !flat.images || flat.images.length <= 1) return;

    if (distance > threshold) {
      const nextIndex = (currentIndex + 1) % flat.images.length;
      setCurrentIndex(nextIndex);
      scrollToIndex(nextIndex);
    } else if (distance < -threshold) {
      const prevIndex = currentIndex === 0 ? flat.images.length - 1 : currentIndex - 1;
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
          <p className="text-gray-500 text-xl">Loading flat details...</p>
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

  if (!flat) return null;

  return (
    <div className="min-h-[81vh] bg-white">
      <Navbar />
      <div className="bg-gray-100 md:py-7 px-4 pb-4 pt-20 md:pt-10">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Desktop Slider */}
          <div className="relative overflow-hidden hidden md:block">
            {flat.images && flat.images.length > 0 ? (
              <img
                src={flat.images[currentIndex]}
                alt={`Flat ${currentIndex + 1}`}
                className="w-full h-80 md:h-[500px] object-cover transition-all duration-700"
              />
            ) : (
              <div className="w-full h-80 md:h-[500px] flex items-center justify-center bg-gray-200 text-gray-500 text-lg">
                No image provided
              </div>
            )}
            {flat.images && flat.images.length > 1 && (
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
                  {flat.images.map((_, i) => (
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
              {flat.images && flat.images.length > 0 ? (
                flat.images.map((img, i) => (
                  <div key={i} className="flex-shrink-0 w-full h-80">
                    <img
                      src={img}
                      alt={`Flat ${i + 1}`}
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
              {flat.images && flat.images.length > 0 && flat.images.map((_, i) => (
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

          {/* Flat Details Section */}
          <div className="p-6 md:p-10">
            <h1 className="text-2xl font-bold text-[rgb(77,95,171)] mb-4">
              Flat Details
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem icon={<DollarSign />} label="Rent" value={`₹${flat.rent}`} />
              <DetailItem icon={<MapPin />} label="Address" value={flat.address} />
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                <div className="text-[rgb(77,95,171)]">
                  <Phone />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="text-gray-800 font-semibold">{flat.contact}</p>
                </div>
                <a
                  href={`tel:${flat.contact}`}
                  className="ml-auto block bg-[rgb(77,95,171)] text-white px-4 py-2 rounded-lg text-sm font-medium shadow transform active:scale-95 transition duration-200 hover:opacity-90"
                  style={{ maxWidth: 100, textAlign: "center" }}
                >
                  Call
                </a>
              </div>
              <DetailItem icon={<Bed />} label="BHK" value={flat.bhk} />
              <DetailItem icon={<Home />} label="Furnishing" value={flat.furnishing} />
              <DetailItem icon={<Users />} label="For Whom" value={flat.forWhom} />
              <DetailItem icon={<Bed />} label="Type" value={flat.independent} />
              <DetailItem icon={<Zap />} label="Electricity Bill" value={flat.electricitybill} />
              <DetailItem icon={<Droplet />} label="Water Bill" value={flat.waterbill} />
              <DetailItem icon={<Beef />} label="Food" value={flat.food} />
              <DetailItem icon={<Bath />} label="Washrooms" value={flat.washrooms} />
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-[rgb(77,95,171)] mb-2">Description</h2>
              <p className="text-gray-700">{flat.description}</p>
            </div>

            {flat.mapLink && (
              <div className="mt-6">
                <a
                  href={flat.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-[rgb(77,95,171)] text-white font-medium rounded-xl inline-block hover:opacity-90 transition"
                >
                  View on Google Maps
                </a>
              </div>
            )}

            {flat.user || flat.createdAt ? (
              <div className="mt-6 text-sm text-gray-600">
                {flat.user && (
                  <div>
                    Posted by:{" "}
                    <span className="font-semibold text-gray-800">
                      {flat.user.name || flat.user.email}
                    </span>
                  </div>
                )}
                {flat.createdAt && (
                  <div className="mt-1">
                    Posted on:{" "}
                    <span className="text-gray-500">
                      {new Date(flat.createdAt).toLocaleDateString()}
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

const FlatDetailWithFooter = () => (
  <>
    <FlatDetail />
    <Footer />
  </>
);

export default FlatDetailWithFooter;
