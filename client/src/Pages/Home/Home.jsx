import React, { useEffect , useState } from 'react'
import './home.css'
import Header from './Components/Header.jsx'
import Sidebar from './Components/Sidebar.jsx'
import ChatArea from './Components/ChatArea.jsx'
import { useSelector } from 'react-redux'
import { io } from 'socket.io-client'

const socket = io('http://localhost:5000', {
  transports: ['websocket'],
});
const Home = () => {
  const { selectedChat, user } = useSelector((state) => state.user);
  const [onlineUser, setOnlineUser] = useState([])

 useEffect(() => {
  if (!user) return;

  // Join socket room and notify server of login
  socket.emit('join-room', user);
  socket.emit('user-login', user._id);

  // Listen for online users update
  const handleOnlineUsers = (users) => setOnlineUser(users);
  const handleOnlineUserUpdated = (users) => setOnlineUser(users);

  socket.on('online-user', handleOnlineUsers);
  socket.on('online-user-updated', handleOnlineUserUpdated);

  // ✅ Clean up on unmount
  return () => {
    socket.off('online-user', handleOnlineUsers);
    socket.off('online-user-updated', handleOnlineUserUpdated);
  };
}, [user]); // ✅ Only run on `user` change



  return (
    <div className="home-page">
      <Header socket={socket}/>
      <div className="main-content">
        <Sidebar socket={socket} onlineUser={onlineUser}/>
        {selectedChat && <ChatArea socket={socket} />}
      </div>
    </div>
  )
}

export default Home
