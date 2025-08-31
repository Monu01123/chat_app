import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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
            className={`flex ${
              message.senderId === authUser._id
                ? "justify-end"
                : "justify-start"
            }`}
            ref={messageEndRef}
          >
            <div
              className={`relative flex flex-col items-end max-w-[60%] rounded-lg p-2 shadow-sm
      ${
        message.senderId === authUser._id
          ? "bg-primary text-primary-content"
          : "bg-base-200 text-base-content"
      }`}
            >
              {/* Image Message */}
              {message.image && (
                <div className="relative">
                  <img
                    src={message.image}
                    alt="Attachment"
                    className="sm:max-w-[200px] rounded-md"
                  />
                  {!message.text && (
                    <p
                      className={`absolute bottom-1 right-1 text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-white ${
                        message.senderId === authUser._id
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
                  className={`inline-flex items-end gap-2 ${
                    message.image ? "max-w-[200px]" : "max-w-full"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-all overflow-hidden">
                    {message.text.trim()}
                  </p>
                  <span
                    className={`text-[9px] shrink-0 self-end relative translate-y-[1px] ${
                      message.senderId === authUser._id
                        ? "text-primary-content/70"
                        : "text-base-content/70"
                    }`}
                  >
                    {formatMessageTime(message.createdAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <MessageInput />
    </div>
  );
};
export default ChatContainer;
