import Footer from "../components/Footer";
import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { Heart, Bed, Users } from "lucide-react";
import Navbar from "../components/Navbar";
import { apiFetch } from "../utils/apiFetch";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://find-my-room-backend.onrender.com";

const Favourite = () => {
  const [allListings, setAllListings] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [favourites, setFavourites] = useState([]);
  const [dataReady, setDataReady] = useState(false);
  const [removing, setRemoving] = useState({});

  const removeTimeouts = useRef({});
  const fetchLock = useRef(false);
  const location = useLocation();

  // Fetch favourites with pagination
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      setDataReady(true);
      return;
    }

    setLoading(true);
    apiFetch(`${BACKEND_URL}/api/favourites?page=1&limit=6`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.favourites) {
          setAllListings(data.favourites.map((item) => ({ ...item, favourite: true })));
          setFavourites(data.favourites.map((item) => item._id));
          setHasMore(data.favourites.length >= 6);
          setPage(2);
        }
      })
      .catch(() => setError("Failed to fetch favourites"))
      .finally(() => {
        setLoading(false);
        setDataReady(true);
      });
  }, [location]);

  // Toggle favourite logic
  const toggleFavourite = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const isFav = favourites.includes(id);

    // ✅ If user re-favourites before removal timeout finishes — cancel timeout
    if (!isFav && removeTimeouts.current[id]) {
      clearTimeout(removeTimeouts.current[id]);
      delete removeTimeouts.current[id];
      setRemoving((prev) => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    }

    // Frontend toggle
    setFavourites((prev) =>
      isFav ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
    setAllListings((prev) =>
      prev.map((item) =>
        (item._id || item.id) === id
          ? { ...item, favourite: !isFav }
          : item
      )
    );

    try {
      await apiFetch(`${BACKEND_URL}/api/favourites/${isFav ? "remove" : "add"}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listingId: id }),
      });

      // ⏳ Delay actual removal (only if unfavouriting)
      if (isFav) {
        setRemoving((prev) => ({ ...prev, [id]: true }));

        removeTimeouts.current[id] = setTimeout(() => {
          // Check again if the item was re-favourited before timeout finished
          setFavourites((prevFavs) => {
            if (prevFavs.includes(id)) {
              // ✅ User re-favourited, cancel removal
              setRemoving((prev) => {
                const copy = { ...prev };
                delete copy[id];
                return copy;
              });
              delete removeTimeouts.current[id];
              return prevFavs;
            }

            // 🚫 Still unfavourited → remove from UI
            setAllListings((prev) =>
              prev.filter((item) => (item._id || item.id) !== id)
            );
            setRemoving((prev) => {
              const copy = { ...prev };
              delete copy[id];
              return copy;
            });
            delete removeTimeouts.current[id];
            return prevFavs;
          });
        }, 1000);
      }
    } catch (err) {
      console.error("Toggle favourite error:", err);
    }
  };

  // Infinite scroll: fetch next page from server when user scrolls near bottom
  // Infinite scroll removed: do not load more on scroll

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  return (
    <div>
      <Navbar />
      <div className="min-h-[81vh] bg-gray-100 p-4 md:px-8 pt-20 md:pt-10 md:pb-10">
        <h1 className="text-2xl font-bold text-[rgb(77,95,171)] mb-6 text-center">
          My Favourites
        </h1>

        {loading ? (
          <div className="text-center text-gray-500 mt-[30vh]">
            Loading listings...
          </div>
        ) : error ? (
          <div className="text-center mt-12 text-red-500">{error}</div>
        ) : allListings.length === 0 ? (
          <p className="text-gray-500 text-center mt-[30vh]">
            You have no favourite listings.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {allListings.map((listing) => (
              <div
                key={listing._id}
                className="relative group transform transition-transform hover:scale-105 cursor-pointer"
              >
                {/* Heart Button */}
                <button
                  onClick={() => toggleFavourite(listing._id)}
                  className="absolute top-3 right-3 z-10 transition-transform group-hover:scale-110"
                  disabled={removing[listing._id]} // disable during removal delay
                >
                  <Heart
                    className={`w-6 h-6 transition duration-300 group-hover:scale-125 ${
                      favourites.includes(listing._id)
                        ? "text-red-600 fill-red-600"
                        : "text-gray-400"
                    }`}
                  />
                </button>

                {/* Card */}
                <Link
                  to={
                    listing.type === "pg"
                      ? `/PgDetail/${listing._id}`
                      : listing.type === "hostel"
                      ? `/hosteldetail/${listing._id}`
                      : listing.type === "flat"
                      ? `/flatdetail/${listing._id}`
                      : listing.type === "room"
                      ? `/roomdetail/${listing._id}`
                      : listing.type === "roommateflat"
                      ? `/roommateflatdetail/${listing._id}`
                      : listing.type === "roommateroom"
                      ? `/roommateroomdetail/${listing._id}`
                      : `/roomdetail/${listing._id}`
                  }
                >
                  <div className="bg-white rounded-2xl shadow-md overflow-hidden transition-transform group-hover:scale-105">
                    {(listing.image && listing.image.startsWith("http")) ||
                    (listing.images &&
                      listing.images[0] &&
                      listing.images[0].startsWith("http")) ? (
                      <img
                        src={
                          listing.image && listing.image.startsWith("http")
                            ? listing.image
                            : listing.images[0]
                        }
                        alt={listing.type || "room"}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/vite.svg";
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 flex items-center justify-center bg-gray-200 text-gray-500 text-lg">
                        No image provided
                      </div>
                    )}
                    <div className="p-4">
                      <h2 className="text-xl font-bold text-[rgb(77,95,171)] mb-1">
                        ₹{listing.rent} / month
                      </h2>
                      <p className="text-gray-600 mb-2">{listing.address}</p>
                      <div className="flex justify-between items-center mb-2 text-gray-700">
                        <span className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />{" "}
                          {listing.rooms || listing.bhk || listing.seater}{" "}
                          {listing.type === "flat"
                            ? "BHK"
                            : listing.type === "hostel"
                            ? "Seater"
                            : "room"}
                          {(listing.rooms > 1 ||
                            listing.bhk > 1 ||
                            listing.seater > 1) &&
                            "s"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" /> {listing.forWhom}
                        </span>
                      </div>
                      <p className="text-right text-sm text-gray-500">
                        {formatDate(listing.date || listing.createdAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
           
          </div>
        )}
      </div>
    </div>
  );
};

const FavouriteWithFooter = () => (
  <>
    <Favourite />
    <Footer />
  </>
);

export default FavouriteWithFooter;
