import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { createNewChat } from '../../../apiCalls/chat';
import { showLoader, hideLoader } from '../../../redux/loaderSlice';
import { setAllChat, setSelectedChat } from '../../../redux/userSlice';
import moment from 'moment';
import store from '../../../redux/store.js';

const UserList = ({ searchKey, socket, onlineUser }) => {
    const dispatch = useDispatch();
    const { allUsers, allChats, user: currentUser, selectedChat } = useSelector((state) => state.user);

    const startNewChat = async (userId) => {
        try {
            dispatch(showLoader());
            const response = await createNewChat([currentUser._id, userId]);
            dispatch(hideLoader());

            if (response.success) {
                toast.success("Chat created successfully");
                const newChat = response.data;
                dispatch(setAllChat([...allChats, newChat]));
                dispatch(setSelectedChat(newChat));
            } else {
                toast.error(response.message || "Chat creation failed");
            }
        } catch (error) {
            dispatch(hideLoader());
            toast.error("Failed to create chat");
        }
    };

    const openChat = (userId) => {
        const chat = allChats.find(chat =>
            chat.members.some(m => m._id === currentUser._id) &&
            chat.members.some(m => m._id === userId)
        );

        if (chat) {
            dispatch(setSelectedChat(chat));
        } else {
            toast.error("Chat not found");
        }
    };

    const isUserInSelectedChat = (userId) => {
        if (!selectedChat) return false;
        return selectedChat.members.some(m => m._id === userId);
    };

    const getChatWithUser = (userId) => {
        return allChats.find(chat =>
            chat.members.some(m => m._id === userId) &&
            chat.members.some(m => m._id === currentUser._id)
        );
    };

    const getLastMessage = (user) => {
        const chat = getChatWithUser(user._id);
        if (!chat || !chat.lastMessage) {
            return user.email; // fallback
        }
        const msgPrefix = chat.lastMessage.senderId === currentUser._id ? "You: " : "";
        return msgPrefix + chat.lastMessage.content?.substring(0, 20);
    };

    const getUnreadMessageCount = (userId) => {
        const chat = allChats.find(chat =>
            chat.members.some(m => m._id === userId) &&
            chat.members.some(m => m._id === currentUser._id)
        );

        if (!chat || !chat.lastMessage) return "";

        // Only show count if the last message was sent by someone else
        const isCurrentUserReceiver = chat.lastMessage.senderId !== currentUser._id;

        return isCurrentUserReceiver && chat.unreadMessageCount > 0
            ? chat.unreadMessageCount
            : "";
    };


    const getLastMessageTimestamp = (user) => {
        const chat = getChatWithUser(user._id);
        if (!chat || !chat.lastMessage) return '';
        return moment(chat.lastMessage.createdAt).format('hh:mm A');
    };

    useEffect(() => {
        socket.on('recieve-message', (message) => {
            const state = store.getState().user;
            const selectedChatId = state.selectedChat?._id;
            let updatedChats = [...state.allChats];

            // Update the relevant chat
            updatedChats = updatedChats.map((chat) => {
                if (chat._id === message.chatId) {
                    return {
                        ...chat,
                        lastMessage: message,
                        unreadMessageCount:
                            selectedChatId === message.chatId
                                ? 0
                                : (chat.unreadMessageCount || 0) + 1,
                    };
                }
                return chat;
            });

            // 🔄 Sort all chats by latest message timestamp
            const sortedChats = updatedChats.sort((a, b) => {
                const aTime = new Date(a.lastMessage?.createdAt || 0).getTime();
                const bTime = new Date(b.lastMessage?.createdAt || 0).getTime();
                return bTime - aTime; // descending: latest message on top
            });

            dispatch(setAllChat(sortedChats));
        });

        return () => socket.off('recieve-message');
    }, [dispatch, socket]);


    return (
        <>
            {allUsers
                .filter((user) => {
                    const searchLower = searchKey.toLowerCase().trim();
                    const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
                    return (
                        (fullName.includes(searchLower) ||
                            user.email.toLowerCase().includes(searchLower)) && searchKey
                    ) || (getChatWithUser(user._id) && !searchKey);
                })
                .sort((a, b) => {
                    const chatA = getChatWithUser(a._id);
                    const chatB = getChatWithUser(b._id);

                    const timeA = chatA?.lastMessage?.createdAt
                        ? new Date(chatA.lastMessage.createdAt).getTime()
                        : 0;
                    const timeB = chatB?.lastMessage?.createdAt
                        ? new Date(chatB.lastMessage.createdAt).getTime()
                        : 0;

                    return timeB - timeA; // Newest first
                })
                .map((user) => (
                    <div
                        className="user-search-filter"
                        key={user._id}
                        onClick={() => openChat(user._id)}
                    >
                        <div className={isUserInSelectedChat(user._id) ? "selected-user" : "filtered-user"}>
                            <div className="filter-user-display">

                                <div
                                    className={`user-profile-wrapper ${isUserInSelectedChat(user._id) ? "selected" : ""} ${user.profilePic ? "has-profile" : "no-profile"}`}
                                >
                                    <div className="profile-content">
                                        {user.profilePic ? (
                                            <img
                                                src={user.profilePic}
                                                alt="Profile"
                                                className="profile-pic-img"
                                            />
                                        ) : (
                                            <span className="user-initials">
                                                {user.firstname?.charAt(0).toUpperCase()}
                                                {user.lastname?.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                        {onlineUser.includes(user._id) && <span className="online-dot" />}
                                    </div>
                                </div>



                                <div className="filter-user-details">
                                    <div className="user-display-name">
                                        {`${user.firstname.charAt(0).toUpperCase() + user.firstname.slice(1).toLowerCase()} ${user.lastname.charAt(0).toUpperCase() + user.lastname.slice(1).toLowerCase()}`}
                                    </div>
                                    <div className="user-display-email">{getLastMessage(user)}</div>
                                </div>

                                <div className="time-message-count">
                                    {getUnreadMessageCount(user._id) > 0 && (
                                        <span className="unread-count-badge">
                                            {getUnreadMessageCount(user._id)}
                                        </span>
                                    )}
                                    <div className="lastmessage-time">{getLastMessageTimestamp(user)}</div>
                                </div>

                                {!getChatWithUser(user._id) && (
                                    <div className="user-start-chat">
                                        <button
                                            className="user-start-chat-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                startNewChat(user._id);
                                            }}
                                        >
                                            Start Chat
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>
                ))}
        </>
    );
};

export default UserList;
