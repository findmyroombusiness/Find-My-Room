
import Footer from "../components/Footer";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import DetailItem from "../components/DetailItem";
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
  Clock,
} from "lucide-react";
import { apiFetch } from "../utils/apiFetch";

const PgDetail = () => {
  const { id } = useParams();
  const [pg, setPg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  useEffect(() => {
    const fetchPg = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/pgs/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch PG details");
        setPg(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPg();
  }, [id]);

  const handleNext = () => {
    if (pg && Array.isArray(pg.images) && pg.images.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % pg.images.length);
    }
  };

  const handlePrev = () => {
    if (pg && Array.isArray(pg.images) && pg.images.length > 0) {
      setCurrentIndex((prev) => (prev === 0 ? pg.images.length - 1 : prev - 1));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-gray-500 text-xl">Loading PG details...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
                <DetailItem icon={<DollarSign />} label="Rent" value={`₹${pg.rent}`} />
                <DetailItem icon={<MapPin />} label="Address" value={pg.address} />
                {/* Contact + Call Button (only phone screens) */}
                <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                  <div className="text-[rgb(77,95,171)]">
                    <Phone />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="text-gray-800 font-semibold">{pg.contact}</p>
                  </div>
                  <a
                    href={`tel:${pg.contact}`}
                    className="ml-auto block bg-[rgb(77,95,171)] text-white px-4 py-2 rounded-lg text-sm font-medium shadow transform active:scale-95 transition duration-200 hover:opacity-90"
                    style={{ maxWidth: 100, textAlign: 'center' }}
                  >
                    Call
                  </a>
                </div>
                <DetailItem icon={<Users />} label="Seater" value={pg.seater} />
                <DetailItem icon={<Bed />} label="Rooms" value={pg.rooms} />
                <DetailItem icon={<Home />} label="Furnishing" value={pg.furnishing} />
                <DetailItem icon={<Users />} label="For Whom" value={pg.forWhom} />
                <DetailItem icon={<Utensils />} label="Cooking" value={pg.cooking} />
                <DetailItem icon={<Zap />} label="Electricity Bill" value={pg.electricitybill} />
                <DetailItem icon={<Droplet />} label="Water Bill" value={pg.waterbill} />
                <DetailItem icon={<Beef />} label="Food" value={pg.food} />
                <DetailItem icon={<Bath />} label="Washroom" value={pg.washroom} />
                <DetailItem icon={<ChefHat />} label="Kitchen" value={pg.kitchen} />
                <DetailItem icon={<Clock />} label="Timing" value={pg.timing} />
                {/* Add all fields from Pg.jsx form */}
                {pg.hasOwnProperty('description') && (
                  <DetailItem icon={<Clock />} label="Description" value={pg.description} />
                )}
                {pg.hasOwnProperty('mapLink') && (
                  <DetailItem icon={<MapPin />} label="Google Map Link" value={pg.mapLink} />
                )}
              </div>
      </div>
    );
  }
  if (!pg) return null;

  return (
    <div className="min-h-[81vh] bg-white">
      <Navbar />
      <div className="bg-gray-100 md:py-7 px-4 pb-4 pt-20 md:pt-10">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Desktop/Tablet: Show single image with arrows */}
          <div className="relative overflow-hidden hidden md:block">
            {pg && Array.isArray(pg.images) && pg.images.length > 0 ? (
              <img
                src={pg.images[currentIndex]}
                alt={`PG ${currentIndex + 1}`}
                className="w-full h-80 md:h-[500px] object-cover transition-all duration-700"
              />
            ) : (
              <div className="w-full h-80 md:h-[500px] flex items-center justify-center bg-gray-200 text-gray-500 text-lg">
                No image provided
              </div>
            )}
            {/* Left Button (desktop only) */}
            {pg && Array.isArray(pg.images) && pg.images.length > 1 && (
              <button
                onClick={handlePrev}
                className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-[rgb(77,95,171)] text-white p-2 rounded-full shadow hover:opacity-90 transition"
              >
                <ChevronLeft />
              </button>
            )}
            {/* Right Button (desktop only) */}
            {pg && Array.isArray(pg.images) && pg.images.length > 1 && (
              <button
                onClick={handleNext}
                className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-[rgb(77,95,171)] text-white p-2 rounded-full shadow hover:opacity-90 transition"
              >
                <ChevronRight />
              </button>
            )}
            {/* Dots */}
            {pg && Array.isArray(pg.images) && pg.images.length > 1 && (
              <div className="absolute bottom-3 w-full flex justify-center space-x-2">
                {pg.images.map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-full ${
                      i === currentIndex
                        ? "bg-[rgb(77,95,171)]"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          {/* Mobile: Show swipeable image slider */}
          <div
            className="block md:hidden"
            onTouchStart={e => setTouchStartX(e.touches[0].clientX)}
            onTouchMove={e => setTouchEndX(e.touches[0].clientX)}
            onTouchEnd={() => {
              if (touchStartX !== null && touchEndX !== null) {
                const diff = touchStartX - touchEndX;
                if (diff > 40) handleNext();
                else if (diff < -40) handlePrev();
              }
              setTouchStartX(null);
              setTouchEndX(null);
            }}
          >
            <div className="flex overflow-x-auto no-scrollbar snap-x snap-mandatory w-full h-80 gap-2">
              {pg && Array.isArray(pg.images) && pg.images.length > 0 ? (
                <img
                  src={pg.images[currentIndex]}
                  alt={`PG ${currentIndex + 1}`}
                  className="h-80 w-full object-cover rounded-lg snap-center flex-shrink-0"
                  style={{ minWidth: '100%' }}
                />
              ) : (
                <div className="h-80 w-full flex items-center justify-center bg-gray-200 text-gray-500 text-lg rounded-lg">
                  No image provided
                </div>
              )}
            </div>
            {/* Dots for mobile */}
            {pg && Array.isArray(pg.images) && pg.images.length > 1 && (
              <div className="w-full flex justify-center space-x-2 mt-2">
                {pg.images.map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-full ${
                      i === currentIndex
                        ? "bg-[rgb(77,95,171)]"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          {/* Details Section */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem icon={<DollarSign />} label="Rent" value={`₹${pg.rent}`} />
              <DetailItem icon={<MapPin />} label="Address" value={pg.address} />
              {/* Contact + Call Button (only phone screens) */}
              <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl shadow-sm">
                <div className="text-[rgb(77,95,171)]">
                  <Phone />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="text-gray-800 font-semibold">{pg.contact}</p>
                </div>
                <a
                  href={`tel:${pg.contact}`}
                  className="ml-auto block bg-[rgb(77,95,171)] text-white px-4 py-2 rounded-lg text-sm font-medium shadow transform active:scale-95 transition duration-200 hover:opacity-90"
                  style={{ maxWidth: 100, textAlign: 'center' }}
                >
                  Call
                </a>
              </div>
              <DetailItem icon={<Users />} label="Seater" value={pg.seater} />
              <DetailItem icon={<Bed />} label="Rooms" value={pg.rooms} />
              <DetailItem icon={<Home />} label="Furnishing" value={pg.furnishing} />
              <DetailItem icon={<Users />} label="For Whom" value={pg.forWhom} />
              <DetailItem icon={<Utensils />} label="Cooking" value={pg.cooking} />
              <DetailItem icon={<Zap />} label="Electricity Bill" value={pg.electricitybill} />
              <DetailItem icon={<Droplet />} label="Water Bill" value={pg.waterbill} />
              <DetailItem icon={<Beef />} label="Food" value={pg.food} />
              <DetailItem icon={<Bath />} label="Washroom" value={pg.washroom} />
              <DetailItem icon={<ChefHat />} label="Kitchen" value={pg.kitchen} />
              <DetailItem icon={<Clock />} label="Timing" value={pg.timing} />
            </div>
            {/* Description Section */}
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-[rgb(77,95,171)] mb-2">Description</h2>
              <p className="text-gray-700">{pg.description}</p>
            </div>
            {/* Map Link Section */}
            {pg.mapLink && (
              <div className="mt-6">
                <a
                  href={pg.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3 bg-[rgb(77,95,171)] text-white font-medium rounded-xl inline-block hover:opacity-90 transition"
                >
                  View on Google Maps
                </a>
              </div>
            )}
            {/* Posted info */}
            {(pg.user || pg.createdAt) && (
              <div className="mt-6 text-sm text-gray-600">
                {pg.user && (
                  <div>Posted by: <span className="font-semibold text-gray-800">{pg.user.name || pg.user.email}</span></div>
                )}
                {pg.createdAt && (
                  <div className="mt-1">Posted on: <span className="text-gray-500">{new Date(pg.createdAt).toLocaleDateString()}</span></div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const PgDetailWithFooter = () => (
  <>
    <PgDetail />
    <Footer />
  </>
);
export default PgDetailWithFooter;
