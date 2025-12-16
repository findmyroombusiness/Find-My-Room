import Footer from "../components/Footer";
import React, { useState } from "react";
import { apiFetch } from "../utils/apiFetch";

// Custom style to force only the dropdown list background white, not the select itself
const selectDropdownWhite = `
  select option { background: white !important; color: #222 !important; }
`;
import {
  Upload,
  DollarSign,
  MapPin,
  Users,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

// Cloudinary upload helper
async function uploadToCloudinary(file) {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "ml_default"); // your unsigned preset
  const res = await fetch("https://api.cloudinary.com/v1_1/dlr7ht0vz/image/upload", {
    method: "POST",
    body: data,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "Cloudinary upload failed");
    throw new Error(text || `Cloudinary upload failed with status ${res.status}`);
  }
  const json = await res.json();
  if (!json || !json.secure_url) throw new Error("Cloudinary did not return secure_url");
  return json.secure_url;
}

// Common button component
const SelectButton = ({ label, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 rounded-lg border transition-colors ${
      selected
        ? "bg-[rgb(77,95,171)] text-white"
        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }`}
  >
    {label}
  </button>
);

// Image Upload component
const ImageUpload = ({ images, setImages }) => {
  const fileInputRef = React.useRef();
  const handleFiles = (files) => {
    const newImages = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages]);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };
  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-[rgb(77,95,171)] rounded-xl p-6 flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-gray-50 w-full"
      style={{ maxWidth: '100%' }}
    >
      <Upload className="w-10 h-10 text-[rgb(77,95,171)] mb-2" />
      <p className="text-gray-600 mb-2">Drag & Drop or Tap to Upload</p>
      <input
        type="file"
        multiple
        className="hidden"
        ref={fileInputRef}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        className="px-4 py-2 bg-[rgb(77,95,171)] text-white rounded-lg cursor-pointer hover:opacity-90"
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
      >
        Select Images
      </button>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 w-full">
        {images.map((img, i) => {
          const src = img.preview && (/^(https?:|blob:|\/)/.test(img.preview)) ? img.preview : "/vite.svg";
          return (
            <div key={i} className="relative group">
              <img
                src={src}
                alt="preview"
                className="w-full h-24 object-cover rounded-lg"
                style={{ maxWidth: '100%' }}
                onError={(e) => { e.target.onerror = null; e.target.src = "/vite.svg"; }}
              />
              <button
                type="button"
                aria-label="Remove image"
                className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-[rgb(77,95,171)] z-10"
                style={{lineHeight: 1}}
                onClick={() => {
                  setImages(prev => prev.filter((_, idx) => idx !== i));
                }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helpers for meal timing UI (shared between PC and Mobile forms)
const parseMealTiming = (timingStr) => {
  // returns { startHour, startMinute, startMeridian, endHour, endMinute, endMeridian }
  
  if (!timingStr)
    return {
      startHour: "00",
      startMinute: "00",
      startMeridian: "AM",
      endHour: "00",
      endMinute: "00",
      endMeridian: "AM",
    };
  try {
    const parts = timingStr.split(" to ");
    if (parts.length !== 2) {
      return {
        startHour: "00",
        startMinute: "00",
        startMeridian: "AM",
        endHour: "00",
        endMinute: "00",
        endMeridian: "AM",
      };
    }
    const [sHourMin, sMer] = parts[0].split(" ");
    const [eHourMin, eMer] = parts[1].split(" ");
    const [sHourRaw, sMinRaw] = sHourMin.split(":");
    const [eHourRaw, eMinRaw] = eHourMin.split(":");
    const sHour = String(parseInt(sHourRaw, 10)).padStart(2, "0");
    const eHour = String(parseInt(eHourRaw, 10)).padStart(2, "0");
    const sMin = String(parseInt(sMinRaw || "0", 10)).padStart(2, "0");
    const eMin = String(parseInt(eMinRaw || "0", 10)).padStart(2, "0");
    
    return {
      startHour: sHour,
      startMinute: sMin,
      startMeridian: sMer,
      endHour: eHour,
      endMinute: eMin,
      endMeridian: eMer,
    };
  } catch (err) {
    return {
      startHour: "00",
      startMinute: "00",
      startMeridian: "AM",
      endHour: "00",
      endMinute: "00",
      endMeridian: "AM",
    };
  }
};

const buildMealTiming = ({ startHour, startMinute, startMeridian, endHour, endMinute, endMeridian }) => {
  
  const sH = String(parseInt(startHour || "0", 10)).padStart(2, "0");
  const eH = String(parseInt(endHour || "0", 10)).padStart(2, "0");
  const sM = String(parseInt(startMinute || "0", 10)).padStart(2, "0");
  const eM = String(parseInt(endMinute || "0", 10)).padStart(2, "0");
  
  return `${sH}:${sM} ${startMeridian} to ${eH}:${eM} ${endMeridian}`;
};

// Utility function to get the current timing value, preferring hostelTiming over timing
const getCurrentTiming = (form, defaultValue = "12:00 AM to 12:00 AM") => {
  return form.hostelTiming || defaultValue;
};

// ----------- PC FORM -------------
const HostelFormPC = () => {
  const DEFAULT_TIMING = "12:00 AM to 12:00 AM";
  
  // Refs for AM/PM buttons in all timing sections
  // Removed timing refs
  const breakfastStartMeridianRef = React.useRef();
  const breakfastEndMeridianRef = React.useRef();
  const lunchStartMeridianRef = React.useRef();
  const lunchEndMeridianRef = React.useRef();
  const dinnerStartMeridianRef = React.useRef();
  const dinnerEndMeridianRef = React.useRef();
  const navigate = useNavigate();
  const location = window.location && window.location.state ? window.location : {};
  let routerState = {};
  try {
    routerState = (typeof useNavigate === 'function' && typeof window !== 'undefined' && window.history && window.history.state && window.history.state.usr) ? window.history.state.usr : {};
  } catch {}
  const state = (location && location.state) || routerState || {};
  const editMode = state.editMode || false;
  const listing = state.listing || null;

  const amenitiesList = [
    "Lift",
    "Water Cooler",
    "Water Heater",
    "Fridge",
    "AC",
    "Cupboard",
    "Washing Machine",
    "Mattress",
    "Pillow",
    "WiFi",
    "CCTV",
    "Security Guard",
  ];

  const [form, setForm] = useState(() => {
    if (editMode && listing) {
      return {
        rent: listing.rent || "",
        address: listing.address || "",
        contact: listing.contact || "",
        seater: listing.seater !== undefined && listing.seater !== null ? String(listing.seater) : "",
        forWhom: listing.forWhom || "",
        hostelTiming: listing.hostelTiming || "12:00 AM to 12:00 AM",
        description: listing.description || "",
        mapLink: listing.mapLink || "",
        amenities: Array.isArray(listing.amenities) ? listing.amenities : (listing.amenities ? [listing.amenities] : []),
        breakfastTiming: listing.breakfastTiming || "12:00 AM to 12:00 AM",
        lunchTiming: listing.lunchTiming || "12:00 AM to 12:00 AM",
        dinnerTiming: listing.dinnerTiming || "12:00 AM to 12:00 AM",
      };
    } else {
      return {
        rent: "",
        address: "",
        contact: "",
        seater: "",
        forWhom: "",
        hostelTiming: "12:00 AM to 12:00 AM",
        description: "",
        mapLink: "",
        amenities: [],
        breakfastTiming: "12:00 AM to 12:00 AM",
        lunchTiming: "12:00 AM to 12:00 AM",
        dinnerTiming: "12:00 AM to 12:00 AM",
      };
    }
  });
  const [images, setImages] = useState(() => (
    editMode && listing && Array.isArray(listing.images)
      ? listing.images.map((url) => ({ file: null, preview: url }))
      : []
  ));
  // When editing, update form/images state if listing changes (after PUT)
  React.useEffect(() => {
    if (editMode && listing) {
      setForm({
        rent: listing.rent || "",
        address: listing.address || "",
        contact: listing.contact || "",
        seater: listing.seater !== undefined && listing.seater !== null ? String(listing.seater) : "",
        forWhom: listing.forWhom || "",
        hostelTiming: listing.hostelTiming || "12:00 AM to 12:00 AM",
        description: listing.description || "",
        mapLink: listing.mapLink || "",
        amenities: Array.isArray(listing.amenities) ? listing.amenities : (listing.amenities ? [listing.amenities] : []),
        breakfastTiming: listing.breakfastTiming || "12:00 AM to 12:00 AM",
        lunchTiming: listing.lunchTiming || "12:00 AM to 12:00 AM",
        dinnerTiming: listing.dinnerTiming || "12:00 AM to 12:00 AM",
      });
      setImages(Array.isArray(listing.images) ? listing.images.map((url) => ({ file: null, preview: url })) : []);
    }
  }, [editMode, listing]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const isContactValid = /^[0-9]{10}$/.test(form.contact);
  const isRentValid = /^[1-9][0-9]*$/.test(form.rent);
  const isFormValid =
    isRentValid &&
    form.address &&
    isContactValid &&
    form.seater &&
    form.forWhom &&
    form.hostelTiming &&
    form.breakfastTiming &&
    form.lunchTiming &&
    form.dinnerTiming &&
    form.mapLink;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token is missing. Please log in again.");
      }
      const imageUrls = [];
      for (const img of images) {
        if (img.file) {
          const url = await uploadToCloudinary(img.file);
          imageUrls.push(url);
        } else if (img.preview) {
          imageUrls.push(img.preview);
        }
      }
      setImages(imageUrls.map((url) => ({ file: null, preview: url })));
      let res, data;
      const defaultTiming = "12:00 AM to 12:00 AM";
      const payload = {
        rent: form.rent,
        address: form.address,
        contact: form.contact,
        seater: form.seater,
        forWhom: form.forWhom,
        hostelTiming: form.hostelTiming || defaultTiming,
        breakfastTiming: form.breakfastTiming || defaultTiming,
        lunchTiming: form.lunchTiming || defaultTiming,
        dinnerTiming: form.dinnerTiming || defaultTiming,
        amenities: form.amenities,
        description: form.description,
        mapLink: form.mapLink,
        images: imageUrls,
      };
      const hostelId = editMode && listing && listing._id ? listing._id : null;
      if (editMode) {
        if (!hostelId) {
          setError("Missing Hostel ID. Cannot update.");
          alert("Missing Hostel ID. Cannot update.");
          setLoading(false);
          return;
        }
        const putUrl = `${import.meta.env.VITE_API_BASE_URL}/api/hostels/${hostelId}`;
        res = await apiFetch(putUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        const postUrl = `${import.meta.env.VITE_API_BASE_URL}/api/hostels`;
        res = await apiFetch(postUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }
      try {
        data = await res.json();
      } catch (parseErr) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed with status ${res.status}`);
      }
      if (!res.ok) {
        if (res.status === 404) {
          setError("Hostel not found or deleted.");
          alert("Hostel not found or deleted.");
        } else {
          setError(data.message || "Failed to publish");
        }
        setLoading(false);
        return;
      }
      setSuccess(editMode ? "Listing updated!" : "Listing published!");
      // If editing, update local listing state with backend response so form is always in sync (like Flat)
      if (editMode && data && typeof data === 'object') {
        // Update form and images with latest data
        setForm({
          rent: data.rent || "",
          address: data.address || "",
          contact: data.contact || "",
          seater: data.seater !== undefined && data.seater !== null ? String(data.seater) : "",
          forWhom: data.forWhom || "",
          hostelTiming: data.hostelTiming || "12:00 AM to 12:00 AM",
          description: data.description || "",
          mapLink: data.mapLink || "",
          amenities: Array.isArray(data.amenities) ? data.amenities : (data.amenities ? [data.amenities] : []),
          breakfastTiming: data.breakfastTiming || "12:00 AM to 12:00 AM",
          lunchTiming: data.lunchTiming || "12:00 AM to 12:00 AM",
          dinnerTiming: data.dinnerTiming || "12:00 AM to 12:00 AM",
        });
        setImages(Array.isArray(data.images) ? data.images.map((url) => ({ file: null, preview: url })) : []);
      }
      const refresh = Date.now();
      setTimeout(() => navigate(`/MyListing?type=hostel&refresh=${refresh}`), 1200);
    } catch (err) {
      setError(err.message);
      if (err.message && err.message.includes("404")) {
        alert("Hostel not found or deleted.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
  {/* Custom style for select dropdowns to force only dropdown list white */}
  <style>{selectDropdownWhite}</style>
      <Navbar />
      <div className="min-h-screen bg-gray-100 flex justify-center items-center p-8">
        <form className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-5xl" onSubmit={handleSubmit}>
          <h1 className="text-2xl font-bold mb-6 text-center text-[rgb(77,95,171)]">
            List Your Hostel
          </h1>
          <ImageUpload images={images} setImages={setImages} />

          <div className="grid grid-cols-2 gap-6 mt-6">
            {/* Rent */}
            <div>
              <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
                <DollarSign className="w-5 h-5 text-[rgb(77,95,171)]" /> Rent
              </label>
              <input
                type="text"
                value={form.rent}
                onChange={(e) => handleChange("rent", e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="Enter rent amount"
                className={`w-full border rounded-lg p-2 ${form.rent && !isRentValid ? 'border-red-500' : ''}`}
              />
              {form.rent && !isRentValid && (
                <p className="text-red-500 text-xs mt-1">Rent must be a positive number.</p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
                <MapPin className="w-5 h-5 text-[rgb(77,95,171)]" /> Address
              </label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                placeholder="Enter address"
                className="w-full border rounded-lg p-2"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
                <Users className="w-5 h-5 text-[rgb(77,95,171)]" /> Contact Number
              </label>
              <input
                type="tel"
                value={form.contact}
                onChange={(e) => handleChange("contact", e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="Enter 10-digit contact number"
                maxLength={10}
                className={`w-full border rounded-lg p-2 ${form.contact && !isContactValid ? 'border-red-500' : ''}`}
              />
              {form.contact && !isContactValid && (
                <p className="text-red-500 text-xs mt-1">Contact must be exactly 10 digits.</p>
              )}
            </div>

            {/* Map Link */}
            <div className="col-span-2">
              <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
                <MapPin className="w-5 h-5 text-[rgb(77,95,171)]" /> Google Map Link
              </label>
              <input
                type="text"
                value={form.mapLink}
                onChange={(e) => handleChange("mapLink", e.target.value)}
                placeholder="Paste Google Map link here"
                className="w-full border rounded-lg p-2"
              />
            </div>

            {/* Seater */}
            <div>
              <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
                <Users className="w-5 h-5 text-[rgb(77,95,171)]" /> Seater
              </label>
              <div className="flex gap-2">
                {["1", "2", "3", "4", "5"].map((num) => (
                  <SelectButton
                    key={num}
                    label={num}
                    selected={form.seater === num}
                    onClick={() => handleChange("seater", num)}
                  />
                ))}
              </div>
            </div>

            {/* For Whom */}
            <div>
              <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
                <Users className="w-5 h-5 text-[rgb(77,95,171)]" /> For Whom
              </label>
              <div className="flex gap-2">
                {["Boys", "Girls"].map((opt) => (
                  <SelectButton
                    key={opt}
                    label={opt}
                    selected={form.forWhom === opt}
                    onClick={() => handleChange("forWhom", opt)}
                  />
                ))}
              </div>
            </div>

            {/* Hostel Timing (main) */}
            <div>
              <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
                <Clock className="w-5 h-5 text-[rgb(77,95,171)]" /> Hostel Timing
              </label>
              {/* Custom start/end time inputs with minutes and AM/PM */}
              {(() => {
                const parsed = parseMealTiming(form.hostelTiming);
                const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
                const minuteOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
                const selectClass =
                  "px-4 py-2 rounded-lg border transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200 focus:bg-[rgb(77,95,171)] focus:text-white focus:border-[rgb(77,95,171)] focus:ring-2 focus:ring-[rgb(77,95,171)] outline-none font-medium";
                const meridianClass =
                  "px-4 py-2 rounded-lg border transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200 focus:bg-[rgb(77,95,171)] focus:text-white focus:border-[rgb(77,95,171)] focus:ring-2 focus:ring-[rgb(77,95,171)] outline-none font-medium";
                // Blur AM/PM after 1s (refs moved out of render)
                const startMeridianRef = React.useRef();
                const endMeridianRef = React.useRef();
                return (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <select
                        value={parsed.startHour}
                        onChange={e => {
                          const next = { ...parsed, startHour: e.target.value };
                          handleChange("hostelTiming", buildMealTiming(next));
                        }}
                        className={selectClass}
                      >
                        {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <span className="text-gray-700">:</span>
                      <select
                        value={parsed.startMinute}
                        onChange={e => {
                          const next = { ...parsed, startMinute: e.target.value };
                          handleChange("hostelTiming", buildMealTiming(next));
                        }}
                        className={selectClass}
                      >
                        {minuteOptions.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <button
                        type="button"
                        ref={startMeridianRef}
                        onClick={() => {
                          const next = { ...parsed, startMeridian: parsed.startMeridian === "AM" ? "PM" : "AM" };
                          handleChange("hostelTiming", buildMealTiming(next));
                          setTimeout(() => {
                            if (startMeridianRef.current) startMeridianRef.current.blur();
                          }, 1000);
                        }}
                        className={meridianClass}
                      >
                        {parsed.startMeridian}
                      </button>
                    </div>
                    <div className="text-gray-500">to</div>
                    <div className="flex items-center gap-2">
                      <select
                        value={parsed.endHour}
                        onChange={e => {
                          const next = { ...parsed, endHour: e.target.value };
                          handleChange("hostelTiming", buildMealTiming(next));
                        }}
                        className={selectClass}
                      >
                        {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <span className="text-gray-700">:</span>
                      <select
                        value={parsed.endMinute}
                        onChange={e => {
                          const next = { ...parsed, endMinute: e.target.value };
                          handleChange("hostelTiming", buildMealTiming(next));
                        }}
                        className={selectClass}
                      >
                        {minuteOptions.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <button
                        type="button"
                        ref={endMeridianRef}
                        onClick={() => {
                          const next = { ...parsed, endMeridian: parsed.endMeridian === "AM" ? "PM" : "AM" };
                          handleChange("hostelTiming", buildMealTiming(next));
                          setTimeout(() => {
                            if (endMeridianRef.current) endMeridianRef.current.blur();
                          }, 1000);
                        }}
                        className={meridianClass}
                      >
                        {parsed.endMeridian}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Amenities */}
            <div className="col-span-2 mt-4">
              <label className="font-medium text-gray-700 mb-2 block">Amenities</label>
              <div className="grid grid-cols-3 gap-2">
                {amenitiesList.map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.amenities.includes(amenity)}
                      onChange={() => handleAmenityToggle(amenity)}
                      className="w-4 h-4 accent-[rgb(77,95,171)]"
                    />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>

            {/* Food Sections */}
            {['Breakfast', 'Lunch', 'Dinner'].map((meal, idx) => {
              const key = meal.toLowerCase();
              const parsed = parseMealTiming(form[key + 'Timing']);
              const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
              const minuteOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
              const selectClass =
                "px-4 py-2 rounded-lg border transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200 focus:bg-[rgb(77,95,171)] focus:text-white focus:border-[rgb(77,95,171)] focus:ring-2 focus:ring-[rgb(77,95,171)] outline-none font-medium";
              const meridianClass =
                "px-4 py-2 rounded-lg border transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200 focus:bg-[rgb(77,95,171)] focus:text-white focus:border-[rgb(77,95,171)] focus:ring-2 focus:ring-[rgb(77,95,171)] outline-none font-medium";
              // Pick refs for each meal
              const startRef = idx === 0 ? breakfastStartMeridianRef : idx === 1 ? lunchStartMeridianRef : dinnerStartMeridianRef;
              const endRef = idx === 0 ? breakfastEndMeridianRef : idx === 1 ? lunchEndMeridianRef : dinnerEndMeridianRef;
              return (
                <div className="col-span-2" key={meal}>
                  <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
                    {meal} Timing
                  </label>
                  <div className="flex items-center gap-3">
                    {/* Start */}
                    <div className="flex items-center gap-2">
                      <select
                        value={parsed.startHour}
                        onChange={e => {
                          const next = { ...parsed, startHour: e.target.value };
                          handleChange(key + 'Timing', buildMealTiming(next));
                        }}
                        className={selectClass}
                      >
                        {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <span className="text-gray-700">:</span>
                      <select
                        value={parsed.startMinute}
                        onChange={e => {
                          const next = { ...parsed, startMinute: e.target.value };
                          handleChange(key + 'Timing', buildMealTiming(next));
                        }}
                        className={selectClass}
                      >
                        {minuteOptions.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <button
                        type="button"
                        ref={startRef}
                        onClick={() => {
                          const next = { ...parsed, startMeridian: parsed.startMeridian === 'AM' ? 'PM' : 'AM' };
                          handleChange(key + 'Timing', buildMealTiming(next));
                          setTimeout(() => {
                            if (startRef.current) startRef.current.blur();
                          }, 1000);
                        }}
                        className={meridianClass}
                      >
                        {parsed.startMeridian}
                      </button>
                    </div>
                    <div className="text-gray-500">to</div>
                    {/* End */}
                    <div className="flex items-center gap-2">
                      <select
                        value={parsed.endHour}
                        onChange={e => {
                          const next = { ...parsed, endHour: e.target.value };
                          handleChange(key + 'Timing', buildMealTiming(next));
                        }}
                        className={selectClass}
                      >
                        {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
                      </select>
                      <span className="text-gray-700">:</span>
                      <select
                        value={parsed.endMinute}
                        onChange={e => {
                          const next = { ...parsed, endMinute: e.target.value };
                          handleChange(key + 'Timing', buildMealTiming(next));
                        }}
                        className={selectClass}
                      >
                        {minuteOptions.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <button
                        type="button"
                        ref={endRef}
                        onClick={() => {
                          const next = { ...parsed, endMeridian: parsed.endMeridian === 'AM' ? 'PM' : 'AM' };
                          handleChange(key + 'Timing', buildMealTiming(next));
                          setTimeout(() => {
                            if (endRef.current) endRef.current.blur();
                          }, 1000);
                        }}
                        className={meridianClass}
                      >
                        {parsed.endMeridian}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="font-medium text-gray-700 mb-2 block">
              Description (Optional)
            </label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Write something about your hostel..."
              className="w-full border rounded-lg p-3"
            />
          </div>

          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
          {success && <p className="text-green-600 text-center mt-4">{success}</p>}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`mt-6 w-full py-3 rounded-xl text-white font-bold ${
              isFormValid && !loading
                ? "bg-[rgb(77,95,171)] hover:opacity-90"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Publishing..." : "Publish"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ----------- MOBILE FORM -------------
const HostelFormMobile = () => {
  // Refs for AM/PM buttons in all timing sections (mobile)
  const breakfastStartMeridianRef = React.useRef();
  const breakfastEndMeridianRef = React.useRef();
  const lunchStartMeridianRef = React.useRef();
  const lunchEndMeridianRef = React.useRef();
  const dinnerStartMeridianRef = React.useRef();
  const dinnerEndMeridianRef = React.useRef();
  const navigate = useNavigate();
  const location = typeof window !== 'undefined' && window.location && window.location.state ? window.location : {};
  let routerState = {};
  try { routerState = (typeof window !== 'undefined' && window.history && window.history.state && window.history.state.usr) ? window.history.state.usr : {}; } catch (e) {}
  const state = (location && location.state) || routerState || {};
  const editMode = state.editMode || false;
  const listing = state.listing || null;

  const [images, setImages] = useState(() => (
    editMode && listing && Array.isArray(listing.images)
      ? listing.images.map((url) => ({ file: null, preview: url }))
      : []
  ));
  const [form, setForm] = useState(() => {
    if (editMode && listing) {
      return {
        rent: listing.rent || "",
        address: listing.address || "",
        contact: listing.contact || "",
        seater: listing.seater || "",
        forWhom: listing.forWhom || "",
        hostelTiming: listing.hostelTiming || "12:00 AM to 12:00 AM",
        description: listing.description || "",
        mapLink: listing.mapLink || "",
        amenities: Array.isArray(listing.amenities) ? listing.amenities : (listing.amenities ? [listing.amenities] : []),
        breakfastTiming: listing.breakfastTiming || "12:00 AM to 12:00 AM",
        lunchTiming: listing.lunchTiming || "12:00 AM to 12:00 AM",
        dinnerTiming: listing.dinnerTiming || "12:00 AM to 12:00 AM",
      };
    } else {
      return {
        rent: "",
        address: "",
        contact: "",
        seater: "",
        forWhom: "",
        hostelTiming: "12:00 AM to 12:00 AM",
        description: "",
        mapLink: "",
        amenities: [],
        breakfastTiming: "12:00 AM to 12:00 AM",
        lunchTiming: "12:00 AM to 12:00 AM",
        dinnerTiming: "12:00 AM to 12:00 AM",
      };
    }
  });

  const amenitiesList = [
    "Lift",
    "Water Cooler",
    "Water Heater",
    "Fridge",
    "AC",
    "Cupboard",
    "Washing Machine",
    "Mattress",
    "Pillow",
    "WiFi",
    "CCTV",
    "Security Guard",
  ];

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAmenityToggle = (amenity) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const isContactValid = /^[0-9]{10}$/.test(form.contact);
  const isRentValid = /^[1-9][0-9]*$/.test(form.rent);
  const isFormValid =
    isRentValid &&
    form.address &&
    isContactValid &&
    form.seater &&
    form.forWhom &&
    form.hostelTiming &&
    form.breakfastTiming &&
    form.lunchTiming &&
    form.dinnerTiming &&
    form.mapLink;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Upload only new images to Cloudinary, keep existing URLs
      const imageUrls = [];
      for (const img of images) {
        if (img.file) {
          const url = await uploadToCloudinary(img.file);
          imageUrls.push(url);
        } else if (img.preview) {
          imageUrls.push(img.preview);
        }
      }
      setImages(imageUrls.map((url) => ({ file: null, preview: url })));

      const token = localStorage.getItem("token");
      const defaultTiming = "12:00 AM to 12:00 AM";
      const payload = {
        rent: form.rent,
        address: form.address,
        contact: form.contact,
        seater: form.seater,
        forWhom: form.forWhom,
        hostelTiming: form.hostelTiming || defaultTiming,
        breakfastTiming: form.breakfastTiming || defaultTiming,
        lunchTiming: form.lunchTiming || defaultTiming,
        dinnerTiming: form.dinnerTiming || defaultTiming,
        amenities: form.amenities,
        description: form.description,
        mapLink: form.mapLink,
        images: imageUrls
      };
      let res, data;
      if (editMode && listing && listing._id) {
        res = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/hostels/${listing._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/hostels`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }
      try {
        data = await res.json();
      } catch (parseErr) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed with status ${res.status}`);
      }
      if (!res.ok) throw new Error(data.message || (editMode ? "Failed to update" : "Failed to publish"));
      setSuccess(editMode ? "Listing updated!" : "Listing published!");
      const refresh2 = Date.now();
      setTimeout(() => navigate(`/MyListing?type=hostel&refresh=${refresh2}`), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[81vh] mt-20 bg-gray-100 p-4 md:hidden" style={{ overflowX: 'hidden' }}>
      <Navbar />
      <form className="bg-white p-6 rounded-2xl shadow-lg" onSubmit={handleSubmit}>
        <h1 className="text-xl font-bold mb-6 text-center text-[rgb(77,95,171)]">
          List Your Hostel
        </h1>
        <ImageUpload images={images} setImages={setImages} />
        <div className="mt-6">
          {/* Rent */}
          <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
            <DollarSign className="w-5 h-5 text-[rgb(77,95,171)]" /> Rent
          </label>
          <input
            type="text"
            value={form.rent}
            onChange={(e) => handleChange("rent", e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="Enter rent amount"
            className={`w-full border rounded-lg p-2 ${form.rent && !isRentValid ? 'border-red-500' : ''}`}
          />
          {form.rent && !isRentValid && (
            <p className="text-red-500 text-xs mt-1">Rent must be a positive number.</p>
          )}
        </div>
        <div className="mt-4">
          {/* Address */}
          <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
            <MapPin className="w-5 h-5 text-[rgb(77,95,171)]" /> Address
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="Enter address"
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div className="mt-4">
          {/* Contact Number */}
          <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
            <Users className="w-5 h-5 text-[rgb(77,95,171)]" /> Contact Number
          </label>
          <input
            type="tel"
            value={form.contact}
            onChange={(e) => handleChange("contact", e.target.value.replace(/[^0-9]/g, ""))}
            placeholder="Enter 10-digit contact number"
            maxLength={10}
            className={`w-full border rounded-lg p-2 ${form.contact && !isContactValid ? 'border-red-500' : ''}`}
          />
          {form.contact && !isContactValid && (
            <p className="text-red-500 text-xs mt-1">Contact must be exactly 10 digits.</p>
          )}
        </div>
        <div className="mt-4">
          {/* Map Link */}
          <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
            <MapPin className="w-5 h-5 text-[rgb(77,95,171)]" /> Google Map Link
          </label>
          <input
            type="text"
            value={form.mapLink}
            onChange={(e) => handleChange("mapLink", e.target.value)}
            placeholder="Paste Google Map link here"
            className="w-full border rounded-lg p-2"
          />
        </div>
        <div className="mt-4">
          {/* Seater */}
          <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
            <Users className="w-5 h-5 text-[rgb(77,95,171)]" /> Seater
          </label>
          <div className="flex gap-2">
            {["1", "2", "3", "4", "5"].map((num) => (
              <SelectButton
                key={num}
                label={num}
                selected={form.seater === num}
                onClick={() => handleChange("seater", num)}
              />
            ))}
          </div>
        </div>
        <div className="mt-4">
          {/* For Whom */}
          <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
            <Users className="w-5 h-5 text-[rgb(77,95,171)]" /> For Whom
          </label>
          <div className="flex gap-2">
            {["Boys", "Girls"].map((opt) => (
              <SelectButton
                key={opt}
                label={opt}
                selected={form.forWhom === opt}
                onClick={() => handleChange("forWhom", opt)}
              />
            ))}
          </div>
        </div>
        <div className="mt-4">
          {/* Hostel Timing */}
          <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
            <Clock className="w-5 h-5 text-[rgb(77,95,171)]" /> Hostel Timing
          </label>
          {(() => {
            // Copy breakfast timing section's style and structure
            const parsed = parseMealTiming(form.hostelTiming);
            const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
            const minuteOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
            const selectClass =
              "px-4 py-2 rounded-lg border transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200 focus:bg-[rgb(77,95,171)] focus:text-white focus:border-[rgb(77,95,171)] focus:ring-2 focus:ring-[rgb(77,95,171)] outline-none font-medium w-full max-w-[80px] min-w-[60px] text-base sm:text-base text-[15px]";
            const meridianClass =
              "px-4 py-2 rounded-lg border transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200 focus:bg-[rgb(77,95,171)] focus:text-white focus:border-[rgb(77,95,171)] focus:ring-2 focus:ring-[rgb(77,95,171)] outline-none font-medium w-full max-w-[80px] min-w-[60px] text-xs";
            // Blur AM/PM after 1s
            const startMeridianRef = React.useRef();
            const endMeridianRef = React.useRef();
            return (
              <div className="flex flex-col gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3 shadow-sm w-full min-w-0">
                {/* Start Time */}
                <div className="flex flex-col items-start w-full">
                  <span className="text-xs text-gray-500 mb-1">From</span>
                  <div className="flex items-center gap-1 w-full">
                    <select
                      value={parsed.startHour}
                      onChange={e => {
                        const next = { ...parsed, startHour: e.target.value };
                        handleChange("hostelTiming", buildMealTiming(next));
                      }}
                      className={selectClass}
                    >
                      {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="text-gray-700">:</span>
                    <select
                      value={parsed.startMinute}
                      onChange={e => {
                        const next = { ...parsed, startMinute: e.target.value };
                        handleChange("hostelTiming", buildMealTiming(next));
                      }}
                      className={selectClass}
                    >
                      {minuteOptions.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <button
                      type="button"
                      ref={startMeridianRef}
                      onClick={() => {
                        const next = { ...parsed, startMeridian: parsed.startMeridian === 'AM' ? 'PM' : 'AM' };
                        handleChange("hostelTiming", buildMealTiming(next));
                        setTimeout(() => {
                          if (startMeridianRef.current) startMeridianRef.current.blur();
                        }, 1000);
                      }}
                      className={meridianClass}
                    >
                      {parsed.startMeridian}
                    </button>
                  </div>
                </div>
                {/* End Time */}
                <div className="flex flex-col items-start w-full">
                  <span className="text-xs text-gray-500 mb-1">To</span>
                  <div className="flex items-center gap-1 w-full">
                    <select
                      value={parsed.endHour}
                      onChange={e => {
                        const next = { ...parsed, endHour: e.target.value };
                        handleChange("hostelTiming", buildMealTiming(next));
                      }}
                      className={selectClass}
                    >
                      {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="text-gray-700">:</span>
                    <select
                      value={parsed.endMinute}
                      onChange={e => {
                        const next = { ...parsed, endMinute: e.target.value };
                        handleChange("hostelTiming", buildMealTiming(next));
                      }}
                      className={selectClass}
                    >
                      {minuteOptions.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <button
                      type="button"
                      ref={endMeridianRef}
                      onClick={() => {
                        const next = { ...parsed, endMeridian: parsed.endMeridian === 'AM' ? 'PM' : 'AM' };
                        handleChange("hostelTiming", buildMealTiming(next));
                        setTimeout(() => {
                          if (endMeridianRef.current) endMeridianRef.current.blur();
                        }, 1000);
                      }}
                      className={meridianClass}
                    >
                      {parsed.endMeridian}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
        <div className="mt-4">
          {/* Amenities */}
          <label className="font-medium text-gray-700 mb-2 block">Amenities</label>
          <div className="grid grid-cols-2 gap-2">
            {amenitiesList.map((amenity) => (
              <label key={amenity} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.amenities.includes(amenity)}
                  onChange={() => handleAmenityToggle(amenity)}
                  className="w-4 h-4 accent-[rgb(77,95,171)]"
                />
                {amenity}
              </label>
            ))}
          </div>
        </div>
        {['Breakfast', 'Lunch', 'Dinner'].map((meal, idx) => {
          const key = meal.toLowerCase();
          const parsed = parseMealTiming(form[key + 'Timing']);
          const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
          const minuteOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
          const selectClass =
            "px-4 py-2 rounded-lg border transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200 focus:bg-[rgb(77,95,171)] focus:text-white focus:border-[rgb(77,95,171)] focus:ring-2 focus:ring-[rgb(77,95,171)] outline-none font-medium w-full max-w-[80px] min-w-[60px] text-base sm:text-base text-[15px]";
          const meridianClass =
            "px-4 py-2 rounded-lg border transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200 focus:bg-[rgb(77,95,171)] focus:text-white focus:border-[rgb(77,95,171)] focus:ring-2 focus:ring-[rgb(77,95,171)] outline-none font-medium w-full max-w-[80px] min-w-[60px] text-xs";
          // Pick refs for each meal
          const startRef = idx === 0 ? breakfastStartMeridianRef : idx === 1 ? lunchStartMeridianRef : dinnerStartMeridianRef;
          const endRef = idx === 0 ? breakfastEndMeridianRef : idx === 1 ? lunchEndMeridianRef : dinnerEndMeridianRef;
          return (
            <div key={meal} className="mt-4">
              <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
                {meal} Timing
              </label>
              <div className="flex flex-col gap-2 bg-gray-50 border border-gray-200 rounded-xl p-3 shadow-sm w-full min-w-0">
                {/* Start Time */}
                <div className="flex flex-col items-start w-full">
                  <span className="text-xs text-gray-500 mb-1">From</span>
                  <div className="flex items-center gap-1 w-full">
                    <select
                      value={parsed.startHour}
                      onChange={e => {
                        const next = { ...parsed, startHour: e.target.value };
                        handleChange(key + 'Timing', buildMealTiming(next));
                      }}
                      className={selectClass}
                    >
                      {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="text-gray-700">:</span>
                    <select
                      value={parsed.startMinute}
                      onChange={e => {
                        const next = { ...parsed, startMinute: e.target.value };
                        handleChange(key + 'Timing', buildMealTiming(next));
                      }}
                      className={selectClass}
                    >
                      {minuteOptions.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <button
                      type="button"
                      ref={startRef}
                      onClick={() => {
                        const next = { ...parsed, startMeridian: parsed.startMeridian === 'AM' ? 'PM' : 'AM' };
                        handleChange(key + 'Timing', buildMealTiming(next));
                        setTimeout(() => {
                          if (startRef.current) startRef.current.blur();
                        }, 1000);
                      }}
                      className={meridianClass}
                    >
                      {parsed.startMeridian}
                    </button>
                  </div>
                </div>
                {/* End Time */}
                <div className="flex flex-col items-start w-full">
                  <span className="text-xs text-gray-500 mb-1">To</span>
                  <div className="flex items-center gap-1 w-full">
                    <select
                      value={parsed.endHour}
                      onChange={e => {
                        const next = { ...parsed, endHour: e.target.value };
                        handleChange(key + 'Timing', buildMealTiming(next));
                      }}
                      className={selectClass}
                    >
                      {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <span className="text-gray-700">:</span>
                    <select
                      value={parsed.endMinute}
                      onChange={e => {
                        const next = { ...parsed, endMinute: e.target.value };
                        handleChange(key + 'Timing', buildMealTiming(next));
                      }}
                      className={selectClass}
                    >
                      {minuteOptions.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <button
                      type="button"
                      ref={endRef}
                      onClick={() => {
                        const next = { ...parsed, endMeridian: parsed.endMeridian === 'AM' ? 'PM' : 'AM' };
                        handleChange(key + 'Timing', buildMealTiming(next));
                        setTimeout(() => {
                          if (endRef.current) endRef.current.blur();
                        }, 1000);
                      }}
                      className={meridianClass}
                    >
                      {parsed.endMeridian}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div className="mt-6">
          {/* Description */}
          <label className="font-medium text-gray-700 mb-2 block">
            Description (Optional)
          </label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Write something about your hostel..."
            className="w-full border rounded-lg p-3"
          />
        </div>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        {success && <p className="text-green-600 text-center mt-4">{success}</p>}
        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`mt-6 w-full py-3 rounded-xl text-white font-bold ${
            isFormValid && !loading
              ? "bg-[rgb(77,95,171)] hover:opacity-90"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {loading ? "Publishing..." : "Publish"}
        </button>
      </form>
    </div>
  );
};

// ----------- WRAPPER -------------
const Hostel = () => {
  return (
    <>
      <div className="hidden md:block">
        <HostelFormPC />
      </div>
      <div className="block md:hidden">
        <HostelFormMobile />
      </div>
    </>
  );
};

const HostelWithFooter = () => (
  <>
    <Hostel />
    <Footer />
  </>
);
export default HostelWithFooter;
