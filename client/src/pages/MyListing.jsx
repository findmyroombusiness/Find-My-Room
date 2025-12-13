
import Footer from "../components/Footer";
import React, { useState, useEffect, useRef } from "react";
import {
  Bed,
  Users,
  ToggleLeft,
  ToggleRight,
  MoreVertical,
  Edit2,
  Trash2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";

const MyListing = () => {
  const navigate = useNavigate();
  const menuRefs = useRef({});
  const [allListings, setAllListings] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuOpen, setMenuOpen] = useState({});
  const [activeStates, setActiveStates] = useState({});
  const fetchLock = useRef(false);

  // Read ?type= from URL
  const query = new URLSearchParams(window.location.search);
  const initialType = query.get("type") || "flat";
  const [filterType, setFilterType] = useState(initialType);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const ids = Object.keys(menuRefs.current);
      let shouldClose = true;
      ids.forEach((id) => {
        if (menuRefs.current[id]?.contains(event.target)) {
          shouldClose = false;
        }
      });
      if (shouldClose) setMenuOpen({});
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch user's listings with pagination
  useEffect(() => {
    const fetchMyListings = async () => {
      if (fetchLock.current) return;
      fetchLock.current = true;
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        let url = "";
        if (filterType === "flat") {
          url = `https://find-my-room-backend.onrender.com/api/flats/my/listings?page=1&limit=3`;
        } else if (filterType === "hostel") {
          url = `https://find-my-room-backend.onrender.com/api/hostels/my/listings?page=1&limit=3`;
        } else if (filterType === "pg") {
          url = `https://find-my-room-backend.onrender.com/api/pgs/my/listings?page=1&limit=3`;
        } else if (filterType === "roommate") {
          const [roomsRes, flatsRes] = await Promise.all([
            fetch("https://find-my-room-backend.onrender.com/api/roommaterooms/my/listings?page=1&limit=3", {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch("https://find-my-room-backend.onrender.com/api/roommateflats/my/listings?page=1&limit=3", {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);
          const [roomsData, flatsData] = await Promise.all([
            roomsRes.json(),
            flatsRes.json(),
          ]);
          if (!roomsRes.ok) throw new Error(roomsData.message);
          if (!flatsRes.ok) throw new Error(flatsData.message);
          const merged = [
            ...roomsData.map((r) => ({ ...r, listingKind: "room" })),
            ...flatsData.map((f) => ({ ...f, listingKind: "flat" })),
          ];
          setAllListings(merged);
          setHasMore(merged.length >= 3);
          setPage(2);
          // Initialize toggles from listing.active (fallback true)
          const mergedActive = merged.reduce((acc, item) => {
            acc[item._id] = typeof item.active === "boolean" ? item.active : true;
            return acc;
          }, {});
          setActiveStates(mergedActive);
          setLoading(false);
          fetchLock.current = false;
          return;
        } else {
          url = `https://find-my-room-backend.onrender.com/api/rooms/my/listings?page=1&limit=3`;
        }

        const res = await apiFetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch listings");
        setAllListings(data.listings || data);
        setHasMore((data.listings ? data.listings.length : data.length) >= 3);
        setPage(2);
        // Initialize toggles from listing.active (fallback true)
        const activeMap = (data.listings || data || []).reduce((acc, item) => {
          acc[item._id] = typeof item.active === "boolean" ? item.active : true;
          return acc;
        }, {});
        setActiveStates(activeMap);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        fetchLock.current = false;
      }
    };
    fetchMyListings();
  }, [filterType]);
  // Infinite scroll: fetch next page from server when user scrolls near bottom
  useEffect(() => {
    if (!hasMore || loading) return;
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        hasMore && !loading && !fetchLock.current
      ) {
        fetchLock.current = true;
        setLoading(true);
        const token = localStorage.getItem("token");
        let url = "";
        if (filterType === "flat") {
          url = `https://find-my-room-backend.onrender.com/api/flats/my/listings?page=${page}&limit=3`;
        } else if (filterType === "hostel") {
          url = `https://find-my-room-backend.onrender.com/api/hostels/my/listings?page=${page}&limit=3`;
        } else if (filterType === "pg") {
          url = `https://find-my-room-backend.onrender.com/api/pgs/my/listings?page=${page}&limit=3`;
        } else if (filterType === "roommate") {
          Promise.all([
            fetch(`https://find-my-room-backend.onrender.com/api/roommaterooms/my/listings?page=${page}&limit=3`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`https://find-my-room-backend.onrender.com/api/roommateflats/my/listings?page=${page}&limit=3`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ])
            .then(async ([roomsRes, flatsRes]) => {
              const [roomsData, flatsData] = await Promise.all([
                roomsRes.json(),
                flatsRes.json(),
              ]);
              const merged = [
                ...roomsData.map((r) => ({ ...r, listingKind: "room" })),
                ...flatsData.map((f) => ({ ...f, listingKind: "flat" })),
              ];
              setAllListings((prev) => {
                const existingIds = new Set(prev.map((l) => l._id));
                const filtered = merged.filter((l) => !existingIds.has(l._id));
                return [...prev, ...filtered];
              });
              setHasMore(merged.length >= 3);
              setPage((prev) => prev + 1);
              setLoading(false);
              fetchLock.current = false;
            })
            .catch(() => {
              setLoading(false);
              fetchLock.current = false;
            });
          return;
        } else {
          url = `https://find-my-room-backend.onrender.com/api/rooms/my/listings?page=${page}&limit=3`;
        }
        apiFetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            const newListings = data.listings || data;
            setAllListings((prev) => {
              const existingIds = new Set(prev.map((l) => l._id));
              const filtered = newListings.filter((l) => !existingIds.has(l._id));
              return [...prev, ...filtered];
            });
            setHasMore((data.listings ? data.listings.length : data.length) >= 3);
            setPage((prev) => prev + 1);
            setLoading(false);
            fetchLock.current = false;
          })
          .catch(() => {
            setLoading(false);
            fetchLock.current = false;
          });
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, loading, page, filterType]);

  // Toggle visibility (active/inactive) for a listing
  const toggleActive = async (id) => {
    // Find listing type
    const listing = allListings.find((l) => l._id === id);
    if (!listing) return;
    let apiUrl = "";
    let type = filterType;
    if (type === "roommate") {
      type = listing.bhk ? "roommateflat" : "roommateroom";
    }
    if (type === "flat") apiUrl = `https://find-my-room-backend.onrender.com/api/flats/${id}/toggle`;
    else if (type === "hostel") apiUrl = `https://find-my-room-backend.onrender.com/api/hostels/${id}/toggle`;
    else if (type === "pg") apiUrl = `https://find-my-room-backend.onrender.com/api/pgs/${id}/toggle`;
    else if (type === "room") apiUrl = `https://find-my-room-backend.onrender.com/api/rooms/${id}/toggle`;
    else if (type === "roommateflat") apiUrl = `https://find-my-room-backend.onrender.com/api/roommateflats/${id}/toggle`;
    else if (type === "roommateroom") apiUrl = `https://find-my-room-backend.onrender.com/api/roommaterooms/${id}/toggle`;
    else return;
    try {
      const token = localStorage.getItem("token");
      const res = await apiFetch(apiUrl, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 404) {
        setError("Toggle endpoint not found on server (404). Please ensure backend routes are updated.");
        console.error("Toggle 404", apiUrl);
        return;
      }
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to toggle visibility");
      }
      const json = await res.json();
      // set state to server's value for consistency
      setActiveStates((prev) => ({ ...prev, [id]: json.active }));
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete a listing from everywhere (including database)
  const deleteListing = async (id) => {
    // Find listing type
    const listing = allListings.find((l) => l._id === id);
    if (!listing) return;
    let apiUrl = "";
    let type = filterType;
    if (type === "roommate") {
      type = listing.bhk ? "roommateflat" : "roommateroom";
    }
    if (type === "flat") apiUrl = `https://find-my-room-backend.onrender.com/api/flats/${id}`;
    else if (type === "hostel") apiUrl = `https://find-my-room-backend.onrender.com/api/hostels/${id}`;
    else if (type === "pg") apiUrl = `https://find-my-room-backend.onrender.com/api/pgs/${id}`;
    else if (type === "room") apiUrl = `https://find-my-room-backend.onrender.com/api/rooms/${id}`;
    else if (type === "roommateflat") apiUrl = `https://find-my-room-backend.onrender.com/api/roommateflats/${id}`;
    else if (type === "roommateroom") apiUrl = `https://find-my-room-backend.onrender.com/api/roommaterooms/${id}`;
    else return;
    try {
      const token = localStorage.getItem("token");
      const res = await apiFetch(apiUrl, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        // try to extract server error message
        let msg = "Failed to delete listing";
        try {
          const json = await res.json();
          msg = json.message || JSON.stringify(json);
        } catch (e) {
          try {
            const txt = await res.text();
            if (txt) msg = txt;
          } catch (_) {}
        }
        console.error("Delete failed", apiUrl, res.status, msg);
        throw new Error(msg);
      }
      // Remove from UI
      setAllListings((prev) => prev.filter((l) => l._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const editListing = (listing) => {
    // Determine route based on type and fields
    let route = "/";
    if (filterType === "room") {
      route = "/room";
    } else if (filterType === "flat") {
      route = "/flat";
    } else if (filterType === "hostel") {
      route = "/hostel";
    } else if (filterType === "pg") {
      route = "/pg";
    } else if (filterType === "roommate") {
      if (listing.bhk) {
        route = "/roommateflat";
      } else if (listing.rooms) {
        route = "/roommateroom";
      } else {
        route = "/roommateroom";
      }
    }
    // Pass listing data for editing (using state)
    navigate(route, { state: { editMode: true, listing } });
  };

  const toggleMenu = (id) => {
    setMenuOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const filteredListings =
    filterType === "roommate"
      ? allListings
      : filterType === "room"
      ? allListings.filter((l) => !l.type || l.type === "room")
      : allListings;

  return (
    <div>
      <Navbar />
      <div className="min-h-[81vh] bg-gray-100 p-4 md:px-8 pt-20 md:pt-10 ">
        {/* ---------------- Header + Filter Buttons ---------------- */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-6">
          <h1 className="text-2xl font-bold text-[rgb(77,95,171)] text-center mb-2 md:text-left">
            My Listings
          </h1>
          <div className="flex flex-wrap gap-2 justify-center md:justify-end">
            {["flat", "hostel", "room", "pg", "roommate"].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg border transition whitespace-nowrap ${
                  filterType === type
                    ? "bg-[rgb(77,95,171)] text-white border-[rgb(77,95,171)]"
                    : "text-[rgb(77,95,171)] border-gray-300"
                } text-sm md:text-base`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 mt-[30vh]">
            Loading your listings...
          </p>
        ) : error ? (
          <p className="text-center text-red-500 mt-10">{error}</p>
        ) : filteredListings.length === 0 ? (
          <p className="text-gray-500 text-center mt-[30vh]">No listings found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => {
                      
              // ...existing code...
              let detailRoute = "/";
              if (filterType === "roommate") {
                // Use listingKind to decide
                if (listing.listingKind === "flat") {
                  detailRoute = `/roommateflatdetail/${listing._id}`;
                } else if (listing.listingKind === "room") {
                  detailRoute = `/roommateroomdetail/${listing._id}`;
                } else {
                  // fallback if missing kind
                  detailRoute = `/roommateroomdetail/${listing._id}`;
                }
              } else if (filterType === "flat" || listing.type === "flat") {
                detailRoute = `/flatdetail/${listing._id}`;
              } else if (filterType === "hostel" || listing.type === "hostel") {
                detailRoute = `/hosteldetail/${listing._id}`;
              } else if (filterType === "pg" || listing.type === "pg") {
                detailRoute = `/PgDetail/${listing._id}`;
              } else if (filterType === "room" || listing.type === "room") {
                detailRoute = `/roomdetail/${listing._id}`;
              }
              // ...existing code...
              return (
                <div
                  key={listing._id}
                  className="relative group transform transition-transform hover:scale-105 cursor-pointer"
                  onClick={e => {
                    // Prevent click if menu or toggle is clicked
                    if (
                      e.target.closest("button") ||
                      e.target.closest(".listing-menu")
                    )
                      return;
                    navigate(detailRoute);
                  }}
                >
                  {/* ...existing card code... */}
                  <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                    {/* ...existing card content... */}
                    <div className="relative">
                      {listing.images && listing.images[0] ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.type}
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 flex items-center justify-center bg-gray-200 text-gray-500 text-lg">
                          No image provided
                        </div>
                      )}
                      {/* ...existing controls... */}
                      <div className="absolute top-2 right-2 flex gap-2 items-center">
                        {/* Toggle */}
                        <button
                          onClick={e => { e.stopPropagation(); toggleActive(listing._id); }}
                          className="bg-white rounded-full p-2 shadow-md hover:scale-110 active:scale-95 transition-transform"
                        >
                          {activeStates[listing._id] ? (
                            <ToggleRight className="w-6 h-6 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-gray-400" />
                          )}
                        </button>
                        {/* Menu */}
                        <div
                          className="relative listing-menu"
                          ref={(el) => (menuRefs.current[listing._id] = el)}
                        >
                          <button
                            onClick={e => { e.stopPropagation(); toggleMenu(listing._id); }}
                            className="bg-white rounded-full p-2 shadow-md hover:scale-110 active:scale-95 transition-transform"
                          >
                            <MoreVertical className="w-5 h-5 text-gray-700" />
                          </button>
                          {menuOpen[listing._id] && (
                            <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg ring-1 ring-black/5 z-50 p-2 animate-fadeIn">
                              <button
                                onClick={e => { e.stopPropagation(); editListing(listing); }}
                                className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
                              >
                                <Edit2 className="w-4 h-4" /> Edit
                              </button>
                              <button
                                onClick={e => { e.stopPropagation(); deleteListing(listing._id); }}
                                className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg hover:bg-red-100 text-red-600"
                              >
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* ...existing card content... */}
                    <div className="p-4">
                      <h2 className="text-xl font-bold text-[rgb(77,95,171)] mb-1">
                        ₹{listing.rent} / month
                      </h2>
                      <p className="text-gray-600 mb-2">{listing.address}</p>
                      <div className="flex justify-between items-center mb-2 text-gray-700">
                        {filterType === "flat" ? (
                          <span className="flex items-center gap-1">
                            <Bed className="w-4 h-4" /> {listing.bhk} BHK
                          </span>
                        ) : filterType === "hostel" ? (
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" /> {listing.seater} Seater
                          </span>
                        ) : filterType === "roommate" ? (
                          <span className="flex items-center gap-1">
                            <Bed className="w-4 h-4" />{' '}
                            {listing.listingKind === "flat" && listing.bhk
                              ? `${listing.bhk} BHK`
                              : listing.listingKind === "room" && listing.rooms
                              ? `${listing.rooms} Room${listing.rooms > 1 ? "s" : ""}`
                              : "-"}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Bed className="w-4 h-4" /> {listing.rooms} Room
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" /> {listing.forWhom}
                        </span>
                      </div>
                      <p className="text-right text-sm text-gray-500">
                        {formatDate(listing.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const MyListingWithFooter = () => (
  <>
    <MyListing />
    <Footer />
  </>
);
export default MyListingWithFooter;
