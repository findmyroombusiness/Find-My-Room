import React, { useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login'

const Home = React.lazy(() => import('./pages/Home'));
const Room = React.lazy(() => import('./pages/Room'));
const RoomDetail = React.lazy(() => import('./pages/RoomDetail'));
const Flat = React.lazy(() => import('./pages/Flat'));
import ScrollToTop from "./components/ScrollToTop";
const Hostel = React.lazy(() => import('./pages/Hostel'));
const HostelDetail = React.lazy(() => import('./pages/HostelDetail'));
const HostelList = React.lazy(() => import('./pages/HostelList'));
const Pg = React.lazy(() => import('./pages/PG'));
const RoommateRoom = React.lazy(() => import('./pages/RoommateRoom'));
const RoommateFlat = React.lazy(() => import('./pages/RoommateFlat'));
const Favourite = React.lazy(() => import('./pages/Favourite'));
const PgDetail = React.lazy(() => import('./pages/PgDetail'));
const PgList = React.lazy(() => import('./pages/PgList'));
const RoomList = React.lazy(() => import('./pages/RoomList'));
const RoommateList = React.lazy(() => import('./pages/RoommateList'));
const MyListing = React.lazy(() => import('./pages/MyListing'));
const FlatList = React.lazy(() => import('./pages/FlatList'));
const FlatDetail = React.lazy(() => import('./pages/FlatDetail'));
const ListProperty = React.lazy(() => import('./pages/ListProperty'));
const NeedRoommate = React.lazy(() => import('./pages/NeedRoommate'));
const RoommateRoomDetail = React.lazy(() => import('./pages/RoommateRoomDetail'));
const RoommateFlatDetail = React.lazy(() => import('./pages/RoommateFlatDetail'));
const Policy = React.lazy(() => import('./pages/Policy'));
const Terms = React.lazy(() => import('./pages/Terms'));
const Disclaimer = React.lazy(() => import('./pages/Disclaimer'));



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
