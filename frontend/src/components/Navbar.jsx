import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageCircleDashed, Settings, User } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageCircleDashed className="w-5 h-5 text-primary" />
              </div>
              <h4 className="text-base font-bold">VibeVox</h4>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {authUser && (
              <Link to={"/profile"} className={` btn-sm gap-2`}>
                <img
                  src={authUser.profilePic || "/avatar.png"}
                  alt="Profile"
                  className="size-8 rounded-full object-cover border-0.1 "
                />
              </Link>
            )}
            <Link
              to={"/settings"}
              className="flex items-center justify-center px-4 py-2 gap-2 transition-colors bg-transparent border-none"
            >
              <Settings className="w-5 h-5" />
            </Link>

            {authUser && (
              <>
                <button className="flex gap-2 items-center" onClick={logout}>
                  <LogOut className="size-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;
