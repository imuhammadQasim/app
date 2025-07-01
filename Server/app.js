const express = require('express');
const app = express();
const cors = require('cors')
const authRouter = require('./controller/authController');
const userRouter = require('./controller/userController');
const chatRouter = require('./controller/chatController');
const messageRouter = require('./controller/messageController');

app.use(express.json({
  limit: '50mb'
}));

const server = require('http').createServer(app)
const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
})
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/message', messageRouter);

const userSocketMap = {}; // { userId: socket.id }
let onlineUsers = [];
io.on('connection', (socket) => {
  console.log('📡 Socket connected: ' + socket.id);

  socket.on('join-room', (user) => {
    userSocketMap[user._id] = socket.id;
    console.log(`${user.firstname} joined as ${user._id}`);
    console.log(`userSocketMap is : ${userSocketMap[user._id]}`)
  });

  socket.on('user-login', (userId) => {
    userSocketMap[userId] = socket.id;
    if (!onlineUsers.includes(userId)) {
      onlineUsers.push(userId)
    }
    socket.emit('online-user', onlineUsers);
    // userSocketMap[user._id] = socket.id;
    // console.log(`${user.firstname} joined as ${user._id}`);
    // console.log(`userSocketMap is : ${userSocketMap[user._id]}`)
  });

  socket.on('user-logout', (userId) => {
    delete userSocketMap[userId]; 
    onlineUsers = onlineUsers.filter(user => user._id !== userId);
    io.emit('online-user-updated', onlineUsers);
  });


  socket.on('clear-unread-messages', (data) => {
    data.members.forEach((memberId) => {
      if (memberId !== data.senderId) {
        const socketId = userSocketMap[memberId];
        if (socketId) {
          io.to(socketId).emit('message-count-clear', data);
        }
      }
    });
  });

  socket.on('user-typing', (data) => {
    data.members.forEach((memberId) => {
      if (memberId !== data.senderId) {
        const socketId = userSocketMap[memberId];
        if (socketId) {
          io.to(socketId).emit('started-typing', data);
        }
      }
    });
  });


  socket.on('send-message', (message) => {
    console.log("📤 Incoming message:", message);

    // Send message to ALL members including sender
    message.members.forEach((memberId) => {
      const socketId = userSocketMap[memberId];
      if (socketId) {
        io.to(socketId).emit('recieve-message', message);
      }
    });
  });


  // socket.on('send-message', (message) => {
  //   const recipientSocketId = userSocketMap[data.recipient];
  //   if (recipientSocketId) {
  //     io.to(recipientSocketId).emit('recieve-msg', data.msg);
  //   }
  // });

  socket.on('disconnect', () => {
    // Optionally remove user from map
    for (const userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        break;
      }
    }
  });
});



app.get('/', (req, res) => {
  res.send('Server Is Running')
})

module.exports = server; 