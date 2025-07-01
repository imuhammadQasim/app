import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getLoggedUser, getAllUser } from '../apiCalls/user';
import { useDispatch, useSelector } from 'react-redux';
import { showLoader, hideLoader } from '../redux/loaderSlice';
import { setUser, setAllUsers , setAllChat } from '../redux/userSlice';
import { getAllChats } from '../apiCalls/chat';

const ProtectedRoutes = ({ children }) => {
  const user = useSelector((state) => state.user.user); // ✅ Access actual user object
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const fetchUserData = async () => {
    try {
      dispatch(showLoader());
      const response = await getLoggedUser();
      if (response.success) {
        dispatch(setUser(response.data));
      } else {
        navigate('/login');
      }
    } catch (error) {
      navigate('/login');
    } finally {
      dispatch(hideLoader());
    }
  };


  const fetchAllUsers = async () => {
    try {
      dispatch(showLoader());
      const response = await getAllUser();
      if (response.success) {
        dispatch(setAllUsers(response.data));
      } else {
        console.error('Failed to fetch all users');
      }
    } catch (error) {
      console.error('Error fetching all users:', error);
    } finally {
      dispatch(hideLoader());
    }
  };

  const fetchCurrentUserChats = async () => {
    try {
      dispatch(showLoader());
      const response = await getAllChats();
      if (response.success) {
        dispatch(setAllChat(response.data));
      } else {
        console.error('Failed to fetch all chats');
      }
    } catch (error) {
      console.error('Error fetching all users:', error);
    } finally {
      dispatch(hideLoader());
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      (async () => {
        await fetchUserData();
        await fetchAllUsers();
        await fetchCurrentUserChats();
        setLoading(false);
      })();
    }
  }, [navigate]);

  if (loading) return null;

  return <>{children}</>;
};

export default ProtectedRoutes;
