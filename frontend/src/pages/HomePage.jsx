import { useChatStore } from "../store/useChatStore";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { selectedUser, selectedChat } = useChatStore();

  return (
    <div className="h-screen bg-base-200 relative overflow-hidden">
      
      {/* Background Gradients & Icons */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Subtle Gradients */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
          
          {/* Top Left Icon */}
          <div className="absolute top-10 left-10 animate-float-slow opacity-10">
             <div className="bg-primary/20 p-4 rounded-3xl rotate-12 backdrop-blur-sm"></div>
          </div>
          
           {/* Bottom Right Icon */}
          <div className="absolute bottom-10 right-10 animate-float-slow opacity-10">
             <div className="bg-secondary/20 p-6 rounded-full -rotate-12 backdrop-blur-sm"></div>
          </div>

          <div className="absolute top-1/4 left-[5%] w-24 h-24 bg-primary/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-1/4 right-[5%] w-32 h-32 bg-secondary/10 rounded-full blur-xl animate-pulse delay-1000" />
      </div>

      <div className="flex items-center justify-center pt-20 px-4 h-full relative z-10">
        <div className="bg-base-100/80 backdrop-blur-lg rounded-lg shadow-xl w-full max-w-6xl h-[calc(100vh-8rem)] border border-base-200 relative overflow-hidden">
          <div className="flex h-full rounded-lg overflow-hidden">
            <div className={`h-full w-full min-[650px]:w-72 flex-shrink-0 border-r border-base-300 ${selectedChat ? 'hidden min-[650px]:flex' : 'flex'}`}>
               <Sidebar />
            </div>

            <div className={`flex-1 flex flex-col h-full ${!selectedChat ? 'hidden min-[650px]:flex' : 'flex'}`}>
               {!selectedChat && !selectedUser ? <NoChatSelected /> : <ChatContainer />}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-slow { 0% { transform: translateY(0px) rotate(12deg); } 50% { transform: translateY(-20px) rotate(20deg); } 100% { transform: translateY(0px) rotate(12deg); } }
        .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
      `}</style>
    </div>
  );
};
export default HomePage;
