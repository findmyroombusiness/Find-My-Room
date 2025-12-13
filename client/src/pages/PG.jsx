import Footer from "../components/Footer";
// Pg.jsx
import { apiFetch } from "../utils/apiFetch";
import React, { useState } from "react";
import {
  Upload,
  DollarSign,
  MapPin,
  Home,
  Users,
  Bed,
  Utensils,
  Zap,
  Droplet,
  Beef,
  Bath,
  ChefHat,
  Phone,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

// Cloudinary upload helper (shared behavior with Room.jsx)
async function uploadToCloudinary(file) {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "ml_default");
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

  // Use a unique id for each ImageUpload instance to avoid label/input mismatch on mobile
  const inputId = React.useId ? React.useId() : 'imageUpload';
  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed border-[rgb(77,95,171)] rounded-xl p-6 flex flex-col items-center justify-center bg-white cursor-pointer hover:bg-gray-50"
    >
      <Upload className="w-10 h-10 text-[rgb(77,95,171)] mb-2" />
      <p className="text-gray-600 mb-2">Drag & Drop or Click to Upload</p>
      <input
        type="file"
        multiple
        style={{ display: 'none' }}
        id={inputId}
        onChange={(e) => handleFiles(e.target.files)}
      />
      <label
        htmlFor={inputId}
        className="px-4 py-2 bg-[rgb(77,95,171)] text-white rounded-lg cursor-pointer hover:opacity-90"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') document.getElementById(inputId).click(); }}
      >
        Select Images
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4 w-full">
        {images.map((img, i) => {
          const src = img.preview && (/^(https?:|blob:|\/)/.test(img.preview)) ? img.preview : "/vite.svg";
          return (
            <div key={i} className="relative group">
              <img
                src={src}
                alt="preview"
                className="w-full h-24 object-cover rounded-lg"
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

// ----------- PC FORM -------------
const PgFormPC = () => {
  // For timing section: AM/PM blur logic and select dropdown style
  const timingStartMeridianRef = React.useRef();
  const timingEndMeridianRef = React.useRef();
  // Helper functions for timing
  const parseMealTiming = (timingStr) => {
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
  const selectDropdownWhite = `\n  select option { background: white !important; color: #222 !important; }\n`;
  const navigate = useNavigate();
  const location = window.location && window.location.state ? window.location : {};
  let routerState = {};
  try {
    routerState = (typeof useNavigate === 'function' && typeof window !== 'undefined' && window.history && window.history.state && window.history.state.usr) ? window.history.state.usr : {};
  } catch {}
  const state = (location && location.state) || routerState || {};
  const editMode = state.editMode || false;
  const listing = state.listing || null;

  const [form, setForm] = useState(
    editMode && listing
      ? {
          rent: listing.rent || "",
          address: listing.address || "",
          contact: listing.contact || "",
          seater: listing.seater !== undefined && listing.seater !== null ? String(listing.seater) : "",
          rooms: listing.rooms !== undefined && listing.rooms !== null ? String(listing.rooms) : "",
          furnishing: listing.furnishing || "",
          forWhom: listing.forWhom || "",
          cooking: listing.cooking || "",
          electricitybill: listing.electricitybill || "",
          waterbill: listing.waterbill || "",
          food: listing.food || "",
          washroom: listing.washroom || "",
          kitchen: listing.kitchen || "",
          timing: listing.timing || "12:00 AM to 12:00 AM",
          description: listing.description || "",
          mapLink: listing.mapLink || "",
        }
      : {
          rent: "",
          address: "",
          contact: "",
          seater: "",
          rooms: "",
          furnishing: "",
          forWhom: "",
          cooking: "",
          electricitybill: "",
          waterbill: "",
          food: "",
          washroom: "",
          kitchen: "",
          timing: "12:00 AM to 12:00 AM",
          description: "",
          mapLink: "",
        }
  );

  // When editing, update form/images state if listing changes (after PUT)
  React.useEffect(() => {
    if (editMode && listing) {
      setForm({
        rent: listing.rent || "",
        address: listing.address || "",
        contact: listing.contact || "",
        seater: listing.seater !== undefined && listing.seater !== null ? String(listing.seater) : "",
        rooms: listing.rooms !== undefined && listing.rooms !== null ? String(listing.rooms) : "",
        furnishing: listing.furnishing || "",
        forWhom: listing.forWhom || "",
        cooking: listing.cooking || "",
        electricitybill: listing.electricitybill || "",
        waterbill: listing.waterbill || "",
        food: listing.food || "",
        washroom: listing.washroom || "",
        kitchen: listing.kitchen || "",
        timing: listing.timing || "12:00 AM to 12:00 AM",
        description: listing.description || "",
        mapLink: listing.mapLink || "",
      });
      setImages(listing.images ? listing.images.map((url) => ({ file: null, preview: url })) : []);
    }
  }, [editMode, listing]);
  const [images, setImages] = useState(
    editMode && listing && listing.images
      ? listing.images.map((url) => ({ file: null, preview: url }))
      : []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isContactValid = /^[0-9]{10}$/.test(form.contact);
  const isRentValid = /^[1-9][0-9]*$/.test(form.rent);
  const isFormValid =
    isRentValid &&
    form.address &&
    isContactValid &&
    form.seater &&
    form.rooms &&
    form.furnishing &&
    form.forWhom &&
    form.cooking &&
    form.electricitybill &&
    form.waterbill &&
    form.food &&
    form.washroom &&
    form.kitchen &&
    form.timing &&
    form.mapLink;

  const validateForm = () => {
    const errors = {};
    if (!form.rent || !/^[1-9][0-9]*$/.test(form.rent)) errors.rent = "Enter a valid rent (numbers only).";
    if (!form.address) errors.address = "Address is required.";
    if (!/^[0-9]{10}$/.test(form.contact)) errors.contact = "Contact must be exactly 10 digits.";
    if (!form.seater) errors.seater = "Select seater.";
    if (!form.rooms) errors.rooms = "Select number of rooms.";
    if (!form.furnishing) errors.furnishing = "Select furnishing.";
    if (!form.forWhom) errors.forWhom = "Select who it's for.";
    if (!form.cooking) errors.cooking = "Select cooking option.";
    if (!form.electricitybill) errors.electricitybill = "Select electricity option.";
    if (!form.waterbill) errors.waterbill = "Select water option.";
    if (!form.food) errors.food = "Select food option.";
    if (!form.washroom) errors.washroom = "Select washroom option.";
    if (!form.kitchen) errors.kitchen = "Select kitchen option.";
    if (!form.timing) errors.timing = "Timing is required.";
    if (!form.mapLink) errors.mapLink = "Map link is required.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    try {
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
      let res, data;
      const pgId = editMode && listing && listing._id ? listing._id : null;
      if (editMode) {
        if (!pgId) {
          setError("Missing PG ID. Cannot update.");
          alert("Missing PG ID. Cannot update.");
          setLoading(false);
          return;
        }
        const putUrl = `${import.meta.env.VITE_API_BASE_URL}/api/pgs/${pgId}`;
        res = await apiFetch(putUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...form, images: imageUrls }),
        });
      } else {
        const postUrl = `${import.meta.env.VITE_API_BASE_URL}/api/pgs`;
        res = await apiFetch(postUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...form, images: imageUrls }),
        });
      }
      let ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        if (!res.ok) throw new Error(text || "Server error");
        data = {};
      }
      if (!res.ok) {
        if (res.status === 404) {
          setError("PG not found or deleted.");
          alert("PG not found or deleted.");
        } else {
          setError((data && data.message) || "Failed to publish");
        }
        setLoading(false);
        return;
      }
      setSuccess(editMode ? "Listing updated!" : "Listing published!");
      setTimeout(() => navigate("/MyListing?type=pg"), 1200);
    } catch (err) {
      setError(err.message || "Failed to publish");
      if (err.message && err.message.includes("404")) {
        alert("PG not found or deleted.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (

    <div>
      <Navbar />
    <div className="min-h-screen bg-gray-100  flex justify-center items-center p-8">
      
      <form className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-5xl" onSubmit={handleSubmit}>
        <h1 className="text-2xl font-bold mb-6 text-center text-[rgb(77,95,171)]">
          List Your PG
        </h1>

        {/* Image Upload */}
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
              className="w-full border rounded-lg p-2"
            />
            {fieldErrors.rent && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.rent}</p>
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

          {/* Contact Number (styled like Room.jsx) */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
              <Phone className="w-5 h-5 text-[rgb(77,95,171)]" /> Contact Number
            </label>
            <input
              type="tel"
              value={form.contact}
              onChange={(e) => handleChange("contact", e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="Enter 10-digit contact number"
              maxLength={10}
              className={`w-full border rounded-lg p-2 ${form.contact && !/^[0-9]{10}$/.test(form.contact) ? 'border-red-500' : ''}`}
            />
            {form.contact && !/^[0-9]{10}$/.test(form.contact) && (
              <p className="text-red-500 text-xs mt-1">Contact must be exactly 10 digits.</p>
            )}
            {fieldErrors.contact && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.contact}</p>
            )}
          </div>

          {/* Map Link */}
          <div className="col-span-2">
            <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
              <MapPin className="w-5 h-5 text-[rgb(77,95,171)]" /> Google Map
              Link
            </label>
            <input
              type="text"
              value={form.mapLink}
              onChange={(e) => handleChange("mapLink", e.target.value)}
              placeholder="Paste Google Map link here"
              className="w-full border rounded-lg p-2"
            />
            {fieldErrors.mapLink && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.mapLink}</p>
            )}
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
            {fieldErrors.seater && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.seater}</p>
            )}
          </div>

          {/* Rooms */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
              <Bed className="w-5 h-5 text-[rgb(77,95,171)]" /> Number of Rooms
            </label>
            <div className="flex gap-2">
              {["1", "2", "3", "4", "5"].map((num) => (
                <SelectButton
                  key={num}
                  label={num}
                  selected={form.rooms === num}
                  onClick={() => handleChange("rooms", num)}
                />
              ))}
            </div>
            {fieldErrors.rooms && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.rooms}</p>
            )}
          </div>

          {/* Furnishing */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
              <Home className="w-5 h-5 text-[rgb(77,95,171)]" /> Furnishing
            </label>
            <div className="flex gap-2">
              {["Furnished", "Semi-Furnished", "Unfurnished"].map((opt) => (
                <SelectButton
                  key={opt}
                  label={opt}
                  selected={form.furnishing === opt}
                  onClick={() => handleChange("furnishing", opt)}
                />
              ))}
            </div>
              {fieldErrors.furnishing && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.furnishing}</p>
              )}
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
              {fieldErrors.forWhom && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.forWhom}</p>
              )}
          </div>

          {/* Cooking */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
              <Utensils className="w-5 h-5 text-[rgb(77,95,171)]" /> Cooking
            </label>
            <div className="flex gap-2">
              {["Allowed", "Not Allowed"].map((opt) => (
                <SelectButton
                  key={opt}
                  label={opt}
                  selected={form.cooking === opt}
                  onClick={() => handleChange("cooking", opt)}
                />
              ))}
            </div>
            {fieldErrors.cooking && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.cooking}</p>
            )}
          </div>

          {/* Electricity */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
              <Zap className="w-5 h-5 text-[rgb(77,95,171)]" /> Electricity Bill
            </label>
            <div className="flex gap-2">
              {["Included", "Not Included"].map((opt) => (
                <SelectButton
                  key={opt}
                  label={opt}
                  selected={form.electricitybill === opt}
                  onClick={() => handleChange("electricitybill", opt)}
                />
              ))}
            </div>
            {fieldErrors.electricitybill && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.electricitybill}</p>
            )}
          </div>

          {/* Water */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
              <Droplet className="w-5 h-5 text-[rgb(77,95,171)]" /> Water Bill
            </label>
            <div className="flex gap-2">
              {["Included", "Not Included"].map((opt) => (
                <SelectButton
                  key={opt}
                  label={opt}
                  selected={form.waterbill === opt}
                  onClick={() => handleChange("waterbill", opt)}
                />
              ))}
            </div>
            {fieldErrors.waterbill && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.waterbill}</p>
            )}
          </div>

          {/* Food */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
              <Beef className="w-5 h-5 text-[rgb(77,95,171)]" /> Food
            </label>
            <div className="flex gap-2">
              {["Veg", "Non-Veg"].map((opt) => (
                <SelectButton
                  key={opt}
                  label={opt}
                  selected={form.food === opt}
                  onClick={() => handleChange("food", opt)}
                />
              ))}
            </div>
            {fieldErrors.food && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.food}</p>
            )}
          </div>

          {/* Washroom */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
              <Bath className="w-5 h-5 text-[rgb(77,95,171)]" /> Washroom
            </label>
            <div className="flex gap-2">
              {["Attached", "Separated", "Common"].map((opt) => (
                <SelectButton
                  key={opt}
                  label={opt}
                  selected={form.washroom === opt}
                  onClick={() => handleChange("washroom", opt)}
                />
              ))}
            </div>
            {fieldErrors.washroom && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.washroom}</p>
            )}
          </div>

          {/* Kitchen */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
              <ChefHat className="w-5 h-5 text-[rgb(77,95,171)]" /> Kitchen
            </label>
            <div className="flex gap-2">
              {["Included", "Not Included", "Common"].map((opt) => (
                <SelectButton
                  key={opt}
                  label={opt}
                  selected={form.kitchen === opt}
                  onClick={() => handleChange("kitchen", opt)}
                />
              ))}
            </div>
            {fieldErrors.kitchen && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.kitchen}</p>
            )}
          </div>

          {/* Timing (main, like Hostel.jsx) */}
          <div className="col-span-2">
            {/* Custom style for select dropdowns to force only dropdown list white */}
            <style>{selectDropdownWhite}</style>
            <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
              Timing
            </label>
            {(() => {
              const parsed = parseMealTiming(form.timing);
              const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
              const minuteOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
              const selectClass =
                "px-4 py-2 rounded-lg border transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200 focus:bg-[rgb(77,95,171)] focus:text-white focus:border-[rgb(77,95,171)] focus:ring-2 focus:ring-[rgb(77,95,171)] outline-none font-medium";
              const meridianClass =
                "px-4 py-2 rounded-lg border transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200 focus:bg-[rgb(77,95,171)] focus:text-white focus:border-[rgb(77,95,171)] focus:ring-2 focus:ring-[rgb(77,95,171)] outline-none font-medium";
              return (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <select
                      value={parsed.startHour}
                      onChange={e => {
                        const next = { ...parsed, startHour: e.target.value };
                        handleChange("timing", buildMealTiming(next));
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
                        handleChange("timing", buildMealTiming(next));
                      }}
                      className={selectClass}
                    >
                      {minuteOptions.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <button
                      type="button"
                      ref={timingStartMeridianRef}
                      onClick={() => {
                        const next = { ...parsed, startMeridian: parsed.startMeridian === "AM" ? "PM" : "AM" };
                        handleChange("timing", buildMealTiming(next));
                        setTimeout(() => {
                          if (timingStartMeridianRef.current) timingStartMeridianRef.current.blur();
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
                        handleChange("timing", buildMealTiming(next));
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
                        handleChange("timing", buildMealTiming(next));
                      }}
                      className={selectClass}
                    >
                      {minuteOptions.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <button
                      type="button"
                      ref={timingEndMeridianRef}
                      onClick={() => {
                        const next = { ...parsed, endMeridian: parsed.endMeridian === "AM" ? "PM" : "AM" };
                        handleChange("timing", buildMealTiming(next));
                        setTimeout(() => {
                          if (timingEndMeridianRef.current) timingEndMeridianRef.current.blur();
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
            {fieldErrors.timing && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.timing}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <label className="font-medium text-gray-700 mb-2 block">
            Description (Optional)
          </label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Write something about your PG..."
            className="w-full border rounded-lg p-3"
          />
        </div>

        {/* Publish */}
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
const PgFormMobile = () => {
  // For timing section: AM/PM blur logic and select dropdown style
  const timingStartMeridianRef = React.useRef();
  const timingEndMeridianRef = React.useRef();
  // Helper functions for timing
  const parseMealTiming = (timingStr) => {
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
  const selectDropdownWhite = `\n  select option { background: white !important; color: #222 !important; }\n`;
  const location = typeof window !== 'undefined' && window.location && window.location.state ? window.location : {};
  let routerState = {};
  try { routerState = (typeof window !== 'undefined' && window.history && window.history.state && window.history.state.usr) ? window.history.state.usr : {}; } catch (e) {}
  const state = (location && location.state) || routerState || {};
  const editMode = state.editMode || false;
  const listing = state.listing || null;

  const [images, setImages] = useState(() => (
    editMode && listing && listing.images ? listing.images.map((url) => ({ file: null, preview: url })) : []
  ));
  const [form, setForm] = useState(() => (
    editMode && listing
      ? {
          rent: listing.rent || "",
          address: listing.address || "",
          contact: listing.contact || "",
          seater: listing.seater || "",
          rooms: listing.rooms || "",
          furnishing: listing.furnishing || "",
          forWhom: listing.forWhom || "",
          cooking: listing.cooking || "",
          electricitybill: listing.electricitybill || "",
          waterbill: listing.waterbill || "",
          food: listing.food || "",
          washroom: listing.washroom || "",
          kitchen: listing.kitchen || "",
          timing: listing.timing || "12:00 AM to 12:00 AM",
          description: listing.description || "",
          mapLink: listing.mapLink || "",
        }
      : {
          rent: "",
          address: "",
          contact: "",
          seater: "",
          rooms: "",
          furnishing: "",
          forWhom: "",
          cooking: "",
          electricitybill: "",
          waterbill: "",
          food: "",
          washroom: "",
          kitchen: "",
          timing: "12:00 AM to 12:00 AM",
          description: "",
          mapLink: "",
        }
  ));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isContactValid = /^[0-9]{10}$/.test(form.contact);
  const isRentValid = /^[1-9][0-9]*$/.test(form.rent);
  const isFormValid =
    isRentValid &&
    form.address &&
    isContactValid &&
    form.seater &&
    form.rooms &&
    form.furnishing &&
    form.forWhom &&
    form.cooking &&
    form.electricitybill &&
    form.waterbill &&
    form.food &&
    form.washroom &&
    form.kitchen &&
    form.timing &&
    form.mapLink;

  const validateForm = () => {
    const errors = {};
    if (!form.rent || !/^[1-9][0-9]*$/.test(form.rent)) errors.rent = "Enter a valid rent (numbers only).";
    if (!form.address) errors.address = "Address is required.";
    if (!/^[0-9]{10}$/.test(form.contact)) errors.contact = "Contact must be exactly 10 digits.";
    if (!form.seater) errors.seater = "Select seater.";
    if (!form.rooms) errors.rooms = "Select number of rooms.";
    if (!form.furnishing) errors.furnishing = "Select furnishing.";
    if (!form.forWhom) errors.forWhom = "Select who it's for.";
    if (!form.cooking) errors.cooking = "Select cooking option.";
    if (!form.electricitybill) errors.electricitybill = "Select electricity option.";
    if (!form.waterbill) errors.waterbill = "Select water option.";
    if (!form.food) errors.food = "Select food option.";
    if (!form.washroom) errors.washroom = "Select washroom option.";
    if (!form.kitchen) errors.kitchen = "Select kitchen option.";
    if (!form.timing) errors.timing = "Timing is required.";
    if (!form.mapLink) errors.mapLink = "Map link is required.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
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
      const res = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/pgs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, images: imageUrls }),
      });


      let data = null;
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        if (!res.ok) throw new Error(text || "Server error");
        data = {};
      }

      if (!res.ok) throw new Error((data && data.message) || "Failed to publish");
  setSuccess("Listing published!");
  setTimeout(() => navigate("/MyListing?type=pg"), 1200);
    } catch (err) {
      setError(err.message || "Failed to publish");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[81vh] mt-20  bg-gray-100 p-4 md:hidden">
      <Navbar />
  <form className="bg-white p-6 rounded-2xl shadow-lg" onSubmit={handleSubmit}>
        <h1 className="text-xl font-bold mb-6 text-center text-[rgb(77,95,171)]">
          List Your PG
        </h1>

        {/* Image Upload */}
        <ImageUpload images={images} setImages={setImages} />

        {/* Rent */}
        <label className="flex items-center gap-2 font-medium text-gray-700 mt-4 mb-2">
          <DollarSign className="w-5 h-5 text-[rgb(77,95,171)]" /> Rent
        </label>
        <input
          type="text"
          value={form.rent}
          onChange={(e) => handleChange("rent", e.target.value.replace(/[^0-9]/g, ""))}
          placeholder="Enter rent amount"
          className="w-full border rounded-lg p-2"
        />

        {/* Address */}
        <label className="flex items-center gap-2 font-medium text-gray-700 mt-4 mb-2">
          <MapPin className="w-5 h-5 text-[rgb(77,95,171)]" /> Address
        </label>
        <input
          type="text"
          value={form.address}
          onChange={(e) => handleChange("address", e.target.value)}
          placeholder="Enter address"
          className="w-full border rounded-lg p-2"
        />
        {fieldErrors.address && (
          <p className="text-red-500 text-sm mt-1">{fieldErrors.address}</p>
        )}

        {/* Contact Number (styled like Room.jsx) */}
        <label className="flex items-center gap-2 font-medium text-gray-700 mt-4 mb-2">
          <Phone className="w-5 h-5 text-[rgb(77,95,171)]" /> Contact Number
        </label>
        <input
          type="tel"
          value={form.contact}
          onChange={(e) => handleChange("contact", e.target.value.replace(/[^0-9]/g, ""))}
          maxLength={10}
          placeholder="Enter 10-digit contact number"
          className={`w-full border rounded-lg p-2 ${form.contact && !/^[0-9]{10}$/.test(form.contact) ? 'border-red-500' : ''}`}
        />
        {form.contact && !/^[0-9]{10}$/.test(form.contact) && (
          <p className="text-red-500 text-xs mt-1">Contact must be exactly 10 digits.</p>
        )}
        {fieldErrors.contact && (
          <p className="text-red-500 text-sm mt-1">{fieldErrors.contact}</p>
        )}

        {/* Map Link */}
        <label className="flex items-center gap-2 font-medium text-gray-700 mt-4 mb-2">
          <MapPin className="w-5 h-5 text-[rgb(77,95,171)]" /> Google Map Link
        </label>
        <input
          type="text"
          value={form.mapLink}
          onChange={(e) => handleChange("mapLink", e.target.value)}
          placeholder="Paste Google Map link here"
          className="w-full border rounded-lg p-2"
        />
        {fieldErrors.mapLink && (
          <p className="text-red-500 text-sm mt-1">{fieldErrors.mapLink}</p>
        )}

        {/* Seater */}
        <label className="flex items-center gap-2 font-medium text-gray-700 mt-4 mb-2">
          <Users className="w-5 h-5 text-[rgb(77,95,171)]" /> Seater
        </label>
        <div className="flex gap-2 flex-wrap">
          {["1", "2", "3", "4", "5"].map((num) => (
            <SelectButton
              key={num}
              label={num}
              selected={form.seater === num}
              onClick={() => handleChange("seater", num)}
            />
          ))}
        </div>
        {fieldErrors.seater && (
          <p className="text-red-500 text-sm mt-1">{fieldErrors.seater}</p>
        )}

        {/* Rooms */}
        <label className="flex items-center gap-2 font-medium text-gray-700 mt-4 mb-2">
          <Bed className="w-5 h-5 text-[rgb(77,95,171)]" /> Number of Rooms
        </label>
        <div className="flex gap-2 flex-wrap">
          {["1", "2", "3", "4", "5"].map((num) => (
            <SelectButton
              key={num}
              label={num}
              selected={form.rooms === num}
              onClick={() => handleChange("rooms", num)}
            />
          ))}
        </div>
        {fieldErrors.rooms && (
          <p className="text-red-500 text-sm mt-1">{fieldErrors.rooms}</p>
        )}

        {/* Furnishing */}
        <label className="flex items-center gap-2 font-medium text-gray-700 mt-4 mb-2">
          <Home className="w-5 h-5 text-[rgb(77,95,171)]" /> Furnishing
        </label>
        <div className="flex gap-2 flex-wrap">
          {["Furnished", "Semi-Furnished", "Unfurnished"].map((opt) => (
            <SelectButton
              key={opt}
              label={opt}
              selected={form.furnishing === opt}
              onClick={() => handleChange("furnishing", opt)}
            />
          ))}
        </div>
        {fieldErrors.furnishing && (
          <p className="text-red-500 text-sm mt-1">{fieldErrors.furnishing}</p>
        )}

        {/* For Whom */}
        <label className="flex items-center gap-2 font-medium text-gray-700 mt-4 mb-2">
          <Users className="w-5 h-5 text-[rgb(77,95,171)]" /> For Whom
        </label>
        <div className="flex gap-2 flex-wrap">
          {["Boys", "Girls"].map((opt) => (
            <SelectButton
              key={opt}
              label={opt}
              selected={form.forWhom === opt}
              onClick={() => handleChange("forWhom", opt)}
            />
          ))}
        </div>
        {fieldErrors.forWhom && (
          <p className="text-red-500 text-sm mt-1">{fieldErrors.forWhom}</p>
        )}

        {/* Cooking */}
        <label className="flex items-center gap-2 font-medium text-gray-700 mt-4 mb-2">
          <Utensils className="w-5 h-5 text-[rgb(77,95,171)]" /> Cooking
        </label>
        <div className="flex gap-2 flex-wrap">
          {["Allowed", "Not Allowed"].map((opt) => (
            <SelectButton
              key={opt}
              label={opt}
              selected={form.cooking === opt}
              onClick={() => handleChange("cooking", opt)}
            />
          ))}
        </div>
        {fieldErrors.cooking && (
          <p className="text-red-500 text-sm mt-1">{fieldErrors.cooking}</p>
        )}

        {/* Electricity */}
        <label className="flex items-center gap-2 font-medium text-gray-700 mt-4 mb-2">
          <Zap className="w-5 h-5 text-[rgb(77,95,171)]" /> Electricity Bill
        </label>
        <div className="flex gap-2 flex-wrap">
          {["Included", "Not Included"].map((opt) => (
            <SelectButton
              key={opt}
              label={opt}
              selected={form.electricitybill === opt}
              onClick={() => handleChange("electricitybill", opt)}
            />
          ))}
        </div>
        {fieldErrors.electricitybill && (
          <p className="text-red-500 text-sm mt-1">{fieldErrors.electricitybill}</p>
        )}

        {/* Water */}
        <label className="flex items-center gap-2 font-medium text-gray-700 mt-4 mb-2">
          <Droplet className="w-5 h-5 text-[rgb(77,95,171)]" /> Water Bill
        </label>
        <div className="flex gap-2 flex-wrap">
          {["Included", "Not Included"].map((opt) => (
            <SelectButton
              key={opt}
              label={opt}
              selected={form.waterbill === opt}
              onClick={() => handleChange("waterbill", opt)}
            />
          ))}
        </div>
        {fieldErrors.waterbill && (
          <p className="text-red-500 text-sm mt-1">{fieldErrors.waterbill}</p>
        )}

        {/* Food */}
        <label className="flex items-center gap-2 font-medium text-gray-700 mt-4 mb-2">
          <Beef className="w-5 h-5 text-[rgb(77,95,171)]" /> Food
        </label>
        <div className="flex gap-2 flex-wrap">
          {["Veg", "Non-Veg"].map((opt) => (
            <SelectButton
              key={opt}
              label={opt}
              selected={form.food === opt}
              onClick={() => handleChange("food", opt)}
            />
          ))}
        </div>
        {fieldErrors.food && (
          <p className="text-red-500 text-sm mt-1">{fieldErrors.food}</p>
        )}

        {/* Washroom */}
        <label className="flex items-center gap-2 font-medium text-gray-700 mt-4 mb-2">
          <Bath className="w-5 h-5 text-[rgb(77,95,171)]" /> Washroom
        </label>
        <div className="flex gap-2 flex-wrap">
          {["Attached", "Separated", "Common"].map((opt) => (
            <SelectButton
              key={opt}
              label={opt}
              selected={form.washroom === opt}
              onClick={() => handleChange("washroom", opt)}
            />
          ))}
        </div>
        {fieldErrors.washroom && (
          <p className="text-red-500 text-sm mt-1">{fieldErrors.washroom}</p>
        )}

        {/* Kitchen */}
        <label className="flex items-center gap-2 font-medium text-gray-700 mt-4 mb-2">
          <ChefHat className="w-5 h-5 text-[rgb(77,95,171)]" /> Kitchen
        </label>
        <div className="flex gap-2 flex-wrap">
          {["Included", "Not Included", "Common"].map((opt) => (
            <SelectButton
              key={opt}
              label={opt}
              selected={form.kitchen === opt}
              onClick={() => handleChange("kitchen", opt)}
            />
          ))}
        </div>
        {fieldErrors.kitchen && (
          <p className="text-red-500 text-sm mt-1">{fieldErrors.kitchen}</p>
        )}

        {/* Timing (main, like Hostel.jsx) */}
        <label className="flex items-center gap-2 font-medium text-gray-700 mt-4 mb-2">
          Timing
        </label>
        {/* Custom style for select dropdowns to force only dropdown list white */}
        <style>{selectDropdownWhite}</style>
        {(() => {
          const parsed = parseMealTiming(form.timing);
          const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
          const minuteOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
          const selectClass =
            "px-4 py-2 rounded-lg border transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200 focus:bg-[rgb(77,95,171)] focus:text-white focus:border-[rgb(77,95,171)] focus:ring-2 focus:ring-[rgb(77,95,171)] outline-none font-medium w-full max-w-[80px] min-w-[60px] text-base sm:text-base text-[15px]";
          const meridianClass =
            "px-4 py-2 rounded-lg border transition-colors bg-gray-100 text-gray-800 hover:bg-gray-200 focus:bg-[rgb(77,95,171)] focus:text-white focus:border-[rgb(77,95,171)] focus:ring-2 focus:ring-[rgb(77,95,171)] outline-none font-medium w-full max-w-[80px] min-w-[60px] text-xs";
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
                      handleChange("timing", buildMealTiming(next));
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
                      handleChange("timing", buildMealTiming(next));
                    }}
                    className={selectClass}
                  >
                    {minuteOptions.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <button
                    type="button"
                    ref={timingStartMeridianRef}
                    onClick={() => {
                      const next = { ...parsed, startMeridian: parsed.startMeridian === 'AM' ? 'PM' : 'AM' };
                      handleChange("timing", buildMealTiming(next));
                      setTimeout(() => {
                        if (timingStartMeridianRef.current) timingStartMeridianRef.current.blur();
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
                      handleChange("timing", buildMealTiming(next));
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
                      handleChange("timing", buildMealTiming(next));
                    }}
                    className={selectClass}
                  >
                    {minuteOptions.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <button
                    type="button"
                    ref={timingEndMeridianRef}
                    onClick={() => {
                      const next = { ...parsed, endMeridian: parsed.endMeridian === 'AM' ? 'PM' : 'AM' };
                      handleChange("timing", buildMealTiming(next));
                      setTimeout(() => {
                        if (timingEndMeridianRef.current) timingEndMeridianRef.current.blur();
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
        {fieldErrors.timing && (
          <p className="text-red-500 text-sm mt-1">{fieldErrors.timing}</p>
        )}

        {/* Description */}
        <label className="font-medium text-gray-700 mt-4 mb-2 block">
          Description (Optional)
        </label>
        <textarea
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Write something about your PG..."
          className="w-full border rounded-lg p-3"
        />

        {/* Publish */}
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
const Pg = () => {
  return (
    <>
      <div className="hidden md:block">
        <PgFormPC />
      </div>
      <div className="block md:hidden">
        <PgFormMobile />
      </div>
    </>

  );
};

const PgWithFooter = () => (
  <>
    <Pg />
    <Footer />
  </>
);
export default PgWithFooter;
