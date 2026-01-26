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
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Chats</span>
        </div>
        
        {/* Create Group Button */}
        <button 
           onClick={() => setShowCreateGroup(true)}
           className="mt-4 w-full flex items-center gap-2 btn btn-sm btn-ghost justify-start"
        >
           <Plus className="size-4" />
           <span className="hidden lg:block">Create Group</span>
        </button>

        <div className="mt-3 hidden lg:flex items-center gap-2">
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
              <div className="px-5 text-xs font-semibold text-zinc-500 mb-2 hidden lg:block">GROUPS</div>
              {chats.filter(c => c.isGroupChat).map(chat => (
                  <button
                    key={chat._id}
                    onClick={() => setSelectedChat(chat)}
                    className={`
                      w-full p-3 flex items-center gap-2
                      hover:bg-base-300 transition-colors
                      ${selectedChat?._id === chat._id ? "bg-base-300 ring-1 ring-base-300" : ""}
                    `}
                  >
                    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                        {chat.chatName.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden lg:block text-left min-w-0">
                       <div className="font-medium truncate">{chat.chatName}</div>
                    </div>
                  </button>
              ))}
           </div>
        )}

        <div className="px-5 text-xs font-semibold text-zinc-500 mb-2 hidden lg:block">DIRECT MESSAGES</div>
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => accessChat(user._id)}
            className={`
              w-full p-3 flex items-center gap-2
              hover:bg-base-300 transition-colors
              ${
                // Check if this user corresponds to the selectedChat (if 1-1)
                // Logic: selectedChat exists, !isGroupChat, and users contains this user
                selectedChat && 
                !selectedChat.isGroupChat && 
                selectedChat.users.some(u => u._id === user._id)
                  ? "bg-base-300 ring-1 ring-base-300"
                  : ""
              }
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="size-11 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            <div className="hidden lg:block text-left min-w-0 pt-0.5 pb-0.5">
              <div className="font-medium truncate text-[12px]">
                {user.fullName}
              </div>
              <div className="text-[10px]  text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4">No online users</div>
        )}
      </div>

      {showCreateGroup && <CreateGroupModal onClose={() => setShowCreateGroup(false)} />}
    </aside>
  );
};
export default Sidebar;
