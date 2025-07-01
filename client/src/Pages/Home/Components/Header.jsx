import React, { useState } from 'react';
import './header.css';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../../../redux/userSlice.js'
import toast from 'react-hot-toast';

const Header = ({socket}) => {
  const user = useSelector((state) => state.user.user);
  const [menuVisible, setMenuVisible] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const getFullName = () => {
    if (!user || !user.firstname || !user.lastname) return "Unknown";
    const fname = user.firstname.charAt(0).toUpperCase() + user.firstname.slice(1).toLowerCase();
    const lname = user.lastname.charAt(0).toUpperCase() + user.lastname.slice(1).toLowerCase();
    return `${fname} ${lname}`;
  };

  const getInitials = () => {
    if (!user || !user.firstname || !user.lastname) return "??";
    return `${user.firstname[0].toUpperCase()}${user.lastname[0].toUpperCase()}`;
  };

  const handleLogout = () => {
    dispatch(setUser(null)); // or remove from localStorage if needed
    localStorage.removeItem("token")
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate('/login');
    socket.emit('user-logout' , user._id)
  };

  return (
    <div className="app-header">
      <div className="app-logo">
        <i className="fa fa-comments logo" aria-hidden="true"></i>
        iChat
      </div>

      <div className="app-user-profile" onMouseLeave={() => setMenuVisible(false)}>
        <div
          className="logged-user-profile-pic"
          onClick={() => setMenuVisible((prev) => !prev)}
        >
          {user.profilePic ? (
            <img src={user.profilePic} alt="Profile" className="profile-pic-img" />
          ) : (
            <span>{getInitials()}</span>
          )}
        </div>
        <div className="logged-user-name">{getFullName()}</div>

        {menuVisible && (
          <div className="dropdown-menu">
            <div onClick={() => navigate('/profile')} className="dropdown-item">
              <i className="fa fa-user"></i> Edit Profile
            </div>
            <div onClick={handleLogout} className="dropdown-item logout">
              <i className="fa fa-sign-out"></i> Logout
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
