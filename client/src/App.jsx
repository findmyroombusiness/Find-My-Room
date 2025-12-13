import React, { useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login'
import Home from './pages/Home'
import Room from './pages/Room'
import RoomDetail from './pages/RoomDetail'
import Flat from './pages/Flat'
import ScrollToTop from "./components/ScrollToTop";
import Hostel from './pages/Hostel'
import HostelDetail from './pages/HostelDetail'
import HostelList from './pages/HostelList'
import Pg from './pages/PG'

import RoommateRoom from './pages/RoommateRoom'
import RoommateFlat from './pages/RoommateFlat'
import Favourite from './pages/Favourite'
import PgDetail from './pages/PgDetail'
import PgList from './pages/PgList'
import RoomList from './pages/RoomList'
import RoommateList from './pages/RoommateList'
import MyListing from './pages/MyListing'
import FlatList from './pages/FlatList'
import FlatDetail from './pages/FlatDetail'

import ListProperty from './pages/ListProperty'
import NeedRoommate from './pages/NeedRoommate'
import RoommateRoomDetail from './pages/RoommateRoomDetail'
import RoommateFlatDetail from './pages/RoommateFlatDetail'

import Policy from './pages/Policy';
import Terms from './pages/Terms';
import Disclaimer from './pages/Disclaimer';



const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    // If user is logged in and tries to access root, redirect to /home
    if (token && location.pathname === "/") {
      navigate("/home", { replace: true });
    }
  }, [location, navigate]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />

        {/* Protected routes */}
        <Route path="/Room" element={<ProtectedRoute><Room /></ProtectedRoute>} />
        <Route path="/roomdetail/:id" element={<ProtectedRoute><RoomDetail /></ProtectedRoute>} />
        <Route path="/RoomDetail" element={<ProtectedRoute><RoomDetail /></ProtectedRoute>} />
        <Route path="/Home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/Flat" element={<ProtectedRoute><Flat /></ProtectedRoute>} />
        <Route path="/flatdetail/:id" element={<ProtectedRoute><FlatDetail /></ProtectedRoute>} />
        <Route path="/Pg" element={<ProtectedRoute><Pg /></ProtectedRoute>} />
        <Route path="/Favourite" element={<ProtectedRoute><Favourite /></ProtectedRoute>} />
        <Route path="/MyListing" element={<ProtectedRoute><MyListing /></ProtectedRoute>} />
        <Route path="/RoommateRoom" element={<ProtectedRoute><RoommateRoom /></ProtectedRoute>} />
        <Route path="/RoommateFlat" element={<ProtectedRoute><RoommateFlat /></ProtectedRoute>} />
        <Route path="/roommateflat" element={<ProtectedRoute><RoommateFlat /></ProtectedRoute>} />
        {/* lowercase aliases used in some links */}
        <Route path="/roommateroom" element={<ProtectedRoute><RoommateRoom /></ProtectedRoute>} />
        <Route path="/PgDetail/:id" element={<ProtectedRoute><PgDetail /></ProtectedRoute>} />
        <Route path="/PgDetail" element={<ProtectedRoute><PgDetail /></ProtectedRoute>} />
        <Route path="/PgList" element={<ProtectedRoute><PgList /></ProtectedRoute>} />
        <Route path="/RoomList" element={<ProtectedRoute><RoomList /></ProtectedRoute>} />
        <Route path="/RoommateList" element={<ProtectedRoute><RoommateList /></ProtectedRoute>} />
        <Route path="/RoommateRoomDetail/:id" element={<ProtectedRoute><RoommateRoomDetail /></ProtectedRoute>} />
        <Route path="/roommatelist" element={<ProtectedRoute><RoommateList /></ProtectedRoute>} />
        <Route path="/roommateroomdetail/:id" element={<ProtectedRoute><RoommateRoomDetail /></ProtectedRoute>} />
        <Route path="/roommateflatdetail/:id" element={<ProtectedRoute><RoommateFlatDetail /></ProtectedRoute>} />
        <Route path="/RoommateFlatDetail/:id" element={<ProtectedRoute><RoommateFlatDetail /></ProtectedRoute>} />
        <Route path="/FlatList" element={<ProtectedRoute><FlatList /></ProtectedRoute>} />

        <Route path="/Hostel" element={<ProtectedRoute><Hostel /></ProtectedRoute>} />
        <Route path="/HostelDetail/:id" element={<ProtectedRoute><HostelDetail /></ProtectedRoute>} />
        <Route path="/HostelDetail" element={<ProtectedRoute><HostelDetail /></ProtectedRoute>} />
        <Route path="/HostelList" element={<ProtectedRoute><HostelList /></ProtectedRoute>} />
        <Route path="/NeedRoommate" element={<ProtectedRoute><NeedRoommate /></ProtectedRoute>} />
        <Route path="/ListProperty" element={<ProtectedRoute><ListProperty /></ProtectedRoute>} />
        <Route path="/policy" element={<ProtectedRoute><Policy /></ProtectedRoute>} />
        <Route path="/terms" element={<ProtectedRoute><Terms /></ProtectedRoute>} />
        <Route path="/disclaimer" element={<ProtectedRoute><Disclaimer /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App
