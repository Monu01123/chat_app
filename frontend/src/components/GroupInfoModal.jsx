import { useState, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { X, UserPlus, Trash2, LogOut, Edit2, Check } from "lucide-react";
import toast from "react-hot-toast";

const GroupInfoModal = ({ onClose }) => {
  const { selectedChat, users, renameGroup, addUserToGroup, removeUserFromGroup, deleteGroup } = useChatStore();
  const { authUser } = useAuthStore();
  
  const [isRenaming, setIsRenaming] = useState(false);
  const [groupName, setGroupName] = useState(selectedChat.chatName);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isAdmin = selectedChat.groupAdmin._id === authUser._id;

  const handleRename = async () => {
     if(!groupName.trim()) return;
     await renameGroup(selectedChat._id, groupName);
     setIsRenaming(false);
  };

  const handleAddUser = async (userId) => {
      await addUserToGroup(selectedChat._id, userId);
      setIsAddingUser(false); // Close search after adding
  };

  const handleRemoveUser = async (userId) => {
      if(window.confirm("Are you sure you want to remove this user?")) {
        await removeUserFromGroup(selectedChat._id, userId);
      }
  };

  const handleLeaveGroup = async () => {
      if(window.confirm("Are you sure you want to leave this group?")) {
          await removeUserFromGroup(selectedChat._id, authUser._id);
          onClose();
      }
  }

  const handleDeleteGroup = async () => {
      if(window.confirm("Are you sure you want to delete this group? This cannot be undone.")) {
          await deleteGroup(selectedChat._id);
          onClose();
      }
  }

  // Filter users for adding (exclude current members)
  const availableUsers = users.filter(
      u => !selectedChat.users.some(member => member._id === u._id) && 
           u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-200 p-6 rounded-lg w-full max-w-md relative flex flex-col max-h-[85vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-base-content/50 hover:text-base-content"
        >
          <X className="size-5" />
        </button>
        
        <h3 className="text-lg font-semibold mb-4 text-center">Group Info</h3>
        
        {/* Header / Rename */}
        <div className="flex flex-col items-center gap-2 mb-6">
            <div className="size-20 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold">
                 {selectedChat.chatName.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex items-center gap-2">
                {isRenaming ? (
                    <div className="flex items-center gap-2">
                        <input 
                           autoFocus
                           type="text" 
                           value={groupName}
                           onChange={(e) => setGroupName(e.target.value)}
                           className="input input-sm input-bordered"
                        />
                        <button onClick={handleRename} className="btn btn-sm btn-circle btn-success text-white">
                            <Check size={16} />
                        </button>
                    </div>
                ) : (
                    <>
                       <h2 className="text-xl font-bold">{selectedChat.chatName}</h2>
                       {isAdmin && (
                           <button onClick={() => setIsRenaming(true)} className="text-base-content/50 hover:text-primary">
                               <Edit2 size={14} />
                           </button>
                       )}
                    </>
                )}
            </div>
            <p className="text-xs text-base-content/60">
                 Group • {selectedChat.users.length} members
            </p>
        </div>

        {/* Member List */}
        <div className="flex-1 overflow-y-auto mb-4 custom-scrollbar">
            <h4 className="text-sm font-semibold mb-2 flex items-center justify-between">
                Members
                {isAdmin && (
                    <button 
                       onClick={() => setIsAddingUser(!isAddingUser)}
                       className="text-primary hover:underline text-xs flex items-center gap-1"
                    >
                        <UserPlus size={14} /> Add Member
                    </button>
                )}
            </h4>

            {isAddingUser && (
                <div className="mb-3 p-2 bg-base-300 rounded-lg">
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        className="input input-sm input-bordered w-full mb-2"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <div className="max-h-40 overflow-y-auto">
                        {availableUsers.map(user => (
                            <div key={user._id} className="flex items-center justify-between p-2 hover:bg-base-200 rounded">
                                <div className="flex items-center gap-2">
                                    <img src={user.profilePic || "/avatar.png"} className="size-6 rounded-full" alt={user.fullName}/>
                                    <span className="text-sm">{user.fullName}</span>
                                </div>
                                <button onClick={() => handleAddUser(user._id)} className="btn btn-xs btn-primary">Add</button>
                            </div>
                        ))}
                        {availableUsers.length === 0 && <p className="text-xs text-center p-2 opacity-50">No users found</p>}
                    </div>
                </div>
            )}

            <div className="space-y-2">
                {selectedChat.users.map(user => (
                    <div key={user._id} className="flex items-center justify-between p-2 rounded-lg bg-base-100">
                        <div className="flex items-center gap-3">
                            <img src={user.profilePic || "/avatar.png"} className="size-10 rounded-full object-cover" alt={user.fullName} />
                            <div>
                                <p className="font-medium text-sm">
                                    {user.fullName} {user._id === authUser._id && "(You)"}
                                </p>
                                {selectedChat.groupAdmin._id === user._id && (
                                    <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">Admin</span>
                                )}
                            </div>
                        </div>
                        
                        {isAdmin && user._id !== authUser._id && (
                             <button 
                                onClick={() => handleRemoveUser(user._id)}
                                className="text-error hover:bg-error/10 p-1.5 rounded-full transition-colors"
                                title="Remove User"
                             >
                                 <X size={16} />
                             </button>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-2 mt-auto">
            <button 
               onClick={handleLeaveGroup}
               className="btn btn-outline btn-error w-full gap-2"
            >
                <LogOut size={18} /> Leave Group
            </button>
            
            {isAdmin && (
                <button 
                   onClick={handleDeleteGroup}
                   className="btn btn-error w-full gap-2"
                >
                    <Trash2 size={18} /> Delete Group
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default GroupInfoModal;
