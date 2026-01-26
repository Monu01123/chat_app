import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";



import { Check, CheckCheck, SmilePlus, Lock } from "lucide-react";
import { useState } from "react";

const EMOJI_PRESETS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedChat,
    subscribeToMessages,
    unsubscribeFromMessages,
    isTyping,
    reactToMessage
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [hoveredMessageId, setHoveredMessageId] = useState(null);

  const handleReaction = (messageId, emoji) => {
      reactToMessage(messageId, emoji);
      setHoveredMessageId(null); // Hide menu after selection
  };

  useEffect(() => {
    if (selectedChat) {
        getMessages(selectedChat._id);
        subscribeToMessages();
    }
    return () => unsubscribeFromMessages();
  }, [
    selectedChat?._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);
  
  // Mark messages as read when chat is opened or new messages arrive
  // Mark messages as read when chat is opened or new messages arrive
  useEffect(() => {
    if (selectedChat && messages.length > 0) {
       // For 1-1, sender is the other user. 
       // For now, only supporting read receipts for 1-1 chats.
       if (!selectedChat.isGroupChat) {
           const otherUser = selectedChat.users.find(u => u._id !== authUser._id);
           if (otherUser) {
              const unreadMessages = messages.filter(msg => msg.senderId._id === otherUser._id && msg.status !== "read");
              if (unreadMessages.length > 0) {
                 const { socket } = useAuthStore.getState();
                 socket.emit("markMessagesAsRead", { senderId: otherUser._id, chatId: selectedChat._id });
              }
           }
       }
    }
  }, [selectedChat, messages, authUser._id]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
     // Force update every second to update countdowns
     const interval = setInterval(() => {
         const hasLocked = messages.some(m => m.lockedUntil && new Date(m.lockedUntil) > new Date());
         if(hasLocked) {
              setHoveredMessageId(prev => prev); // Dummy update to trigger re-render
              // Actually, in React, we might need a dummy state to force re-render
              setTick(t => t + 1);
         }
     }, 1000);
     return () => clearInterval(interval);
  }, [messages]);

  const [tick, setTick] = useState(0); // For forcing updates

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255, 255, 255, 0.1) transparent",
        }}
      >
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex group ${
              message.senderId._id === authUser._id
                ? "justify-end flex-row"
                : "justify-start flex-row"
            }`}
            ref={messageEndRef}
            onMouseLeave={() => setHoveredMessageId(null)}
          >
            <div
              className={`relative flex flex-col items-end max-w-[60%] rounded-lg p-2 shadow-sm
      ${
        message.senderId._id === authUser._id
          ? "bg-primary text-primary-content"
          : "bg-base-200 text-base-content"
      }`}
            >
                  {/* Time Capsule Logic */}
                  {message.lockedUntil && new Date(message.lockedUntil) > new Date() ? (
                      <div className="flex items-center gap-2 p-2 bg-base-300 rounded-lg min-w-[150px]">
                           <Lock className="size-4 animate-pulse text-warning" />
                           <div className="flex flex-col">
                               <span className="text-xs font-bold text-warning">Time Capsule</span>
                               <span className="text-[10px] opacity-70">
                                   Unlocks in {Math.max(0, Math.ceil((new Date(message.lockedUntil) - new Date()) / 1000))}s
                               </span>
                           </div>
                      </div>
                  ) : (
                    <>
                      {/* Image Message */}
                      {message.image && (
                        <div className="relative">
                          {/* Sender Name for Group Chats */}
                          {selectedChat?.isGroupChat && message.senderId._id !== authUser._id && (
                             <p className="text-[10px] font-bold opacity-70 mb-1 leading-none text-left">
                               {message.senderId.fullName}
                             </p>
                          )}
                          <img
                            src={message.image}
                            alt="Attachment"
                            className="sm:max-w-[200px] rounded-md"
                          />
                          {!message.text && (
                            <p
                              className={`absolute bottom-1 right-1 text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-white ${
                                message.senderId._id === authUser._id
                                  ? "text-primary-content/80"
                                  : "text-base-content/80"
                              }`}
                            >
                              {formatMessageTime(message.createdAt)}
                            </p>
                          )}
                        </div>
                      )}
    
                      {/* Text Message */}
                      {message.text && (
                        <div
                          className={`flex flex-col gap-0.5 ${
                            message.image ? "max-w-[200px]" : "max-w-full"
                          }`}
                        >
                           {/* Sender Name for Group Chats (if no image) */}
                          {!message.image && selectedChat?.isGroupChat && message.senderId._id !== authUser._id && (
                             <p className="text-[10px] font-bold opacity-70 mb-0.5 leading-none text-left">
                               {message.senderId.fullName}
                             </p>
                          )}
                           <div className="inline-flex items-end gap-2">
                            <div className="flex flex-col">
                               <p className="text-sm whitespace-pre-wrap break-all overflow-hidden text-left">
                                 {authUser && message.translations && message.translations[authUser.language] 
                                    ? message.translations[authUser.language] 
                                    : message.text.trim()}
                               </p>
                               {authUser && message.translations && message.translations[authUser.language] && message.translations[authUser.language] !== message.text && (
                                   <p className="text-[10px] opacity-50 text-left mt-0.5 italic">
                                       Original: {message.text.trim()}
                                   </p>
                               )}
                            </div>
                            <div className="flex flex-col items-end gap-0.5">
                              <span
                                className={`text-[9px] shrink-0 self-end relative translate-y-[1px] ${
                                  message.senderId._id === authUser._id
                                    ? "text-primary-content/70"
                                    : "text-base-content/70"
                                }`}
                              >
                                {formatMessageTime(message.createdAt)}
                              </span>
                                {message.senderId._id === authUser._id && (
                                   <span className="flex items-center">
                                      {/* Show Single Tick if Sent AND NOT Read/Delivered */}
                                      {message.status === "sent" && 
                                       !((message.readBy && message.readBy.length > 0) || message.status === "read" || message.status === "delivered") && 
                                       <Check className="size-3 text-white/50" />
                                      }
                                      
                                      {/* Show Double Tick if Delivered, Read, or ReadBy > 0 */}
                                      {(message.status === "delivered" || message.status === "read" || (message.readBy && message.readBy.length > 0)) && (
                                         <CheckCheck 
                                            className={`size-3 ${
                                                message.status === "read" // 1-1 read
                                                || (selectedChat?.isGroupChat && message.readBy && message.readBy.length >= (selectedChat.users.length - 1)) // Group read
                                                ? "text-blue-200" : "text-white/50"
                                            }`} 
                                         />
                                      )}
                                   </span>
                                )}
                            </div>
                          </div>
                          
                          {/* Reactions Display */}
                          {message.reactions && message.reactions.length > 0 && (
                              <div className={`absolute -bottom-4 ${message.senderId._id === authUser._id ? "right-0" : "left-0"} flex gap-1 bg-base-100 rounded-full border border-base-300 px-1 py-0.5 shadow-sm scale-90`}>
                                   {[...new Set(message.reactions.map(r => r.emoji))].slice(0, 3).map((emoji, idx) => (
                                       <span key={idx} className="text-xs">{emoji}</span>
                                   ))}
                                   <span className="text-[10px] text-zinc-500 font-bold ml-0.5">{message.reactions.length}</span>
                              </div>
                          )}
    
                          {/* Hover Reaction Menu */}
                          {hoveredMessageId === message._id && (
                              <div className={`absolute -top-10 ${message.senderId._id === authUser._id ? "right-0" : "left-0"} bg-base-100 p-1.5 rounded-full shadow-lg border border-base-300 flex items-center gap-1 z-10 animate-in fade-in zoom-in duration-200 z-50`}>
                                  {EMOJI_PRESETS.map((emoji) => (
                                      <button
                                         key={emoji}
                                         onClick={() => handleReaction(message._id, emoji)}
                                         className="hover:bg-base-200 p-1 rounded-full text-lg transition-transform hover:scale-125"
                                      >
                                          {emoji}
                                      </button>
                                  ))}
                              </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

            
            {/* Reaction Trigger Button (Visible on Hover) */}
            <div className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center px-2 self-center`}>
                <button 
                  onClick={() => setHoveredMessageId(hoveredMessageId === message._id ? null : message._id)}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                    <SmilePlus size={16} />
                </button>
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-base-200 text-base-content p-2 rounded-lg italic text-sm animate-pulse">
               Typing...
             </div>
           </div>
        )}
        <div ref={messageEndRef} />
      </div>
      <MessageInput />
    </div>
  );
};
export default ChatContainer;
