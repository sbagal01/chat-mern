const expressHandler=require('express-async-handler');
const User=require('../models/userModel');
const Message=require('../models/messageModel.js')
const Chat=require('../models/chatModel.js');
const sendMessage=expressHandler(async(req,res)=>{
    const {content,chatId}=req.body;
    if(!content || !chatId){
        console.log("Please enter content and chatId");
        return res.sendStatus(400);
    }
    var newMessage={
        sender:req.user._id,
        content:content,
        chat:chatId
    }
    try{
        var message=await Message.create(newMessage);
        message=await message.populate("sender","name pic");
        message=await message.populate("chat")
        message=await User.populate(message,{
            path:"chat.users",
            select:"name pic email",
        });
        await Chat.findByIdAndUpdate(chatId,{
         latestMessage:message   
        });
        res.json(message);
    }catch(error){
        res.status(400);
        throw new Error(error.message);
    }
    
})
const allMessages=expressHandler(async (req,res)=>{
        try{
            const messages=await Message.find({chat:req.params.chatId}).populate("sender","name pic email").populate("chat");

            res.json(messages);
        }catch(error){
            res.status(400);
            throw new Error(error.message);
        }
})

module.exports={sendMessage,allMessages}