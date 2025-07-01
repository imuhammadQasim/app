import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createNewMessage, getAllMessages } from '../../../apiCalls/message';
import { showLoader, hideLoader } from '../../../redux/loaderSlice';
import { toast } from 'react-hot-toast';
import moment from 'moment';
import { clearUnreadMessageCount } from '../../../apiCalls/chat';
import { setAllChat } from '../../../redux/userSlice';
import { Socket } from 'socket.io-client';
import store from '../../../redux/store.js'
import EmojiPicker from 'emoji-picker-react';
const ChatArea = ({ socket }) => {
  const dispatch = useDispatch();
  const { selectedChat, user, allChats } = useSelector((state) => state.user);
  const selectedUser = selectedChat?.members?.find((u) => u._id !== user._id);

  const [message, setMessage] = useState('');
  const [allMessages, setAllMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false)
  const [showEmoji, setShowEmoji] = useState(false)
  const messageInputRef = useRef();
  const emojiRef = useRef();


  const sendMessage = async (text, image) => {
    try {
      const newMessage = {
        chatId: selectedChat._id,
        senderId: user._id,
        content: text,
        image: image,
      };

      // Save to DB
      const response = await createNewMessage(newMessage);

      if (response.success) {
        setMessage(''); // clear input
        setShowEmoji(false)

        // Now emit this message to all chat members
        socket.emit('send-message', {
          ...response.data, // use the real message from DB (with _id, time, etc.)
          members: selectedChat.members.map(m => m._id),
        });

      } else {
        toast.error(response.message || 'Message failed');
      }
    } catch (error) {
      dispatch(hideLoader());
      console.error(error);
      toast.error('Failed to send message');
    }
  };


  const clearUnreadMessages = async () => {
    try {
      socket.emit('clear-unread-messages', {
        chatId: selectedChat._id,
        members: selectedChat.members.map(m => m._id),
      })
      const response = await clearUnreadMessageCount(selectedChat._id);

      if (response.success) {
        const updatedChats = allChats.map((chat) =>
          chat._id === selectedChat._id ? response.data : chat
        );
        dispatch(setAllChat(updatedChats));
      } else {
        toast.error(response.message || 'Failed to clear unread messages');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to clear unread messages');
    }
  };

  const getMessages = async () => {
    try {
      dispatch(showLoader());
      const response = await getAllMessages(selectedChat._id);
      dispatch(hideLoader());

      if (response.success) {
        setAllMessages(response.data);
      } else {
        toast.error(response.message || 'Failed to get messages');
      }
    } catch (error) {
      dispatch(hideLoader());
      console.error(error);
      toast.error('Failed to get messages');
    }
  };

  const handleSendClick = () => {
    if (message.trim()) {
      sendMessage(message.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendClick();
    }
  };

  useEffect(() => {
    if (selectedChat?._id) {
      getMessages();

      if (selectedChat?.lastMessage?.senderId !== user._id) {
        clearUnreadMessages();
      }

      if (messageInputRef.current) {
        messageInputRef.current.focus();
      }
    }

    // Handle incoming message
    const handleIncomingMessage = (message) => {
      const currentChat = store.getState().user.selectedChat;
      if (currentChat?._id === message.chatId) {
        setAllMessages((prevMsgs) => [...prevMsgs, message]);
      }
    };

    // Handle typing event
    const handleTyping = (data) => {
      const currentChat = store.getState().user.selectedChat;
      if (currentChat?._id === data.chatId && data.senderId !== user._id) {
        setIsTyping(true);

        clearTimeout(window.typingTimeout);
        window.typingTimeout = setTimeout(() => {
          setIsTyping(false);
        }, 1000);
      }
    };

    // Handle clear unread
    const handleClearUnread = (data) => {
      const { selectedChat, allChats } = store.getState().user;

      // ✅ Clear unread count for the right chat
      const updatedChats = allChats.map((chat) =>
        chat._id === data.chatId
          ? { ...chat, unreadMessageCount: 0 }
          : chat
      );

      dispatch(setAllChat(updatedChats));

      // ✅ Also update read status on messages in current chat
      if (selectedChat?._id === data.chatId) {
        setAllMessages((prev) =>
          prev.map((msg) => ({ ...msg, read: true }))
        );
      }
    };


    socket.on('recieve-message', handleIncomingMessage);
    socket.on('started-typing', handleTyping);
    socket.on('message-count-clear', handleClearUnread);

    return () => {
      socket.off('recieve-message', handleIncomingMessage);
      socket.off('started-typing', handleTyping);
      socket.off('message-count-clear', handleClearUnread);
    };
  }, [selectedChat]);

const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.readAsDataURL(file);

  reader.onloadend = async () => {
    // Send empty message but image is included
    await sendMessage('', reader.result);
  };
};




  useEffect(() => {
    const msgContainer = document.getElementById('main-chat-area');
    msgContainer.scrollTop = msgContainer.scrollHeight;
  }, [allMessages, isTyping]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiRef.current &&
        !emojiRef.current.contains(event.target) &&
        !event.target.closest('.send-emoji-btn') // prevent closing when emoji icon is clicked
      ) {
        setShowEmoji(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);


  return (
    <>
      {selectedChat?._id && (
        <div className="app-chat-area">
          <div className="app-chat-area-header">
            {selectedUser &&
              `${selectedUser.firstname.charAt(0).toUpperCase() + selectedUser.firstname.slice(1)} ${selectedUser.lastname.charAt(0).toUpperCase() + selectedUser.lastname.slice(1)}`}
          </div>

          <div className="main-chat-area" id='main-chat-area'>
            {allMessages.map((msg) => {
              const isCurrentUserSender =
                msg.senderId?._id === user._id || msg.senderId === user._id;

              return (
                <div
                  className={`message-wrapper ${isCurrentUserSender ? 'align-right' : 'align-left'}`}
                  key={msg._id}>
                  <div className="message-bubble">
                    <div className={isCurrentUserSender ? 'send-message' : 'received-message'}>
                      <div>{msg.content}</div>
                      {msg.image && (
                        <div>
                          <img src={msg.image} height={220} width={220} alt="attachment" />
                        </div>
                      )}
                    </div>
                    <div
                      className="msg-timestamp"
                      style={{
                        alignSelf: isCurrentUserSender ? 'flex-end' : 'flex-start',
                        textAlign: isCurrentUserSender ? 'right' : 'left',
                      }}
                    >
                      {moment(msg.createdAt).format('hh:mm A')}{' '}
                      {isCurrentUserSender && msg.read && (
                        <i className="fa fa-check-circle" style={{ color: '#6366f1' }}></i>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div>{isTyping && <i className='typing-indicator'>typing...</i>}</div>
          </div>

          {showEmoji && (
            <div className="emoji-picker-container" ref={emojiRef}>
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setMessage((prev) => prev + emojiData.emoji);
                  setShowEmoji(false);
                }}
              />
            </div>
          )}

          <div className="send-message-div">
            <input
              type="text"
              className="send-message-input"
              placeholder="Type a message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                socket.emit('user-typing', {
                  chatId: selectedChat._id,
                  members: selectedChat.members.map(m => m._id),
                  senderId: user._id
                })
              }

              }
              onKeyPress={handleKeyPress}
              ref={messageInputRef}
            />
            <label htmlFor="file">
              <i className='fa fa-picture-o send-image-btn'></i>
            </label>
            <input
              type="file"
              id="file"
              style={{ display: 'none' }}
              accept="image/jpeg, image/jpg, image/gif, image/png"
              onChange={handleImageUpload}
            />

            <i className='fa fa-smile-o send-emoji-btn' onClick={() => setShowEmoji(!showEmoji)}></i>
            <button
              className="fa fa-paper-plane send-message-btn"
              aria-hidden="true"
              onClick={handleSendClick}
            ></button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatArea;
