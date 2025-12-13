import Footer from "../components/Footer";
import React, { useState, useEffect, useRef } from "react";
import {
  DollarSign,
  MapPin,
  Phone,
  Users,
  Clock,
  Utensils,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import Navbar from "../components/Navbar";
import { useParams } from "react-router-dom";
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

const HostelDetail = () => {
  const { id } = useParams();
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const mobileScrollRef = useRef(null);

  // Track touch positions for mobile swipe
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const fetchHostel = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/hostels/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch hostel details");
        setHostel(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHostel();
  }, [id]);

  // Desktop arrows
  const handleNext = () =>
    setCurrentIndex((prev) => (prev + 1) % (hostel?.images.length || 1));
  const handlePrev = () =>
    setCurrentIndex((prev) =>
      prev === 0 ? (hostel?.images.length || 1) - 1 : prev - 1
    );

  // Scroll to index for mobile
  const scrollToIndex = (index) => {
    if (mobileScrollRef.current) {
      mobileScrollRef.current.scrollTo({
        left: index * mobileScrollRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
    setCurrentIndex(index);
  };

  // Mobile swipe handlers
  const handleTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const distance = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (distance > threshold) {
      // Swipe left → next
      const nextIndex = (currentIndex + 1) % hostel.images.length;
      scrollToIndex(nextIndex);
    } else if (distance < -threshold) {
      // Swipe right → prev
      const prevIndex = currentIndex === 0 ? hostel.images.length - 1 : currentIndex - 1;
      scrollToIndex(prevIndex);
    } else {
      scrollToIndex(currentIndex);
    }
  };

  if (loading)
      return (
        <div className="min-h-screen bg-white flex flex-col">
          <Navbar />
          <div className="flex-1 flex justify-center items-center">
            <p className="text-gray-500 text-xl">Loading hostel details...</p>
          </div>
        </div>
      );
  if (error)
      return (
        <div className="min-h-screen bg-white flex flex-col">
          <Navbar />
          <div className="flex-1 flex justify-center items-center">
            <p className="text-red-500 text-xl">{error}</p>
          </div>
        </div>
      );
  if (!hostel) return null;

  return (
    <div className="min-h-[81vh] bg-white">
      <Navbar />
      <div className="bg-gray-100 md:py-7 px-4 pb-4 pt-20 md:pt-10">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Desktop Slider */}
          <div className="relative overflow-hidden hidden md:block">
            {hostel.images && hostel.images.length > 0 ? (
              <img
                src={hostel.images[currentIndex]}
                alt={`Hostel ${currentIndex + 1}`}
                className="w-full h-80 md:h-[500px] object-cover transition-all duration-700"
              />
            ) : (
              <div className="w-full h-80 md:h-[500px] flex items-center justify-center bg-gray-200 text-gray-500 text-lg">
                No image provided
              </div>
            )}
            {hostel.images.length > 1 && (
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
                  {hostel.images.map((_, i) => (
                    <span
                      key={i}
                      className={`h-2 w-2 rounded-full ${
                        i === currentIndex ? "bg-[rgb(77,95,171)]" : "bg-gray-300"
                      } cursor-pointer`}
                      onClick={() => setCurrentIndex(i)}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
            {/* Mobile Slider (single section) */}
            <div className="block md:hidden">
              <div
                className="flex overflow-hidden w-full h-80"
                ref={mobileScrollRef}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {hostel.images && hostel.images.length > 0 ? (
                  hostel.images.map((img, i) => (
                    <div key={i} className="flex-shrink-0 w-full h-80">
                      <img
                        src={img}
                        alt={`Hostel ${i + 1}`}
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
                {hostel.images.map((_, i) => (
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
            </div>

          {/* Details Section */}
          <div className="p-6 md:p-10">
            <h1 className="text-2xl font-bold text-[rgb(77,95,171)] mb-4">
              Hostel Details
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem icon={<DollarSign />} label="Rent" value={`₹${hostel.rent}`} />
              <DetailItem icon={<MapPin />} label="Address" value={hostel.address} />
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                <div className="text-[rgb(77,95,171)]"><Phone /></div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="text-gray-800 font-semibold">{hostel.contact}</p>
                </div>
                <a
                  href={`tel:${hostel.contact}`}
                  className="ml-auto sm:hidden bg-[rgb(77,95,171)] text-white px-4 py-2 rounded-lg text-sm font-medium shadow transform active:scale-95 transition duration-200 hover:opacity-90"
                >
                  Call
                </a>
              </div>
              <DetailItem icon={<Users />} label="Seater" value={hostel.seater} />
              <DetailItem icon={<Users />} label="For Whom" value={hostel.forWhom} />
              {/* Timing Section */}
              {hostel.hostelTiming && (
                <DetailItem 
                  icon={<Clock />} 
                  label="Hostel Timing" 
                  value={hostel.hostelTiming} 
                />
              )}

              {/* Meal Timings */}
              {hostel.breakfastTiming && (
                <DetailItem icon={<Utensils />} label="Breakfast Timing" value={hostel.breakfastTiming} />
              )}
              {hostel.lunchTiming && (
                <DetailItem icon={<Utensils />} label="Lunch Timing" value={hostel.lunchTiming} />
              )}
              {hostel.dinnerTiming && (
                <DetailItem icon={<Utensils />} label="Dinner Timing" value={hostel.dinnerTiming} />
              )}
            </div>

            {/* Amenities */}
            {hostel.amenities?.length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-[rgb(77,95,171)] mb-2">Amenities</h2>
                <div className="flex flex-wrap gap-3">
                  {hostel.amenities.map((amenity, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg shadow-sm text-sm font-medium"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {hostel.description && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-[rgb(77,95,171)] mb-2">Description</h2>
                <p className="text-gray-700">{hostel.description}</p>
              </div>
            )}

            {/* Map */}
            {hostel.mapLink && (
              <div className="mt-6">
                <a
                  href={hostel.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-[rgb(77,95,171)] text-white font-medium rounded-xl inline-block hover:opacity-90 transition"
                >
                  View on Google Maps
                </a>
              </div>
            )}

            {/* Posted Info */}
            {hostel.user || hostel.createdAt ? (
              <div className="mt-6 text-sm text-gray-600">
                {hostel.user && (
                  <div>
                    Posted by:{" "}
                    <span className="font-semibold text-gray-800">
                      {hostel.user.name || hostel.user.email}
                    </span>
                  </div>
                )}
                {hostel.createdAt && (
                  <div className="mt-1">
                    Posted on:{" "}
                    <span className="text-gray-500">
                      {new Date(hostel.createdAt).toLocaleDateString()}
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

const HostelDetailWithFooter = () => (
  <>
    <HostelDetail />
    <Footer />
  </>
);

export default HostelDetailWithFooter;
