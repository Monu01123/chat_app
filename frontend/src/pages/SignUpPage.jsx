import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Eye, EyeOff, Loader2, Lock, Mail, MessageSquare, User } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    if (!formData.fullName.trim()) return toast.error("Full name is required");
    if (!formData.email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.password) return toast.error("Password is required");
    if (formData.password.length < 6) return toast.error("Password must be at least 6 characters");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const success = validateForm();

    if (success === true) signup(formData);
  };

  return (
    <div className="h-screen pt-20 flex items-center justify-center relative overflow-hidden bg-base-200/50">
      
       {/* 3D Floating Background Icons */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden" style={{ perspective: '1000px' }}>
         {/* Define Gradients */}
         <svg className="absolute w-0 h-0">
            <defs>
                <linearGradient id="grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" /> {/* violet */}
                    <stop offset="100%" stopColor="#ec4899" /> {/* pink */}
                </linearGradient>
                <linearGradient id="grad-secondary" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#06b6d4" /> {/* cyan */}
                    <stop offset="100%" stopColor="#3b82f6" /> {/* blue */}
                </linearGradient>
                <linearGradient id="grad-accent" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" /> {/* amber */}
                    <stop offset="100%" stopColor="#10b981" /> {/* emerald */}
                </linearGradient>
            </defs>
         </svg>

         {/* Top Left - Message Bubble */}
         <div className="absolute top-[10%] left-[5%] animate-float-slow transform-style-3d rotate-12">
            <div className="relative">
                <MessageSquare className="w-32 h-32 absolute top-4 left-4 text-black/10 blur-sm" />
                <MessageSquare className="w-32 h-32 absolute top-2 left-2 text-primary/30" />
                <MessageSquare className="w-32 h-32 drop-shadow-2xl" style={{ stroke: "url(#grad-primary)", strokeWidth: 1.5 }} />
            </div>
         </div>
         
         {/* Top Right - Mail */}
         <div className="absolute top-[15%] right-[10%] animate-float transform-style-3d -rotate-12">
             <div className="relative">
                <Mail className="w-28 h-28 absolute top-4 left-4 text-black/10 blur-sm" />
                <Mail className="w-28 h-28 absolute top-2 left-2 text-secondary/30" />
                <Mail className="w-28 h-28 drop-shadow-2xl" style={{ stroke: "url(#grad-secondary)", strokeWidth: 1.5 }} />
             </div>
         </div>

         {/* Bottom Left - Lock */}
         <div className="absolute bottom-[15%] left-[10%] animate-float-reverse transform-style-3d rotate-6">
             <div className="relative">
                <Lock className="w-24 h-24 absolute top-4 left-4 text-black/10 blur-sm" />
                <Lock className="w-24 h-24 absolute top-2 left-2 text-accent/30" />
                <Lock className="w-24 h-24 drop-shadow-2xl" style={{ stroke: "url(#grad-accent)", strokeWidth: 1.5 }} />
             </div>
         </div>

         {/* Bottom Right - User */}
         <div className="absolute bottom-[20%] right-[5%] animate-float-slow transform-style-3d -rotate-45">
             <div className="relative">
                <div className="absolute top-4 left-4 w-20 h-20 bg-primary/5 rounded-full blur-xl" />
                <User className="w-20 h-20 absolute top-3 left-3 text-black/10 blur-sm" />
                <User className="w-20 h-20 absolute top-1.5 left-1.5 text-primary/30" />
                <User className="w-20 h-20 drop-shadow-2xl" style={{ stroke: "url(#grad-primary)", strokeWidth: 1.5 }} />
             </div>
         </div>

         {/* Random Decorators */}
         <div className="absolute top-1/2 left-[15%] w-8 h-8 rounded-xl bg-gradient-to-br from-primary/40 to-transparent backdrop-blur-md animate-pulse border border-white/20 shadow-lg rotate-12" />
         <div className="absolute top-1/3 right-[20%] w-12 h-12 rounded-full bg-gradient-to-bl from-secondary/40 to-transparent backdrop-blur-md animate-bounce delay-700 border border-white/20 shadow-lg" />
      </div>

      {/* Centered Form Container */}
      <div className="w-full max-w-md bg-base-100/80 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-10 border border-white/20 relative animate-fade-in-up">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex flex-col items-center gap-2 group">
              <div
                className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary/20 to-secondary/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-secondary/30
              transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-xl ring-1 ring-white/50"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg">
                    <MessageSquare className="w-5 h-5 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mt-4 tracking-tighter bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Create Account</h1>
              <p className="text-base-content/60 text-sm">Get started with your free account</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control space-y-1.5">
              <label className="label pl-1">
                <span className="label-text font-medium text-xs uppercase tracking-wider text-base-content/70">Full Name</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-base-content/40 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  className={`input input-bordered w-full pl-10 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-200 bg-base-100/50 border-base-300 rounded-xl`}
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control space-y-1.5">
              <label className="label pl-1">
                <span className="label-text font-medium text-xs uppercase tracking-wider text-base-content/70">Email Address</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-base-content/40 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="email"
                  className={`input input-bordered w-full pl-10 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-200 bg-base-100/50 border-base-300 rounded-xl`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control space-y-1.5">
              <label className="label pl-1">
                <span className="label-text font-medium text-xs uppercase tracking-wider text-base-content/70">Password</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-base-content/40 group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-200 bg-base-100/50 border-base-300 rounded-xl`}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center opacity-70 hover:opacity-100 transition-opacity"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-base-content/40" />
                  ) : (
                    <Eye className="h-5 w-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 transform hover:-translate-y-0.5 rounded-xl bg-gradient-to-r from-primary to-secondary border-none" disabled={isSigningUp}>
              {isSigningUp ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <p className="text-base-content/60 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="link link-primary font-semibold hover:no-underline relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-primary hover:after:w-full after:transition-all after:duration-300">
                Sign in
              </Link>
            </p>
          </div>
        </div>
       
       {/* Styles for simple floating animation */}
      <style>{`
        @keyframes float { 0% { transform: translateY(0px) rotate(-12deg); } 50% { transform: translateY(-20px) rotate(-5deg); } 100% { transform: translateY(0px) rotate(-12deg); } }
        @keyframes float-slow { 0% { transform: translateY(0px) rotate(12deg); } 50% { transform: translateY(-30px) rotate(20deg); } 100% { transform: translateY(0px) rotate(12deg); } }
        @keyframes float-reverse { 0% { transform: translateY(0px) rotate(-6deg); } 50% { transform: translateY(20px) rotate(5deg); } 100% { transform: translateY(0px) rotate(-6deg); } }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 7s ease-in-out infinite; }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
        .transform-style-3d { transform-style: preserve-3d; }
      `}</style>
    </div>
  );
};
export default SignUpPage;
