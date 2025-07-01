const Chat = require('../models/chat');
const User = require('../models/user');
const router= require('express').Router();
const authMiddleware = require('../middleware/authMiddleware');
const Message = require('../models/message')
router.post('/create-chat', authMiddleware, async (req, res) => {
    try {
        const { members} = req.body;
        if (!members || members.length < 2) {
            return res.status(400).json({
                message: 'At least two members are required to create a chat.'
            });
        }
        console.log('Creating chat with members:', members);
        const chat = new Chat(req.body);
        const savedChat = await chat.save();
        await savedChat.populate('members');
        res.status(201).json({
            message: 'Chat created successfully',
            success: true,
            data: savedChat
        });
        
    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({
            message: 'Internal Server Error',
            success: false,
            error: error.message
        });
    }
})

router.get('/get-all-chat', authMiddleware, async (req, res) => {
    try {
        const allChats = await Chat.find({members: {$in : req.userData.userId}})
        .populate('members').populate('lastMessage').sort({updatedAt: -1});        
        res.status(200).json({
            message: 'All Chats fetched successfully',
            success: true,
            data: allChats
        });
        
    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({
            message: 'Internal Server Error',
            success: false,
            error: error.message
        });
    }
})


router.post('/clear-unread-message', authMiddleware, async (req, res) => {
    try {
        const { chatId } = req.body;

        const chat = await Chat.findById(chatId);
        if (!chat) {
            return res.status(404).send({
                message: "No chat found with the given ID",
                success: false
            });
        }

        const updatedChat = await Chat.findByIdAndUpdate(
            chatId,
            { unreadMessageCount: 0 },
            { new: true }
        ).populate('members').populate('lastMessage');

        await Message.updateMany(
            { chatId: chatId, read: false },
            { read: true }
        );

        res.send({
            message: 'Unread messages cleared successfully',
            success: true,
            data: updatedChat
        });
    } catch (error) {
        res.status(500).json({
            message: 'Internal Server Error',
            success: false,
            error: error.message
        });
    }
});

module.exports = router;