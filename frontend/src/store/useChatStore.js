import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  chats: [], // New state for chats
  selectedUser: null,
  selectedChat: null, // New state for selected chat (group or 1-1)
  isUsersLoading: false,
  isMessagesLoading: false,
  isTyping: false,
  isChatsLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getChats: async () => {
    set({ isChatsLoading: true });
    try {
      const res = await axiosInstance.get("/chats");
      set({ chats: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isChatsLoading: false });
    }
  },

  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/chats/group", groupData);
      set({ chats: [res.data, ...get().chats] });
      toast.success("Group Created Successfully");
      return true;
    } catch (error) {
      toast.error(error.response.data.message || error.response.data);
      return false;
    }
  },

  renameGroup: async (chatId, chatName) => {
    try {
      const res = await axiosInstance.put("/chats/rename", { chatId, chatName });
      // Update chats list and selectedChat
      const updatedChats = get().chats.map(c => c._id === chatId ? res.data : c);
      set({ chats: updatedChats, selectedChat: res.data });
      toast.success("Group Renamed");
    } catch (error) {
      toast.error(error.response.data.message || error.response.data);
    }
  },

  addUserToGroup: async (chatId, userId) => {
    try {
      const res = await axiosInstance.put("/chats/groupadd", { chatId, userId });
      const updatedChats = get().chats.map(c => c._id === chatId ? res.data : c);
      set({ chats: updatedChats, selectedChat: res.data });
      toast.success("User Added");
    } catch (error) {
      toast.error(error.response.data.message || error.response.data);
    }
  },

  removeUserFromGroup: async (chatId, userId) => {
    try {
      const res = await axiosInstance.put("/chats/groupremove", { chatId, userId });
      const updatedChats = get().chats.map(c => c._id === chatId ? res.data : c);
      set({ chats: updatedChats, selectedChat: res.data });
      // If authUser removed themselves, clear selectedChat
      if (userId === useAuthStore.getState().authUser._id) {
          set({ selectedChat: null });
      } else {
          toast.success("User Removed");
      }
    } catch (error) {
      toast.error(error.response.data.message || error.response.data);
    }
  },

  deleteGroup: async (chatId) => {
      try {
          await axiosInstance.delete(`/chats/group/${chatId}`);
          const updatedChats = get().chats.filter(c => c._id !== chatId);
          set({ chats: updatedChats, selectedChat: null });
          toast.success("Group Deleted");
      } catch (error) {
          toast.error(error.response.data.message || error.response.data);
      }
  },

  reactToMessage: async (messageId, emoji) => {
     try {
         await axiosInstance.put(`/messages/${messageId}/react`, { emoji });
         // No need to manually update state here, socket will handle it
     } catch (error) {
        toast.error(error.response.data.message || error.response.data);
     }
  },
  
  accessChat: async (userId) => {
     try {
       const res = await axiosInstance.post("/chats", { userId });
       set({ selectedChat: res.data });
       // Also refetch chats to update list if new
       if (!get().chats.find(c => c._id === res.data._id)) {
           set({ chats: [res.data, ...get().chats] });
       }
     } catch (error) {
        toast.error(error.response.data.message);
     }
  },

  getMessages: async (chatId) => {
    set({ isMessagesLoading: true });
    try {
      // Logic: If chatId is provided, use it. 
      // Note: We updated backend /messages/:id to treat :id as chatId.
      const res = await axiosInstance.get(`/messages/${chatId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedChat, messages } = get();
    try {
      // Backend expects chatId in body or via route param. 
      // We updated backend route logic to use :id as ChatId? 
      // Actually backend route is /send/:id where :id is receiverId originally.
      // We updated controller to expect chatId in body AND assume route param is chatId.
      // Ideally we should post to /messages/send/:chatId
      const res = await axiosInstance.post(`/messages/send/${selectedChat._id}`, {
         ...messageData,
         chatId: selectedChat._id
      });
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedChat, selectedUser } = get(); // Keep selectedUser for typing/read events
    if (!selectedChat) return;

    const socket = useAuthStore.getState().socket;

    // Join the chat room
    socket.emit("joinChat", selectedChat._id);

    socket.on("message received", (newMessage) => { // Changed event name from backend
       if (!selectedChat || selectedChat._id !== newMessage.chat._id) {
           // unexpected message
       } else {
          set({
            messages: [...get().messages, newMessage],
          });
       }
    });

    // Also support legacy or direct updates if needed, but "message received" covers groups.
    socket.on("newGroupMessage", (newMessage) => {
         if (selectedChat && selectedChat._id === newMessage.chat._id) {
             set({ messages: [...get().messages, newMessage] });
         }
    });

    socket.on("typing", ({ chatId, userId }) => {
      // Check if event is for the currently selected chat
      if (selectedChat && selectedChat._id === chatId) {
        // Prevent showing typing indicator for self
        if (userId !== useAuthStore.getState().authUser._id) {
            set({ isTyping: true });
        }
      }
    });

    socket.on("stopTyping", ({ chatId }) => {
      if (selectedChat && selectedChat._id === chatId) {
        set({ isTyping: false });
      }
    });

    socket.on("messagesRead", ({ userId, chatId }) => {
       // If the user currently selected matches the one who read the messages, update UI
       // userId is who READ it.
       if (selectedChat && selectedChat._id === chatId) {
          set({
            messages: get().messages.map(msg => {
                // If it's my message, or just general update
                // If the message doesn't have readBy array, init it (safety)
                const readBy = msg.readBy || [];
                if (!readBy.includes(userId)) {
                    return { ...msg, readBy: [...readBy, userId] };
                }
                return msg;
            })
          });
       } else if (selectedUser && selectedUser._id === userId) {
           // Fallback for old logic
          set({
            messages: get().messages.map(msg => msg.receiverId === userId ? { ...msg, status: "read" } : msg)
          })
       }
    });

    socket.on("reactionUpdated", ({ messageId, reactions }) => {
       set({
           messages: get().messages.map(msg => 
               msg._id === messageId ? { ...msg, reactions } : msg
           )
       });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("message received");
    socket.off("newGroupMessage");
    socket.off("typing");
    socket.off("stopTyping");
    socket.off("messagesRead");
    socket.off("reactionUpdated");
  },

  setSelectedChat: (selectedChat) => set({ selectedChat }),
  setSelectedUser: (selectedUser) => set({ selectedUser }), // Keeping for now but should deprecate
}));
