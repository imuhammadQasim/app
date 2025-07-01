import { axiosInstance ,url } from "../apiCalls"
export const getAllChats = async()=> {
    try {
        const response = await axiosInstance.get(url+'api/chat/get-all-chat');
        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || "Failed to fetch chats");
        } 
    } catch (error) {
        return error
    }
}

export const createNewChat = async(members)=> {
    try {
        const response = await axiosInstance.post(url+'api/chat/create-chat' , { members });
        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || "Failed to fetch chats");
        } 
    } catch (error) {
        return error
    }
}

export const clearUnreadMessageCount = async(chatId)=> {
    try {
        const response = await axiosInstance.post(url+'api/chat/clear-unread-message' , { chatId: chatId });
        if (response.data.success) {
            return response.data;
        } else {
            throw new Error(response.data.message || "Failed to fetch chats");
        } 
    } catch (error) {
        return error
    }
}