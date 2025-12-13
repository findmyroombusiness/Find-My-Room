import Footer from "../components/Footer";
import React, { useState, useEffect } from "react";
import { apiFetch } from "../utils/apiFetch";
import { MapPin, ArrowUpDown, Heart, Bed, Users } from "lucide-react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom"; // ✅ Import Link

const LiveWithRoommate = () => {
  const [favourites, setFavourites] = useState([]);
  const [listingType, setListingType] = useState("room"); // "room" or "flat"

  const [allListings, setAllListings] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dataReady, setDataReady] = useState(false); // Only show listings when both are loaded

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

    // Fetch first page of roommate rooms and flats
    Promise.all([
      apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/roommaterooms?page=1&limit=3`),
      apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/roommateflats?page=1&limit=3`)
    ])
      .then(async ([roomsRes, flatsRes]) => {
        const [roomsData, flatsData] = await Promise.all([
          roomsRes.json(),
          flatsRes.json(),
        ]);
        if (!roomsRes.ok) throw new Error(roomsData.message || "Failed to fetch roommate rooms");
        if (!flatsRes.ok) throw new Error(flatsData.message || "Failed to fetch roommate flats");
        const roomListings = roomsData.listings || roomsData;
        const flatListings = flatsData.listings || flatsData;
        const merged = [
          ...roomListings.map((l) => ({
            ...l,
            listingKind: "room",
            image: Array.isArray(l.images) && l.images.length > 0 ? l.images[0] : null,
            date: l.createdAt,
          })),
          ...flatListings.map((l) => ({
            ...l,
            listingKind: "flat",
            image: Array.isArray(l.images) && l.images.length > 0 ? l.images[0] : null,
            date: l.createdAt,
          })),
        ];
        setAllListings(merged);
        setHasMore(merged.length >= 3);
        setPage(2);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });

    // Favourites
    const token = localStorage.getItem('token');
    if (token) {
      apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/favourites`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.favourites) {
            setFavourites(data.favourites.map(f => f._id));
            favouritesLoaded = true;
            checkReady();
          }
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

  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("high");
  const [sortActive, setSortActive] = useState(false);
  const [nearbyActive, setNearbyActive] = useState(false);

  // Infinite scroll: fetch next page from server when user scrolls near bottom
  useEffect(() => {
    if (!dataReady || loading || !hasMore) return;
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        hasMore && !loading
      ) {
        setLoading(true);
        Promise.all([
          apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/roommaterooms?page=${page}&limit=3`),
          apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/roommateflats?page=${page}&limit=3`)
        ])
          .then(async ([roomsRes, flatsRes]) => {
            const [roomsData, flatsData] = await Promise.all([
              roomsRes.json(),
              flatsRes.json(),
            ]);
            const roomListings = roomsData.listings || roomsData;
            const flatListings = flatsData.listings || flatsData;
            const merged = [
              ...roomListings.map((l) => ({
                ...l,
                listingKind: "room",
                image: Array.isArray(l.images) && l.images.length > 0 ? l.images[0] : null,
                date: l.createdAt,
              })),
              ...flatListings.map((l) => ({
                ...l,
                listingKind: "flat",
                image: Array.isArray(l.images) && l.images.length > 0 ? l.images[0] : null,
                date: l.createdAt,
              })),
            ];
            setAllListings(prev => [...prev, ...merged]);
            setHasMore(merged.length >= 3);
            setPage(prev => prev + 1);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dataReady, loading, hasMore, page]);

  const toggleFavourite = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const isFav = favourites.includes(id);
    setFavourites((prev) =>
      isFav ? prev.filter(favId => favId !== id) : [...prev, id]
    );
    setAllListings((prev) =>
      prev.map(item =>
        (item._id || item.id) === id ? { ...item, favourite: !isFav } : item
      )
    );
    try {
      await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/favourites/${isFav ? 'remove' : 'add'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ listingId: id }),
      });
      // Refresh favourites from backend to sync with favourite section
      const res = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/favourites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.favourites) {
        setFavourites(data.favourites.map(f => f._id));
      }
    } catch {}
  };

  const handleSort = (type) => setSortType(type);
  const handleSortToggle = () => {
    setSortActive(true);
    setSortType((prev) => (prev === 'high' ? 'low' : 'high'));
    setTimeout(() => setSortActive(false), 600);
  };
  const useCurrentLocation = () => {
    setNearbyActive(true);
    setTimeout(() => setNearbyActive(false), 600);
    alert("Using current location!");
  };

  // Only show all loaded listings, sorted and filtered
  const filteredListings = dataReady
    ? allListings
        .filter((l) => (listingType === "room" ? l.listingKind === "room" : l.listingKind === "flat"))
        .filter((l) => l.address && l.address.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => (sortType === "high" ? b.rent - a.rent : a.rent - b.rent))
    : [];
  // Lazy load more listings on scroll
  // (No need for extra scroll effect, handled above)

  const formatDate = (date) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  };

  return (
    <div>
      <Navbar />

      <div className="min-h-[81vh] bg-gray-100 p-4 md:px-8 pt-20 md:pt-10">
        {/* ---------------- SEARCH AREA ---------------- */}
        {/* Desktop search/sort/toggle/location */}
        <div className="hidden md:flex items-center gap-6 mb-6">
          <input
            type="text"
            placeholder="Search by area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[rgb(77,95,171)]"
          />
          {/* Room / Flat toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setListingType('room')}
              className={`px-4 py-2 rounded-lg border ${listingType === 'room' ? 'bg-[rgb(77,95,171)] text-white border-[rgb(77,95,171)]' : 'text-[rgb(77,95,171)] border-gray-300'} transition`}
            >
              Rooms
            </button>
            <button
              onClick={() => setListingType('flat')}
              className={`px-4 py-2 rounded-lg border ${listingType === 'flat' ? 'bg-[rgb(77,95,171)] text-white border-[rgb(77,95,171)]' : 'text-[rgb(77,95,171)] border-gray-300'} transition`}
            >
              Flats
            </button>
          </div>
          <button
            onClick={() => handleSort(sortType === 'high' ? 'low' : 'high')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-[rgb(77,95,171)] hover:bg-[rgb(77,95,171)] hover:text-white transition"
          >
            <ArrowUpDown className={`w-5 h-5 transition-transform duration-300 ${sortType === 'high' ? 'rotate-180' : ''}`} />
            Sort ({sortType === 'high' ? 'High to Low' : 'Low to High'})
          </button>
          <button
            onClick={useCurrentLocation}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-[rgb(77,95,171)] hover:bg-[rgb(77,95,171)] hover:text-white transition"
          >
            <MapPin className="w-5 h-5" /> Nearby
          </button>
        </div>

        {/* Mobile search/sort/toggle/location */}
        <div className="flex md:hidden flex-col gap-3 mb-6">
          <input
            type="text"
            placeholder="Search by area..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[rgb(77,95,171)]"
          />
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setListingType('room')}
              className={`w-full py-3 rounded-lg border ${listingType === 'room' ? 'bg-[rgb(77,95,171)] text-white border-[rgb(77,95,171)]' : 'text-[rgb(77,95,171)] border-gray-300'} transition text-base font-semibold`}
            >
              Rooms
            </button>
            <button
              onClick={() => setListingType('flat')}
              className={`w-full py-3 rounded-lg border ${listingType === 'flat' ? 'bg-[rgb(77,95,171)] text-white border-[rgb(77,95,171)]' : 'text-[rgb(77,95,171)] border-gray-300'} transition text-base font-semibold`}
            >
              Flats
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={handleSortToggle}
              className={`w-full py-3 rounded-lg border transition text-base font-semibold flex items-center justify-center gap-2
                ${sortActive
                  ? 'bg-[rgb(77,95,171)] text-white border-[rgb(77,95,171)]'
                  : 'text-[rgb(77,95,171)] border-gray-300'}
              `}
            >
              <ArrowUpDown className={`w-5 h-5 transition-transform duration-300 ${sortType === 'high' ? 'rotate-180' : ''}`} />
              Sort: {sortType === 'high' ? 'High to Low' : 'Low to High'}
            </button>
            <button
              onClick={useCurrentLocation}
              className={`w-full py-3 rounded-lg border transition text-base font-semibold flex items-center justify-center gap-2
                ${nearbyActive
                  ? 'bg-[rgb(77,95,171)] text-white border-[rgb(77,95,171)]'
                  : 'text-[rgb(77,95,171)] border-gray-300'}
              `}
            >
              <MapPin className="w-5 h-5" /> Nearby
            </button>
          </div>
        </div>

        {/* ---------------- LISTINGS ---------------- */}
        {loading ? (
          <div className="text-center text-gray-500 mt-[30vh]">Loading listings...</div>
        ) : error ? (
          <div className="text-center mt-12 text-red-500">{error}</div>
        ) : (
          filteredListings.length === 0 ? (
            <p className="text-gray-500 text-center mt-[30vh]">No listings found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6  md:mb-10">
              {filteredListings.map((listing) => (
                <div key={listing._id || listing.id} className="relative">
                  <Link to={
                    listing.listingKind === "flat"
                      ? `/roommateflatdetail/${listing._id || listing.id}`
                      : `/roommateroomdetail/${listing._id || listing.id}`
                  }>
                    <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:scale-105 transition-transform cursor-pointer group">
                      {/* Heart Icon - now inside card and scales with card */}
                      <button
                        onClick={e => { e.preventDefault(); toggleFavourite(listing._id || listing.id); }}
                        className="absolute top-3 right-3 z-10"
                      >
                        <Heart
                          className={`w-6 h-6 transition duration-300 group-hover:scale-125 ${
                            favourites.includes(listing._id || listing.id)
                              ? "text-red-600 fill-red-600"
                              : "text-gray-400"
                          }`}
                        />
                      </button>
                      {listing.image ? (
                        <img
                          src={listing.image}
                          alt={listingType}
                          className="w-full h-48 object-cover"
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
                        <p className="text-gray-600 mb-2">{listing.address}</p>
                        <div className="flex justify-between items-center mb-2 text-gray-700">
                          <span className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />{' '}
                            {listing.listingKind === "room"
                              ? `${listing.rooms} room${listing.rooms > 1 ? "s" : ""}`
                              : `${listing.bhk} BHK`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" /> {listing.forWhom}
                          </span>
                        </div>
                        <p className="text-right text-sm text-gray-500">
                          {formatDate(listing.date)}
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

const LiveWithRoommateWithFooter = () => (
  <>
    <LiveWithRoommate />
    <Footer />
  </>
);
export default LiveWithRoommateWithFooter;
