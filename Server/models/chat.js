const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },

  unreadMessageCount: {
    type: Number,
    default: 0
  },

//   isGroupChat: {
//     type: Boolean,
//     default: false
//   },

  chatName: {
    type: String
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
