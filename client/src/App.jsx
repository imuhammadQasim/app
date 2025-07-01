import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import Login from './Pages/login/Login.jsx';
import Signup from './Pages/signup/Signup.jsx';
import Home from './Pages/Home/Home.jsx';
import ProtectedRoutes from './components/ProtectedRoutes.jsx';
import ChatLoader from './components/ChatLoader.jsx';
import Profile from './Pages/profile/profile.jsx';
function App() {
  const loader = useSelector((state) => state.loader);

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />

      {!loader && <ChatLoader />}
      {/* {console.log("loader state:", loader)} */}
      <BrowserRouter>
        <div className="App">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoutes>
                  <Home />
                </ProtectedRoutes>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoutes>
                  <Profile />
                </ProtectedRoutes>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </BrowserRouter>
    </>
  );
}

export default App;
