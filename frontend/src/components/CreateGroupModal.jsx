import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { X } from "lucide-react";
import toast from "react-hot-toast";

const CreateGroupModal = ({ onClose }) => {
  const { users, createGroup } = useChatStore();
  const { authUser } = useAuthStore();
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleUserSelect = (userId) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!groupName || selectedUsers.length < 2) {
      toast.error("Please fill all fields and select at least 2 users");
      return;
    }

    try {
      const success = await createGroup({
        name: groupName,
        users: JSON.stringify(selectedUsers),
      });
      if (success) onClose();
    } catch (error) {
      console.error(error);
    }
  };

  // Filter out self from users list
  const availableUsers = users.filter(u => u._id !== authUser._id);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-base-200 p-6 rounded-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-base-content/50 hover:text-base-content"
        >
          <X className="size-5" />
        </button>
        
        <h3 className="text-lg font-semibold mb-4">Create Group Chat</h3>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Group Name"
            className="input input-bordered w-full"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            <span className="text-sm font-medium opacity-70">Select Members</span>
            {availableUsers.map((user) => (
              <label
                key={user._id}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                  selectedUsers.includes(user._id) ? "bg-primary/10" : "hover:bg-base-300"
                }`}
              >
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary"
                  checked={selectedUsers.includes(user._id)}
                  onChange={() => handleUserSelect(user._id)}
                />
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName}
                  className="size-8 rounded-full object-cover"
                />
                <span className="text-sm">{user.fullName}</span>
              </label>
            ))}
          </div>

          <button type="submit" className="btn btn-primary w-full mt-2">
            Create Group
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
