const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12 relative overflow-hidden">
      {/* CSS 3D Animated Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none fade-in">
        <div className="relative w-full h-full">
            {/* Floating Cube 1 */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-3xl animate-float-slow transform rotate-12 backdrop-blur-sm border border-white/10" />
            
            {/* Floating Cube 2 */}
            <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-secondary/10 rounded-full animate-float transform -rotate-12 backdrop-blur-md border border-white/10" />
            
            {/* Floating Cube 3 */}
            <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-accent/10 rounded-xl animate-float-reverse transform rotate-45 backdrop-blur-sm border border-white/10" />
            
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:50px_50px]" />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md text-center relative z-10 bg-base-100/30 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
        <div className="mb-6 grid grid-cols-3 gap-3">
             {[...Array(9)].map((_, i) => (
                <div 
                    key={i} 
                    className={`aspect-square rounded-2xl bg-primary/10 ${i%2===0 ? "animate-pulse" : ""} hover:scale-110 transition-transform duration-500`} 
                />
             ))}
        </div>
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-base-content/60 text-lg">{subtitle}</p>
      </div>

      {/* Inline Styles for Custom Animations */}
      <style>{`
        @keyframes float {
            0% { transform: translateY(0px) rotate(-12deg); }
            50% { transform: translateY(-20px) rotate(-5deg); }
            100% { transform: translateY(0px) rotate(-12deg); }
        }
        @keyframes float-slow {
            0% { transform: translateY(0px) rotate(12deg); }
            50% { transform: translateY(-30px) rotate(20deg); }
            100% { transform: translateY(0px) rotate(12deg); }
        }
        @keyframes float-reverse {
             0% { transform: translateY(0px) rotate(45deg); }
            50% { transform: translateY(20px) rotate(35deg); }
            100% { transform: translateY(0px) rotate(45deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-reverse { animation: float-reverse 7s ease-in-out infinite; }
        .bg-grid-white\/\[0\.02\] { background-image: linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px); }
      `}</style>
    </div>
  );
};

export default AuthImagePattern;
