import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

import { useState } from "react";
import GroupInfoModal from "./GroupInfoModal";

const ChatHeader = () => {
  const { selectedChat, setSelectedChat, selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  
  // Helper to get other user in 1-1 chat
  const getSender = (loggedUser, users) => {
    return users[0]._id === loggedUser._id ? users[1] : users[0];
  };

  const chatName = selectedChat?.isGroupChat 
      ? selectedChat.chatName 
      : (selectedChat ? getSender(authUser, selectedChat.users).fullName : selectedUser?.fullName);
      
  const chatImage = selectedChat?.isGroupChat
      ? "/group.png" // You might want a default group icon or utilize a specific group image field
      : (selectedChat ? getSender(authUser, selectedChat.users).profilePic : selectedUser?.profilePic);

  const isOnline = !selectedChat?.isGroupChat && selectedChat 
      ? onlineUsers.includes(getSender(authUser, selectedChat.users)._id)
      : false;

  const handleClose = () => {
    if (selectedChat) setSelectedChat(null);
    if (selectedUser) setSelectedUser(null);
  }

  if (!selectedChat && !selectedUser) return null;

  return (
    <div className="p-1.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div 
           className={`flex items-center gap-2 ${selectedChat?.isGroupChat ? "cursor-pointer hover:bg-base-200 rounded-md p-1 transition-colors" : ""}`}
           onClick={() => selectedChat?.isGroupChat && setShowGroupInfo(true)}
        >
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img
                src={chatImage || "/avatar.png"}
                alt={chatName}
              />
            </div>
          </div>

          <div>
            <h3 className="font-medium text-[12px]">{chatName}</h3>
            <p className="text-[9px] text-base-content/70 leading-tight">
              {selectedChat?.isGroupChat ? `${selectedChat.users.length} members (Click for Info)` : (isOnline ? "Online" : "Offline")}
            </p>
          </div>
        </div>

        <button onClick={handleClose}>
          <X />
        </button>
      </div>
      {showGroupInfo && <GroupInfoModal onClose={() => setShowGroupInfo(false)} />}
    </div>
  );
};
export default ChatHeader;
