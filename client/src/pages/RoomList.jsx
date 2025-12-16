import Footer from "../components/Footer";
import React, { useState, useEffect, useRef } from "react";
import { MapPin, ArrowUpDown, Heart, Bed, Users } from "lucide-react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";

const RoomList = () => {
  const [favourites, setFavourites] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dataReady, setDataReady] = useState(false);

  const fetchingRef = useRef(false);

  useEffect(() => {
    setLoading(true);
    setError("");
    let listingsLoaded = false;
    let favouritesLoaded = false;

    const checkReady = () => {
      if (listingsLoaded && favouritesLoaded) {
        setLoading(false);
        setDataReady(true);
      }
    };

    apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/rooms?page=1&limit=3`)
      .then(res => res.json())
      .then(data => {
        if (!data || data.error)
          throw new Error(data.message || "Failed to fetch rooms");

        setAllListings(data.listings || data);
        setHasMore((data.listings ? data.listings.length : data.length) >= 3);
        setPage(2);
        listingsLoaded = true;
        checkReady();
      })
      .catch(err => {
        setError(err.message || "Failed to fetch rooms");
        setLoading(false);
      });

    const token = localStorage.getItem('token');
    if (token) {
      apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/favourites`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.favourites) {
            setFavourites(data.favourites.map(f => f._id));
          }
          favouritesLoaded = true;
          checkReady();
        })
        .catch(() => {
          favouritesLoaded = true;
          checkReady();
        });
    } else {
      favouritesLoaded = true;
      checkReady();
    }
  }, []);

  useEffect(() => {
    if (!dataReady || !hasMore) return;

    const handleScroll = () => {
      if (
        fetchingRef.current ||
        loading ||
        window.innerHeight + window.scrollY <
          document.body.offsetHeight - 200
      )
        return;

      fetchingRef.current = true;
      setLoading(true);

      apiFetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/rooms?page=${page}&limit=3`
      )
        .then(res => res.json())
        .then(data => {
          const newListings = data.listings || data;

          setAllListings(prev => {
            const ids = new Set(prev.map(l => l._id));
            const unique = newListings.filter(l => !ids.has(l._id));
            return [...prev, ...unique];
          });

          setHasMore(newListings.length >= 3);
          setPage(prev => prev + 1);
        })
        .finally(() => {
          fetchingRef.current = false;
          setLoading(false);
        });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [dataReady, hasMore, page, loading]);

  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("high");
  const [sortActive, setSortActive] = useState(false);

  const toggleFavourite = async id => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const isFav = favourites.includes(id);
    setFavourites(prev =>
      isFav ? prev.filter(f => f !== id) : [...prev, id]
    );

    setAllListings(prev =>
      prev.map(item =>
        item._id === id ? { ...item, favourite: !isFav } : item
      )
    );

    try {
      await apiFetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/favourites/${
          isFav ? "remove" : "add"
        }`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ listingId: id }),
        }
      );

      const res = await apiFetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/favourites`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (res.ok && data.favourites) {
        setFavourites(data.favourites.map(f => f._id));
      }
    } catch {}
  };

  const handleSortToggle = () => {
    setSortActive(true);
    setSortType(prev => (prev === "high" ? "low" : "high"));
    setTimeout(() => setSortActive(false), 600);
  };

  const useCurrentLocation = () => alert("Using current location!");

  const sortedListings = dataReady
    ? allListings
        .filter(
          l =>
            l.address &&
            l.address.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) =>
          sortType === "high" ? b.rent - a.rent : a.rent - b.rent
        )
    : [];

  const formatDate = date => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-[81vh] bg-gray-100 p-4 md:px-8 pt-20 md:pt-10">
        {/* DESKTOP SEARCH / SORT / LOCATION */}
        <div className="hidden md:flex items-center gap-6 mb-6">
          <input
            type="text"
            placeholder="Search by area..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[rgb(77,95,171)]"
          />
          <button
            onClick={handleSortToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 transition text-[rgb(77,95,171)] hover:bg-[rgb(77,95,171)] hover:text-white ${
              sortActive
                ? "bg-[rgb(77,95,171)] text-white border-[rgb(77,95,171)]"
                : ""
            }`}
          >
            <ArrowUpDown
              className={`w-5 h-5 transition-transform duration-300 ${
                sortType === "high" ? "rotate-180" : ""
              }`}
            />
            Sort ({sortType === "high" ? "High to Low" : "Low to High"})
          </button>
          <button
            onClick={useCurrentLocation}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-[rgb(77,95,171)] hover:bg-[rgb(77,95,171)] hover:text-white transition"
          >
            <MapPin className="w-5 h-5" /> Nearby
          </button>
        </div>
        {/* MOBILE SEARCH / SORT / LOCATION */}
        <div className="flex md:hidden flex-col gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by area..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[rgb(77,95,171)]"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSortToggle}
              className={`flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg border border-gray-300 transition text-sm text-[rgb(77,95,171)] hover:bg-[rgb(77,95,171)] hover:text-white ${sortActive ? 'bg-[rgb(77,95,171)] text-white border-[rgb(77,95,171)]' : ''}`}
            >
              <ArrowUpDown className={`w-5 h-5 transition-transform duration-300 ${sortType === 'high' ? 'rotate-180' : ''}`} />
              Sort ({sortType === 'high' ? 'High to Low' : 'Low to High'})
            </button>
            <button
              onClick={useCurrentLocation}
              className="flex-1 flex items-center justify-center gap-2 px-2 py-2 rounded-lg border border-gray-300 text-[rgb(77,95,171)] hover:bg-[rgb(77,95,171)] hover:text-white transition text-sm"
            >
              <MapPin className="w-5 h-5" /> Nearby
            </button>
          </div>
        </div>

        {/* LISTINGS */}
        {loading && allListings.length === 0 ? (
          <p className="text-center text-gray-500 mt-[30vh]">
            Loading rooms...
          </p>
        ) : error ? (
          <p className="text-center text-red-500 mt-10">{error}</p>
        ) : !loading && dataReady && sortedListings.length === 0 ? (
          <p className="text-gray-500 text-center mt-[30vh]">
            No rooms found.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 md:mb-0">
            {sortedListings.map(listing => (
              <div key={listing._id} className="relative">
                <Link to={`/roomdetail/${listing._id}`}>
                  <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:scale-105 transition-transform cursor-pointer group">
                    <button
                      onClick={e => {
                        e.preventDefault();
                        toggleFavourite(listing._id);
                      }}
                      className="absolute top-3 right-3 z-10"
                    >
                      <Heart
                        className={`w-6 h-6 transition duration-300 group-hover:scale-125 ${
                          favourites.includes(listing._id)
                            ? "text-red-600 fill-red-600"
                            : "text-gray-400"
                        }`}
                      />
                    </button>

                    {listing.images && listing.images[0] ? (
                      <img
                        src={listing.images[0]}
                        alt="room"
                        className="w-full h-48 object-cover"
                        onError={e => {
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
                        {listing.rent} / month
                      </h2>
                      <p className="text-gray-600 mb-2">
                        {listing.address}
                      </p>
                      <div className="flex justify-between items-center mb-2 text-gray-700">
                        <span className="flex items-center gap-1">
                          <Bed className="w-4 h-4" /> {listing.beds}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" /> {listing.forWhom}
                        </span>
                      </div>
                      <p className="text-right text-sm text-gray-500">
                        {formatDate(listing.createdAt)}
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

const RoomListWithFooter = () => (
  <>
    <RoomList />
    <Footer />
  </>
);

export default RoomListWithFooter;
