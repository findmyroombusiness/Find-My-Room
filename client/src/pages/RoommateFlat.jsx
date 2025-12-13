import Footer from "../components/Footer";
import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "../utils/apiFetch";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  DollarSign,
  MapPin,
  Home,
  Users,
  Bed,
  Zap,
  Droplet,
  Beef,
  Bath,
} from "lucide-react";
import Navbar from "../components/Navbar";

// Small reusable select button
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
const ImageUpload = ({ images, setImages, onlyCloudinary }) => {
  useEffect(() => {
    // Revoke blob object URLs on unmount only to avoid revoking while still in use.
    return () => {
      images.forEach((img) => {
        if (img.file && img.preview && img.preview.startsWith("blob:")) {
          try { URL.revokeObjectURL(img.preview); } catch (e) {}
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const displayImages = onlyCloudinary
    ? images.filter((img) => img.preview && img.preview.startsWith("https://res.cloudinary.com"))
    : images.filter((img) => img.preview);

  const fallbackImg = "/vite.svg";
  const inputRef = useRef();
  const [forceRender, setForceRender] = useState(0);
  useEffect(() => {
    setForceRender((f) => f + 1);
  }, [images]);

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
        ref={inputRef}
        style={{ display: "block", width: 1, height: 1, opacity: 0, position: "absolute", left: -9999 }}
        onChange={(e) => handleFiles(e.target.files)}
        tabIndex={-1}
      />
      <button
        type="button"
        className="px-4 py-2 bg-[rgb(77,95,171)] text-white rounded-lg cursor-pointer hover:opacity-90"
        onClick={() => inputRef.current && inputRef.current.click()}
        style={{ marginBottom: 8 }}
      >
        Select Images
      </button>
      <div className="grid grid-cols-3 gap-2 mt-4 w-full">
        {displayImages.map((img, i) => {
          const src = img.preview && (/^(https?:|blob:|\/)/.test(img.preview)) ? img.preview : fallbackImg;
          return (
            <div key={i + "-" + forceRender} className="relative group">
              <img
                src={src}
                alt="preview"
                className="w-full h-24 object-cover rounded-lg"
                onError={(e) => { e.target.onerror = null; e.target.src = fallbackImg; }}
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

// Cloudinary upload helper (shared by both forms)
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

// ---------------- Roommate Flat Form Component ----------------

function RoommateFlatForm() {
  const navigate = useNavigate();
  const location = window && window.location ? window.location : {};
  let routerState = {};
  try {
    routerState = (typeof window !== "undefined" && window.history && window.history.state && window.history.state.usr) ? window.history.state.usr : {};
  } catch (e) {}
  const state = (location && location.state) || routerState || {};
  const editMode = state.editMode || false;
  const listing = state.listing || null;

  const [form, setForm] = useState(
    editMode && listing
      ? {
          rent: listing.rent || "",
          address: listing.address || "",
          contact: listing.contact || "",
          bhk: listing.bhk !== undefined && listing.bhk !== null ? String(listing.bhk) : "",
          furnishing: listing.furnishing || "",
          forWhom: listing.forWhom || "",
          independent: listing.independent || "",
          electricitybill: listing.electricitybill || "",
          waterbill: listing.waterbill || "",
          food: listing.food || "",
          washrooms: listing.washrooms || "",
          description: listing.description || "",
          mapLink: listing.mapLink || "",
        }
      : {
          rent: "",
          address: "",
          contact: "",
          bhk: "",
          furnishing: "",
          forWhom: "",
          independent: "",
          electricitybill: "",
          waterbill: "",
          food: "",
          washrooms: "",
          description: "",
          mapLink: "",
        }
  );
  const [images, setImages] = useState(
    editMode && listing && listing.images ? listing.images.map((url) => ({ file: null, preview: url })) : []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isContactValid = /^[0-9]{10}$/.test(form.contact);
  const isRentValid = /^[1-9][0-9]*$/.test(String(form.rent));
  const isFormValid =
    isRentValid &&
    form.address &&
    isContactValid &&
    form.bhk &&
    form.furnishing &&
    form.forWhom &&
    form.independent &&
    form.electricitybill &&
    form.waterbill &&
    form.food &&
    form.washrooms;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
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
      const roommateFlatId = editMode && listing && listing._id ? listing._id : null;
      const apiBase = import.meta.env.VITE_API_BASE_URL;
      if (editMode) {
        if (!roommateFlatId) {
          setError("Missing Roommate Flat ID. Cannot update.");
          alert("Missing Roommate Flat ID. Cannot update.");
          setLoading(false);
          return;
        }
        const putUrl = `${apiBase}/api/roommateflats/${roommateFlatId}`;
        res = await apiFetch(putUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...form, images: imageUrls }),
        });
      } else {
        const postUrl = `${apiBase}/api/roommateflats`;
        res = await apiFetch(postUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...form, images: imageUrls }),
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
          setError("Roommate Flat not found or deleted.");
          alert("Roommate Flat not found or deleted.");
        } else {
          setError(data.message || "Failed to publish");
        }
        setLoading(false);
        return;
      }
      setSuccess(editMode ? "Listing updated!" : "Listing published!");
      setTimeout(() => navigate("/MyListing?type=roommate"), 1200);
    } catch (err) {
      setError(err.message || "An error occurred");
      if (err.message && err.message.includes("404")) {
        alert("Roommate Flat not found or deleted.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-[81vh] bg-gray-100 flex justify-center items-center p-8">
        <form className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-5xl" onSubmit={handleSubmit}>
          <h1 className="text-2xl font-bold mb-6 text-center text-[rgb(77,95,171)]">List Your Roommate Flat</h1>
          <ImageUpload images={images} setImages={setImages} onlyCloudinary={success !== ""} />

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
                className={`w-full border rounded-lg p-2 ${form.rent && !isRentValid ? "border-red-500" : ""}`}
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
                className={`w-full border rounded-lg p-2 ${form.contact && !isContactValid ? "border-red-500" : ""}`}
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

            {/* BHK */}
            <div>
              <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
                <Bed className="w-5 h-5 text-[rgb(77,95,171)]" /> BHK
              </label>
              <div className="flex gap-2">
                {["1", "2", "3", "4", "5"].map((num) => (
                  <SelectButton key={num} label={num} selected={form.bhk === num} onClick={() => handleChange("bhk", num)} />
                ))}
              </div>
            </div>

            {/* Furnishing */}
            <div>
              <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
                <Home className="w-5 h-5 text-[rgb(77,95,171)]" /> Furnishing
              </label>
              <div className="flex gap-2">
                {["Furnished", "Semi-Furnished", "Unfurnished"].map((opt) => (
                  <SelectButton key={opt} label={opt} selected={form.furnishing === opt} onClick={() => handleChange("furnishing", opt)} />
                ))}
              </div>
            </div>

            {/* For Whom */}
            <div>
              <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
                <Users className="w-5 h-5 text-[rgb(77,95,171)]" /> For Whom
              </label>
              <div className="flex gap-2">
                {["Boys", "Girls", "Family"].map((opt) => (
                  <SelectButton key={opt} label={opt} selected={form.forWhom === opt} onClick={() => handleChange("forWhom", opt)} />
                ))}
              </div>
            </div>

            {/* Independent */}
            <div>
              <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
                <Bed className="w-5 h-5 text-[rgb(77,95,171)]" /> Type
              </label>
              <div className="flex gap-2">
                {["Independent", "Non-Independent"].map((opt) => (
                  <SelectButton key={opt} label={opt} selected={form.independent === opt} onClick={() => handleChange("independent", opt)} />
                ))}
              </div>
            </div>

            {/* Electricity */}
            <div>
              <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
                <Zap className="w-5 h-5 text-[rgb(77,95,171)]" /> Electricity Bill
              </label>
              <div className="flex gap-2">
                {["Included", "Not Included"].map((opt) => (
                  <SelectButton key={opt} label={opt} selected={form.electricitybill === opt} onClick={() => handleChange("electricitybill", opt)} />
                ))}
              </div>
            </div>

            {/* Water */}
            <div>
              <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
                <Droplet className="w-5 h-5 text-[rgb(77,95,171)]" /> Water Bill
              </label>
              <div className="flex gap-2">
                {["Included", "Not Included"].map((opt) => (
                  <SelectButton key={opt} label={opt} selected={form.waterbill === opt} onClick={() => handleChange("waterbill", opt)} />
                ))}
              </div>
            </div>

            {/* Food */}
            <div>
              <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
                <Beef className="w-5 h-5 text-[rgb(77,95,171)]" /> Food
              </label>
              <div className="flex gap-2">
                {["Veg", "Non-Veg"].map((opt) => (
                  <SelectButton key={opt} label={opt} selected={form.food === opt} onClick={() => handleChange("food", opt)} />
                ))}
              </div>
            </div>

            {/* Washrooms */}
            <div>
              <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
                <Bath className="w-5 h-5 text-[rgb(77,95,171)]" /> Washrooms
              </label>
              <div className="flex gap-2">
                {["1", "2", "3"].map((num) => (
                  <SelectButton key={num} label={num} selected={form.washrooms === num} onClick={() => handleChange("washrooms", num)} />
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mt-6">
            <label className="font-medium text-gray-700 mb-2 block">Description (Optional)</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Write something about your flat..."
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
              isFormValid && !loading ? "bg-[rgb(77,95,171)] hover:opacity-90" : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Publishing..." : "Publish"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ---------------- Roommate Flat Mobile Form (phone screen only) ----------------
const RoommateFlatFormMobile = () => {
  const location = typeof window !== 'undefined' && window.location && window.location.state ? window.location : {};
  let routerState = {};
  try {
    routerState = (typeof window !== 'undefined' && window.history && window.history.state && window.history.state.usr) ? window.history.state.usr : {};
  } catch (e) {}
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
          bhk: listing.bhk || "",
          furnishing: listing.furnishing || "",
          forWhom: listing.forWhom || "",
          independent: listing.independent || "",
          electricitybill: listing.electricitybill || "",
          waterbill: listing.waterbill || "",
          food: listing.food || "",
          washrooms: listing.washrooms || "",
          description: listing.description || "",
          mapLink: listing.mapLink || "",
        }
      : {
          rent: "",
          address: "",
          contact: "",
          bhk: "",
          furnishing: "",
          forWhom: "",
          independent: "",
          electricitybill: "",
          waterbill: "",
          food: "",
          washrooms: "",
          description: "",
          mapLink: "",
        }
  ));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isContactValid = /^[0-9]{10}$/.test(form.contact);
  const isRentValid = /^[1-9][0-9]*$/.test(String(form.rent));
  const isFormValid =
    isRentValid &&
    form.address &&
    isContactValid &&
    form.bhk &&
    form.furnishing &&
    form.forWhom &&
    form.independent &&
    form.electricitybill &&
    form.waterbill &&
    form.food &&
    form.washrooms;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
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
      if (editMode && listing && listing._id) {
        res = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/roommateflats/${listing._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...form, images: imageUrls }),
        });
      } else {
        res = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/roommateflats`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...form, images: imageUrls }),
        });
      }
      try {
        data = await res.json();
      } catch (parseErr) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `Request failed with status ${res.status}`);
      }
      if (!res.ok) throw new Error(data.message || "Failed to publish");
      setSuccess(editMode ? "Listing updated!" : "Listing published!");
      setTimeout(() => navigate("/MyListing?type=roommate"), 1200);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen  mt-20 bg-gray-100 p-4 md:hidden">
      <Navbar />
      <form className="bg-white p-6 rounded-2xl shadow-lg" onSubmit={handleSubmit}>
        <h1 className="text-xl font-bold mb-6 text-center text-[rgb(77,95,171)]">
          List Your Roommate Flat
        </h1>
        <ImageUpload images={images} setImages={setImages} onlyCloudinary={success !== ""} />

        {/* Rent */}
        <div className="mt-6">
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
        <div className="mt-4">
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
        <div className="mt-4">
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
        <div className="mt-4">
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

        {/* BHK */}
        <div className="mt-4">
          <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
            <Bed className="w-5 h-5 text-[rgb(77,95,171)]" /> BHK
          </label>
          <div className="flex gap-2 flex-wrap">
            {["1", "2", "3", "4", "5"].map((num) => (
              <SelectButton
                key={num}
                label={num}
                selected={form.bhk === num}
                onClick={() => handleChange("bhk", num)}
              />
            ))}
          </div>
        </div>

        {/* Furnishing */}
        <div className="mt-4">
          <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
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
        </div>

        {/* For Whom */}
        <div className="mt-4">
          <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
            <Users className="w-5 h-5 text-[rgb(77,95,171)]" /> For Whom
          </label>
          <div className="flex gap-2 flex-wrap">
            {["Boys", "Girls", "Family"].map((opt) => (
              <SelectButton
                key={opt}
                label={opt}
                selected={form.forWhom === opt}
                onClick={() => handleChange("forWhom", opt)}
              />
            ))}
          </div>
        </div>

        {/* Independent */}
        <div className="mt-4">
          <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
            <Bed className="w-5 h-5 text-[rgb(77,95,171)]" /> Type
          </label>
          <div className="flex gap-2 flex-wrap">
            {["Independent", "Non-Independent"].map((opt) => (
              <SelectButton
                key={opt}
                label={opt}
                selected={form.independent === opt}
                onClick={() => handleChange("independent", opt)}
              />
            ))}
          </div>
        </div>

        {/* Electricity */}
        <div className="mt-4">
          <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
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
        </div>

        {/* Water */}
        <div className="mt-4">
          <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
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
        </div>

        {/* Food */}
        <div className="mt-4">
          <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
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
        </div>

        {/* Washrooms */}
        <div className="mt-4">
          <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
            <Bath className="w-5 h-5 text-[rgb(77,95,171)]" /> Washrooms
          </label>
          <div className="flex gap-2 flex-wrap">
            {["1", "2", "3"].map((num) => (
              <SelectButton
                key={num}
                label={num}
                selected={form.washrooms === num}
                onClick={() => handleChange("washrooms", num)}
              />
            ))}
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
            placeholder="Write something about your flat..."
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
  );
};

// ----------- WRAPPER -------------
const RoommateFlat = () => {
  return (
    <>
      <div className="hidden md:block">
        <RoommateFlatForm />
      </div>
      <div className="block md:hidden">
        <RoommateFlatFormMobile />
      </div>
    </>
  );
};

const RoommateFlatFormWithFooter = () => (
  <>
    <RoommateFlat />
    <Footer />
  </>
);
export default RoommateFlatFormWithFooter;
