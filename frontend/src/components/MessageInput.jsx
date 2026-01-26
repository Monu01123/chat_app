import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, SendHorizontal, X, Clock } from "lucide-react";
import toast from "react-hot-toast";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showTimer, setShowTimer] = useState(false);
  const [lockDuration, setLockDuration] = useState(0); // 0 = no lock

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const { sendMessage } = useChatStore();
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    
    // Typing indicator logic
    if (!text && e.target.value) {
       // Started typing
       const { socket } = useAuthStore.getState();
       const { selectedChat } = useChatStore.getState();
       if (socket && selectedChat) {
          socket.emit("typing", { chatId: selectedChat._id, receiverId: !selectedChat.isGroupChat ? selectedChat.users[0]?._id : null });
       }
    }
    
    // Debounce stop typing
    if (window.typingTimeout) clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
       const { socket } = useAuthStore.getState();
       const { selectedChat } = useChatStore.getState();
       if (socket && selectedChat) {
          socket.emit("stopTyping", { chatId: selectedChat._id, receiverId: !selectedChat.isGroupChat ? selectedChat.users[0]?._id : null });
       }
    }, 2000);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await sendMessage({
        text: text.trim(),
        image: imagePreview,
        lockedDuration: lockDuration 
      });

      setText("");
      setImagePreview(null);
      setLockDuration(0); // Reset timer
      setShowTimer(false);
      if (fileInputRef.current) fileInputRef.current.value = "";

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const timerOptions = [
      { label: "Off", value: 0 },
      { label: "10s", value: 10 },
      { label: "1 min", value: 60 },
      { label: "5 min", value: 300 },
      { label: "1 hr", value: 3600 },
  ];

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-end gap-2">
        <div className="flex-1 flex items-end gap-2 relative">
          <textarea
            ref={textareaRef}
            className="w-full resize-none rounded-lg border border-base-300 px-3 py-2 text-sm sm:text-base min-h-[40px] max-h-[200px] overflow-y-hidden break-words whitespace-pre-wrap leading-tight scrollbar-hide focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={lockDuration > 0 ? `Time Capsule (${lockDuration}s)` : "Type a message"}
            value={text}
            onChange={handleTextChange}
            rows={1}
          />
          
          {/* Timer Icon */}
           <div className="relative">
               <button
                  type="button"
                  className={`hidden sm:flex btn btn-sm btn-circle self-end mb-1
                      ${lockDuration > 0 ? "text-primary bg-primary/10" : "text-zinc-400"}`}
                  onClick={() => setShowTimer(!showTimer)}
               >
                  <Clock size={18} />
               </button>
               {showTimer && (
                  <div className="absolute bottom-12 right-0 bg-base-100 border border-base-300 rounded-lg shadow-xl p-2 min-w-[120px] flex flex-col gap-1 z-20">
                      <h4 className="text-xs font-bold px-2 mb-1 text-center">Time Capsule</h4>
                      {timerOptions.map(option => (
                          <button
                             type="button"
                             key={option.value}
                             onClick={() => {
                                 setLockDuration(option.value);
                                 setShowTimer(false);
                             }}
                             className={`btn btn-xs ${lockDuration === option.value ? "btn-primary" : "btn-ghost"} justify-start`}
                          >
                             {option.label}
                          </button>
                      ))}
                  </div>
               )}
           </div>

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
        </div>
        <button
          type="button"
          className={`hidden sm:flex btn btn-sm btn-circle self-end
              ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <Image size={18} />
        </button>
        <button
          type="submit"
          className="btn btn-sm btn-circle self-end"
          disabled={!text.trim() && !imagePreview}
        >
          <SendHorizontal size={18} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
