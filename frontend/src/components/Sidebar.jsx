import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Plus } from "lucide-react";
import CreateGroupModal from "./CreateGroupModal";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, getChats, chats, setSelectedChat, accessChat, selectedChat } =
    useChatStore();
  const { onlineUsers, authUser } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  useEffect(() => {
    getUsers();
    getChats();
  }, [getUsers, getChats]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-full min-[650px]:w-72 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium block">Chats</span>
        </div>
        
        {/* Create Group Button */}
        <button 
           onClick={() => setShowCreateGroup(true)}
           className="mt-4 w-full flex items-center gap-2 btn btn-sm btn-ghost justify-start"
        >
           <Plus className="size-4" />
           <span className="block">Create Group</span>
        </button>

        <div className="mt-3 flex items-center gap-2">
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlineOnly}
              onChange={(e) => setShowOnlineOnly(e.target.checked)}
              className="checkbox checkbox-sm"
            />
            <span className="text-sm">Online only</span>
          </label>
        </div>
      </div>

      <div className="overflow-y-auto w-full py-3 thin-scrollbar">
        {/* Group Chats Section */}
        {chats.filter(c => c.isGroupChat).length > 0 && (
           <div className="mb-4">
              <div className="px-5 text-xs font-semibold text-zinc-500 mb-2 block">GROUPS</div>
              {chats.filter(c => c.isGroupChat).map(chat => (
                  <button
                    key={chat._id}
                    onClick={() => setSelectedChat(chat)}
                    className={`
                      w-full p-3 flex items-center gap-3
                      hover:bg-base-200 transition-all duration-200 rounded-lg mx-1
                      ${selectedChat?._id === chat._id ? "bg-base-200 ring-1 ring-base-300 shadow-sm" : "hover:bg-base-200/50"}
                    `}
                  >
                    <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {chat.chatName.charAt(0).toUpperCase()}
                    </div>
                    <div className="block text-left min-w-0 flex-1">
                       <div className="font-medium truncate text-[14px]">{chat.chatName}</div>
                       <div className="text-[12px] text-zinc-400 truncate">
                            {chat.latestMessage ? (
                                chat.latestMessage.image ? "📷 Image" : (chat.latestMessage.text || "New message")
                            ) : (
                                "No messages yet"
                            )}
                       </div>
                    </div>
                  </button>
              ))}
           </div>
        )}

        <div className="px-5 text-xs font-semibold text-zinc-500 mb-2 block">DIRECT MESSAGES</div>
        {filteredUsers.map((user) => {
          // Find the 1-1 chat for this user
          const userChat = chats.find(c => !c.isGroupChat && c.users.some(u => u._id === user._id));
          const latestMsg = userChat?.latestMessage;

          return (
          <button
            key={user._id}
            onClick={() => accessChat(user._id)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-200 transition-all duration-200 rounded-lg mx-1
              ${
                selectedChat && 
                !selectedChat.isGroupChat && 
                selectedChat.users.some(u => u._id === user._id)
                  ? "bg-base-200 ring-1 ring-base-300 shadow-sm"
                  : "hover:bg-base-200/50"
              }
            `}
          >
            <div className="relative mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            <div className="block text-left min-w-0 pt-0.5 pb-0.5 flex-1">
              <div className="font-medium truncate text-[14px]">
                {user.fullName}
              </div>
              <div className="text-[12px] text-zinc-400 truncate">
                {latestMsg ? (
                    latestMsg.image ? "📷 Image" : (latestMsg.text || "New message")
                ) : (
                    onlineUsers.includes(user._id) ? "Online" : "Offline"
                )}
              </div>
            </div>
          </button>
        )})}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>

      {showCreateGroup && <CreateGroupModal onClose={() => setShowCreateGroup(false)} />}
    </aside>
  );
};
export default Sidebar;
