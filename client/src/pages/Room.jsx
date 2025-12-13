import Footer from "../components/Footer";
import React, { useState } from "react";
import { apiFetch } from "../utils/apiFetch";

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
  Phone, // Added Phone icon
} from "lucide-react";
import Navbar from "../components/Navbar";

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
const ImageUpload = ({ images, setImages, onlyCloudinary }) => {
  // Clean up object URLs when images are removed (memory leak fix)
  React.useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.file && img.preview && img.preview.startsWith('blob:')) {
          URL.revokeObjectURL(img.preview);
        }
      });
    };
  }, [images]);

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

  // Show all images (blob: and Cloudinary) before publish, only Cloudinary after publish
  const displayImages = onlyCloudinary
    ? images.filter((img) => img.preview && img.preview.startsWith("https://res.cloudinary.com"))
    : images.filter((img) => img.preview);

  // Fallback image for error
  const fallbackImg = "/vite.svg";

  // Use a ref to trigger file input on label click (for mobile reliability)
  const inputRef = React.useRef();
  const [forceRender, setForceRender] = React.useState(0);

  // Force re-render when images change (fixes some mobile preview issues)
  React.useEffect(() => { setForceRender(f => f + 1); }, [images]);

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
        style={{ display: 'block', width: 1, height: 1, opacity: 0, position: 'absolute', left: -9999 }}
        id="imageUpload"
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
            <div key={i + '-' + forceRender} className="relative group">
              <img
                src={src}
                alt="preview"
                className="w-full h-24 object-cover rounded-lg"
                onError={e => { e.target.onerror = null; e.target.src = fallbackImg; }}
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
import { useNavigate } from "react-router-dom";

// Cloudinary upload helper (shared by both forms)
async function uploadToCloudinary(file) {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "ml_default"); // your unsigned preset
  // Use the provided cloud name
  const res = await fetch("https://api.cloudinary.com/v1_1/dlr7ht0vz/image/upload", {
    method: "POST",
    body: data,
  });
  // If Cloudinary returns a non-2xx status, surface the body as an error message
  if (!res.ok) {
    const text = await res.text().catch(() => "Cloudinary upload failed");
    throw new Error(text || `Cloudinary upload failed with status ${res.status}`);
  }
  const json = await res.json();
  if (!json || !json.secure_url) throw new Error("Cloudinary did not return secure_url");
  return json.secure_url;
}

const RoomFormPC = () => {
  const navigate = useNavigate();
  const location = window.location && window.location.state ? window.location : {};
  // Try to get state from React Router
  let routerState = {};
  try {
    // If using useLocation from react-router-dom, prefer that
    // But fallback to window.location.state for direct navigation
    // eslint-disable-next-line
    routerState = (typeof useNavigate === 'function' && typeof window !== 'undefined' && window.history && window.history.state && window.history.state.usr) ? window.history.state.usr : {};
  } catch {}
  // If using useLocation, you can do: const { state } = useLocation();
  const state = (location && location.state) || routerState || {};
  const editMode = state.editMode || false;
  const listing = state.listing || null;

  // Pre-fill form if editMode
  const [form, setForm] = useState(
    editMode && listing
      ? {
          rent: listing.rent || "",
          address: listing.address || "",
          contact: listing.contact || "",
          rooms: listing.rooms !== undefined && listing.rooms !== null ? String(listing.rooms) : "",
          furnishing: listing.furnishing || "",
          forWhom: listing.forWhom || "",
          independent: listing.independent || "",
          cooking: listing.cooking || "",
          electricitybill: listing.electricitybill || "",
          waterbill: listing.waterbill || "",
          food: listing.food || "",
          washroom: listing.washroom || "",
          kitchen: listing.kitchen || "",
          description: listing.description || "",
          mapLink: listing.mapLink || "",
        }
      : {
          rent: "",
          address: "",
          contact: "",
          rooms: "",
          furnishing: "",
          forWhom: "",
          independent: "",
          cooking: "",
          electricitybill: "",
          waterbill: "",
          food: "",
          washroom: "",
          kitchen: "",
          description: "",
          mapLink: "",
        }
  );
  // Pre-fill images if editMode
    const [images, setImages] = useState(
      editMode && listing && listing.images
        ? listing.images.map((url) => ({ file: null, preview: url }))
        : []
    );

    // When editing, update form/images state if listing changes (after PUT)
    React.useEffect(() => {
      if (editMode && listing) {
        setForm({
          rent: listing.rent || "",
          address: listing.address || "",
          contact: listing.contact || "",
          rooms: listing.rooms !== undefined && listing.rooms !== null ? String(listing.rooms) : "",
          furnishing: listing.furnishing || "",
          forWhom: listing.forWhom || "",
          independent: listing.independent || "",
          cooking: listing.cooking || "",
          electricitybill: listing.electricitybill || "",
          waterbill: listing.waterbill || "",
          food: listing.food || "",
          washroom: listing.washroom || "",
          kitchen: listing.kitchen || "",
          description: listing.description || "",
          mapLink: listing.mapLink || "",
        });
        setImages(listing.images ? listing.images.map((url) => ({ file: null, preview: url })) : []);
      }
    }, [editMode, listing]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Validation helpers
  const isContactValid = /^[0-9]{10}$/.test(form.contact);
  const isRentValid = /^[1-9][0-9]*$/.test(form.rent);
  const isFormValid =
    isRentValid &&
    form.address &&
    isContactValid &&
    form.rooms &&
    form.furnishing &&
    form.forWhom &&
    form.independent &&
    form.cooking &&
    form.electricitybill &&
    form.waterbill &&
    form.food &&
    form.washroom &&
    form.kitchen;

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Upload all images to Cloudinary and get their URLs
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
      if (process.env.NODE_ENV === "development") {
        console.log("Debug: Cloudinary image URLs:", imageUrls);
      }
      const token = localStorage.getItem("token");
      let res, data;
      if (editMode && listing && listing._id) {
        // Edit mode: update listing
        res = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/rooms/${listing._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...form, images: imageUrls }),
        });
      } else {
        // Create mode: new listing
        res = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/rooms`, {
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
      setTimeout(() => navigate("/MyListing?type=room"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-100 flex justify-center items-center p-8">
        <form className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-5xl" onSubmit={handleSubmit}>
          <h1 className="text-2xl font-bold mb-6 text-center text-[rgb(77,95,171)]">
            List Your Room
          </h1>
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

          {/* Contact Number - NEW */}
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
              className={`w-full border rounded-lg p-2 ${form.contact && !isContactValid ? 'border-red-500' : ''}`}
            />
            {form.contact && !isContactValid && (
              <p className="text-red-500 text-xs mt-1">Contact must be exactly 10 digits.</p>
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
          </div>

          {/* For Whom */}
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
              <Users className="w-5 h-5 text-[rgb(77,95,171)]" /> For Whom
            </label>
            <div className="flex gap-2">
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
          <div>
            <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
              <Bed className="w-5 h-5 text-[rgb(77,95,171)]" /> Type
            </label>
            <div className="flex gap-2">
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
            placeholder="Write something about your room..."
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
const RoomFormMobile = () => {
  // Try to read edit state (same approach as PC form) so mobile pre-fills when editing
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
          rooms: listing.rooms || "",
          furnishing: listing.furnishing || "",
          forWhom: listing.forWhom || "",
          independent: listing.independent || "",
          cooking: listing.cooking || "",
          electricitybill: listing.electricitybill || "",
          waterbill: listing.waterbill || "",
          food: listing.food || "",
          washroom: listing.washroom || "",
          kitchen: listing.kitchen || "",
          description: listing.description || "",
          mapLink: listing.mapLink || "",
        }
      : {
          rent: "",
          address: "",
          contact: "",
          rooms: "",
          furnishing: "",
          forWhom: "",
          independent: "",
          cooking: "",
          electricitybill: "",
          waterbill: "",
          food: "",
          washroom: "",
          kitchen: "",
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

  // Validation helpers
  const isContactValid = /^[0-9]{10}$/.test(form.contact);
  const isRentValid = /^[1-9][0-9]*$/.test(form.rent);
  const isFormValid =
    isRentValid &&
    form.address &&
    isContactValid &&
    form.rooms &&
    form.furnishing &&
    form.forWhom &&
    form.independent &&
    form.cooking &&
    form.electricitybill &&
    form.waterbill &&
    form.food &&
    form.washroom &&
    form.kitchen;

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Upload all images to Cloudinary and get their URLs
      const imageUrls = [];
      for (const img of images) {
        const url = await uploadToCloudinary(img.file);
        imageUrls.push(url);
      }
      // Update preview to use Cloudinary URLs only
      setImages(imageUrls.map((url) => ({ file: null, preview: url })));
      // Debug: log imageUrls
      if (process.env.NODE_ENV === "development") {
        console.log("Debug: Cloudinary image URLs:", imageUrls);
      }
      const token = localStorage.getItem("token");
      const res = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...form, images: imageUrls }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to publish");
      setSuccess("Listing published!");
      setTimeout(() => navigate("/MyListing?type=room"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[81vh]  mt-20 bg-gray-100 p-4 md:hidden">
      <Navbar />
      <form className="bg-white p-6 rounded-2xl shadow-lg" onSubmit={handleSubmit}>
        <h1 className="text-xl font-bold mb-6 text-center text-[rgb(77,95,171)]">
          List Your Room
        </h1>
  <ImageUpload images={images} setImages={setImages} onlyCloudinary={success === "Listing published!"} />

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
            <Phone className="w-5 h-5 text-[rgb(77,95,171)]" /> Contact Number
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

        {/* Rooms */}
        <div className="mt-4">
          <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
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

        {/* Cooking */}
        <div className="mt-4">
          <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
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

        {/* Washroom */}
        <div className="mt-4">
          <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
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
        </div>

        {/* Kitchen */}
        <div className="mt-4">
          <label className="flex items-center gap-2 font-medium text-gray-700 mb-2">
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
        </div>

        {/* Description */}
        <div className="mt-6">
          <label className="font-medium text-gray-700 mb-2 block">
            Description (Optional)
          </label>
          <textarea
            value={form.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Write something about your room..."
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
const Room = () => {
  return (
    <>
      <div className="hidden md:block">
        <RoomFormPC />
      </div>
      <div className="block md:hidden">
        <RoomFormMobile />
      </div>
    </>
  );
};

const RoomWithFooter = () => (
  <>
    <Room />
    <Footer />
  </>
);
export default RoomWithFooter;
