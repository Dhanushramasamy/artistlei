import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center p-6 bg-[#020205] overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/20 blur-[120px] pointer-events-none animate-float" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/15 blur-[100px] pointer-events-none" />
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(2,2,5,0.8)_100%)] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center">
        {/* Animated Brand Mark */}
        <div className="relative mb-10 group">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary to-secondary rounded-[24px] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
          <div className="relative w-20 h-20 glass flex items-center justify-center rounded-[24px] text-4xl border-white/20 shadow-2xl">
            🎨
          </div>
        </div>

        <h1 className="brand-font text-5xl md:text-7xl font-black mb-4 tracking-tight">
          Artist<span className="gradient-text">Lei</span>
        </h1>
        
        <p className="text-lg md:text-xl text-white/50 max-w-lg mb-12 font-medium leading-relaxed">
          The ultimate tracing tool for muralists and painters. 
          Connect your camera and monitor in seconds.
        </p>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          {/* Static Device - THE CAMERA */}
          <Link href="/static-device" className="group h-full">
            <div className="h-full glass gradient-border p-8 text-left transition-all hover:scale-[1.02] active:scale-[0.98]">
              <div className="text-4xl mb-6 flex items-center justify-between">
                <span>📱</span>
                <span className="text-xs font-bold tracking-widest uppercase py-1 px-3 glass-pill text-secondary border-secondary/20">
                  Control Hub
                </span>
              </div>
              <h2 className="brand-font text-2xl font-bold mb-3 text-secondary">Camera & Projector</h2>
              <p className="text-sm text-white/40 leading-relaxed mb-8">
                The device on your tripod. Point the camera, upload your reference, 
                adjust opacity/size, and beam it to your monitor.
              </p>
              <div className="btn-primary w-full py-4 rounded-xl text-center text-sm tracking-wide uppercase font-bold">
                Launch Hub →
              </div>
            </div>
          </Link>

          {/* Handy Device - THE MONITOR */}
          <Link href="/handy" className="group h-full">
            <div className="h-full glass p-8 text-left border-white/5 transition-all hover:scale-[1.02] active:scale-[0.98] hover:bg-white/5">
              <div className="text-4xl mb-6 flex items-center justify-between">
                <span>🖼️</span>
                <span className="text-xs font-bold tracking-widest uppercase py-1 px-3 glass-pill text-primary border-primary/20">
                  Monitor
                </span>
              </div>
              <h2 className="brand-font text-2xl font-bold mb-3 text-primary">Tracing Lightbox</h2>
              <p className="text-sm text-white/40 leading-relaxed mb-8">
                The screen you trace from. A passive, zero-touch fullscreen 
                receiver that stays clean and focused on your art.
              </p>
              <div className="glass-pill w-full py-4 text-center text-sm tracking-wide uppercase font-bold border-white/10 group-hover:border-primary/40 transition-colors">
                Open Lightbox →
              </div>
            </div>
          </Link>
        </div>

        {/* Footer Meta */}
        <div className="mt-16 flex flex-col items-center gap-4">
          <div className="flex items-center gap-6 text-xs font-bold tracking-[0.2em] uppercase text-white/20">
            <span>Real-time Sync</span>
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <span>P2P WebRTC</span>
            <div className="w-1 h-1 rounded-full bg-white/10" />
            <span>Encrypted Connection</span>
          </div>
          <p className="text-[10px] text-white/10 max-w-xs leading-loose">
            Optimized for Muralists, Fine Artists, and Sketchers. 
            Designed for professional tripod workflows.
          </p>
        </div>
      </div>
    </main>
  );
}
