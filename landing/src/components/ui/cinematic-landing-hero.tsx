import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import styles from "./cinematic-landing-hero.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/* ===================================================================
   SVG Icon Components (replacing emojis — UI/UX Pro Max rule)
   =================================================================== */
const AntennaIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20v-6" />
    <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    <path d="M7.5 7.5a6.36 6.36 0 0 1 9 0" />
    <path d="M5.1 5.1a10 10 0 0 1 13.8 0" />
    <path d="M16.5 7.5a6.36 6.36 0 0 0-9 0" />
    <path d="M18.9 5.1a10 10 0 0 0-13.8 0" />
  </svg>
);

const FlameIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
  </svg>
);

/* ===================================================================
   Component
   =================================================================== */
export interface CinematicHeroProps extends React.HTMLAttributes<HTMLElement> {}

export function CinematicHero({ className, ...props }: CinematicHeroProps) {
  const containerRef = useRef<HTMLElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  // Mouse interaction for card sheen + phone 3D tilt
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.scrollY > window.innerHeight * 2) return;
      cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(() => {
        if (mainCardRef.current && mockupRef.current) {
          const rect = mainCardRef.current.getBoundingClientRect();
          mainCardRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
          mainCardRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
          const xVal = (e.clientX / window.innerWidth - 0.5) * 2;
          const yVal = (e.clientY / window.innerHeight - 0.5) * 2;
          gsap.to(mockupRef.current, { rotationY: xVal * 12, rotationX: -yVal * 12, ease: "power3.out", duration: 1.2 });
        }
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => { window.removeEventListener("mousemove", handleMouseMove); cancelAnimationFrame(requestRef.current); };
  }, []);

  // Cinematic scroll timeline with prefers-reduced-motion support
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      // Show everything instantly — no animations
      gsap.set(".text-track, .text-days, .main-card, .card-left-text, .card-right-text, .mockup-scroll-wrapper, .floating-badge, .phone-widget, .cta-wrapper", { autoAlpha: 1, clearProps: "all" });
      return;
    }

    const isMobile = window.innerWidth < 768;
    const ctx = gsap.context(() => {
      gsap.set(".text-track", { autoAlpha: 0, y: 60, scale: 0.85, filter: "blur(20px)", rotationX: -20 });
      gsap.set(".text-days", { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" });
      gsap.set(".main-card", { y: window.innerHeight + 200, autoAlpha: 1 });
      gsap.set([".card-left-text", ".card-right-text", ".mockup-scroll-wrapper", ".floating-badge", ".phone-widget"], { autoAlpha: 0 });
      gsap.set(".cta-wrapper", { autoAlpha: 0, scale: 0.8, filter: "blur(30px)" });

      // Intro animation
      const introTl = gsap.timeline({ delay: 0.3 });
      introTl
        .to(".text-track", { duration: 1.8, autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", rotationX: 0, ease: "expo.out" })
        .to(".text-days", { duration: 1.4, clipPath: "inset(0 0% 0 0)", ease: "power4.inOut" }, "-=1.0");

      // Scroll timeline — 3500px (was 7000px)
      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=3500",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      scrollTl
        .to([".hero-text-wrapper", `.${styles.bgGrid}`], { scale: 1.15, filter: "blur(20px)", opacity: 0.2, ease: "power2.inOut", duration: 2 }, 0)
        .to(".main-card", { y: 0, ease: "power3.inOut", duration: 2 }, 0)
        .to(".main-card", { width: "100%", height: "100%", borderRadius: "0px", ease: "power3.inOut", duration: 1.5 })
        .fromTo(".mockup-scroll-wrapper",
          { y: 300, z: -500, rotationX: 50, rotationY: -30, autoAlpha: 0, scale: 0.6 },
          { y: 0, z: 0, rotationX: 0, rotationY: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 2 }, "-=0.5"
        )
        .fromTo(".phone-widget", { y: 40, autoAlpha: 0, scale: 0.95 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.12, ease: "back.out(1.2)", duration: 1.2 }, "-=1.2")
        .to(`.${styles.progressRing}`, { strokeDashoffset: 60, duration: 1.5, ease: "power3.inOut" }, "-=1")
        .to(".counter-val", { innerHTML: 2000, snap: { innerHTML: 1 }, duration: 1.5, ease: "expo.out" }, "-=1.5")
        .fromTo(".floating-badge", { y: 80, autoAlpha: 0, scale: 0.7, rotationZ: -10 }, { y: 0, autoAlpha: 1, scale: 1, rotationZ: 0, ease: "back.out(1.5)", duration: 1.2, stagger: 0.15 }, "-=1.5")
        .fromTo(".card-left-text", { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: "power4.out", duration: 1.2 }, "-=1.2")
        .fromTo(".card-right-text", { x: 50, autoAlpha: 0, scale: 0.8 }, { x: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 1.2 }, "<")
        .to({}, { duration: 1.5 })
        .set(".hero-text-wrapper", { autoAlpha: 0 })
        .set(".cta-wrapper", { autoAlpha: 1 })
        .to({}, { duration: 1 })
        .to([".mockup-scroll-wrapper", ".floating-badge", ".card-left-text", ".card-right-text"], {
          scale: 0.9, y: -40, z: -200, autoAlpha: 0, ease: "power3.in", duration: 1, stagger: 0.04,
        })
        .to(".main-card", {
          width: isMobile ? "92vw" : "85vw",
          height: isMobile ? "92vh" : "85vh",
          borderRadius: isMobile ? "32px" : "40px",
          ease: "expo.inOut", duration: 1.5
        }, "pullback")
        .to(".cta-wrapper", { scale: 1, filter: "blur(0px)", ease: "expo.inOut", duration: 1.5 }, "pullback")
        .to(".main-card", { y: -window.innerHeight - 300, ease: "power3.in", duration: 1.2 });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={containerRef}
      className={cn("relative w-screen h-screen overflow-hidden flex items-center justify-center bg-midnight text-purple-mist font-body antialiased", className)}
      style={{ perspective: "1500px" }}
      {...props}
    >
      {/* Environment */}
      <div className={styles.filmGrain} aria-hidden="true" />
      <div className={cn(styles.bgGrid, "absolute inset-0 z-0 pointer-events-none opacity-50")} aria-hidden="true" />

      {/* Ambient glow behind phone — unique to UNJYNX */}
      <div className={styles.ambientGlow} style={{ top: "30%", left: "50%", transform: "translateX(-50%)" }} aria-hidden="true" />

      {/* ---- BACKGROUND LAYER: Hero Text ---- */}
      <div className="hero-text-wrapper absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4" style={{ transformStyle: "preserve-3d" }}>
        <h1 className="font-heading font-bold tracking-tight mb-2">
          <span className={cn("text-track", styles.gsapHidden, styles.text3dMatte, "block text-5xl md:text-7xl lg:text-[6rem]")}>
            Break the
          </span>
          <span className={cn("text-days", styles.gsapHidden, styles.textGoldMatte, "block text-5xl md:text-7xl lg:text-[6rem] font-extrabold tracking-tighter")}>
            satisfactory.
          </span>
        </h1>
        {/* Accessible full text for screen readers and Playwright tests */}
        <p className="sr-only">UNJYNX — Break the satisfactory. Unjynx your productivity.</p>
      </div>

      {/* ---- BACKGROUND LAYER 2: CTA ---- */}
      <div className={cn("cta-wrapper absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4 pointer-events-auto", styles.gsapHidden)}>
        <h2 className={cn("text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 tracking-tight", styles.textVioletMatte)}>
          Unjynx your productivity.
        </h2>
        <p className="text-purple-mist/50 text-lg md:text-xl mb-12 max-w-xl mx-auto font-light leading-relaxed">
          Join thousands already using UNJYNX to break through satisfactory and take control of their tasks.
        </p>
        <div className="flex flex-col sm:flex-row gap-6">
          <a
            href="#"
            aria-label="Download on App Store"
            className={cn(styles.btnLight, "flex items-center justify-center gap-3 px-8 py-4 rounded-[1.25rem] group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-midnight")}
          >
            <svg className="w-8 h-8 transition-transform duration-200 group-hover:scale-105" fill="currentColor" viewBox="0 0 384 512" aria-hidden="true">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
            </svg>
            <div className="text-left">
              <div className="text-[10px] font-bold tracking-wider text-neutral-500 uppercase mb-[-2px]">Download on the</div>
              <div className="text-xl font-bold leading-none tracking-tight">App Store</div>
            </div>
          </a>
          <a
            href="#"
            aria-label="Get it on Google Play"
            className={cn(styles.btnDark, "flex items-center justify-center gap-3 px-8 py-4 rounded-[1.25rem] group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-midnight")}
          >
            <svg className="w-7 h-7 transition-transform duration-200 group-hover:scale-105" fill="currentColor" viewBox="0 0 512 512" aria-hidden="true">
              <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
            </svg>
            <div className="text-left">
              <div className="text-[10px] font-bold tracking-wider text-neutral-400 uppercase mb-[-2px]">Get it on</div>
              <div className="text-xl font-bold leading-none tracking-tight">Google Play</div>
            </div>
          </a>
        </div>
      </div>

      {/* ---- FOREGROUND LAYER: Deep Card ---- */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none" style={{ perspective: "1500px" }}>
        <div
          ref={mainCardRef}
          className={cn("main-card relative overflow-hidden flex items-center justify-center pointer-events-auto w-[92vw] md:w-[85vw] h-[92vh] md:h-[85vh] rounded-[32px] md:rounded-[40px]", styles.premiumCard, styles.gsapHidden)}
        >
          <div className={styles.cardSheen} aria-hidden="true" />

          {/* Responsive Grid */}
          <div className="relative w-full h-full max-w-7xl mx-auto px-4 lg:px-12 flex flex-col justify-evenly lg:grid lg:grid-cols-3 items-center lg:gap-8 z-10 py-6 lg:py-0">

            {/* Brand Name */}
            <div className="card-right-text order-1 lg:order-3 flex justify-center lg:justify-end z-20 w-full" style={{ visibility: "hidden" }}>
              <span className={cn("text-6xl md:text-[6rem] lg:text-[8rem] font-heading font-black uppercase tracking-tighter", styles.textCardSilver)}>
                UNJYNX
              </span>
            </div>

            {/* iPhone Mockup */}
            <div className="mockup-scroll-wrapper order-2 lg:order-2 relative w-full h-[380px] lg:h-[600px] flex items-center justify-center z-10" style={{ perspective: "1000px" }}>
              <div className="relative w-full h-full flex items-center justify-center transform scale-[0.65] md:scale-[0.85] lg:scale-100">

                {/* Phone */}
                <div
                  ref={mockupRef}
                  className={cn("relative w-[280px] h-[580px] rounded-[3rem] flex flex-col will-change-transform", styles.iphoneBezel)}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Hardware Buttons */}
                  <div className={cn("absolute top-[120px] -left-[3px] w-[3px] h-[25px] rounded-l-md z-0", styles.hardwareBtn)} aria-hidden="true" />
                  <div className={cn("absolute top-[160px] -left-[3px] w-[3px] h-[45px] rounded-l-md z-0", styles.hardwareBtn)} aria-hidden="true" />
                  <div className={cn("absolute top-[220px] -left-[3px] w-[3px] h-[45px] rounded-l-md z-0", styles.hardwareBtn)} aria-hidden="true" />
                  <div className={cn("absolute top-[170px] -right-[3px] w-[3px] h-[70px] rounded-r-md z-0", styles.hardwareBtn)} style={{ transform: "scaleX(-1)" }} aria-hidden="true" />

                  {/* Screen */}
                  <div className="absolute inset-[7px] bg-[#050914] rounded-[2.5rem] overflow-hidden text-white z-10" style={{ boxShadow: "inset 0 0 15px rgba(0,0,0,1)" }}>
                    <div className={cn("absolute inset-0 z-40 pointer-events-none", styles.screenGlare)} aria-hidden="true" />

                    {/* Dynamic Island */}
                    <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-50 flex items-center justify-end px-3" style={{ boxShadow: "inset 0 -1px 2px rgba(255,255,255,0.1)" }} aria-hidden="true">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" style={{ boxShadow: "0 0 8px rgba(255, 215, 0, 0.8)" }} />
                    </div>

                    {/* App Content — REAL content, not skeleton */}
                    <div className="relative w-full h-full pt-12 px-5 pb-8 flex flex-col">
                      {/* Header */}
                      <div className="phone-widget flex justify-between items-center mb-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-rich-gold uppercase tracking-widest font-bold mb-1">Today</span>
                          <span className="text-xl font-heading font-bold tracking-tight text-white drop-shadow-md">My Tasks</span>
                        </div>
                        <div className="w-9 h-9 rounded-full bg-violet-dim flex items-center justify-center font-bold text-sm border border-violet/30 text-purple-mist" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>U</div>
                      </div>

                      {/* Progress Ring — "2000+" Active Users */}
                      <div className="phone-widget relative w-44 h-44 mx-auto flex items-center justify-center mb-6" style={{ filter: "drop-shadow(0 15px 25px rgba(0,0,0,0.8))" }}>
                        <svg className="absolute inset-0 w-full h-full" aria-hidden="true">
                          <circle cx="88" cy="88" r="64" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                          <circle className={styles.progressRing} cx="88" cy="88" r="64" fill="none" stroke="#FFD700" strokeWidth="12" />
                        </svg>
                        <div className="text-center z-10 flex flex-col items-center">
                          <span className="counter-val text-4xl font-extrabold tracking-tighter text-white">0</span>
                          <span className="text-[8px] text-gold/50 uppercase tracking-[0.1em] font-bold mt-0.5">Active Users</span>
                        </div>
                      </div>

                      {/* REAL task items — not skeleton bars */}
                      <div className="space-y-3">
                        <div className={cn("phone-widget rounded-2xl p-3 flex items-center", styles.widgetDepth)}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 border border-emerald-400/20 shadow-inner" style={{ background: "linear-gradient(to bottom right, rgba(37, 211, 102, 0.2), rgba(37, 211, 102, 0.05))" }}>
                            <svg className="w-4 h-4 text-emerald-400 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold text-white/90 truncate">Review sprint backlog</p>
                            <p className="text-[9px] text-white/40 mt-0.5">via WhatsApp &middot; 2m ago</p>
                          </div>
                          <div className="w-5 h-5 rounded-full border-2 border-gold/40 flex items-center justify-center ml-2">
                            <svg className="w-3 h-3 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                          </div>
                        </div>
                        <div className={cn("phone-widget rounded-2xl p-3 flex items-center", styles.widgetDepth)}>
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center mr-3 border border-violet/20 shadow-inner" style={{ background: "linear-gradient(to bottom right, rgba(108, 92, 231, 0.2), rgba(108, 92, 231, 0.05))" }}>
                            <svg className="w-4 h-4 text-violet drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-semibold text-white/90 truncate">Push hotfix to staging</p>
                            <p className="text-[9px] text-white/40 mt-0.5">via Telegram &middot; 15m ago</p>
                          </div>
                          <div className="w-5 h-5 rounded-full border-2 border-white/10 ml-2" />
                        </div>
                      </div>

                      {/* Home indicator */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-[4px] bg-white/20 rounded-full" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.5)" }} aria-hidden="true" />
                    </div>
                  </div>
                </div>

                {/* Floating Badges — SVG icons, no emojis */}
                <div className={cn("floating-badge absolute flex top-6 lg:top-12 left-[-15px] lg:left-[-80px] rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 lg:gap-4 z-30", styles.floatingBadge)}>
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border border-gold/30 shadow-inner" style={{ background: "linear-gradient(to bottom, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.05))" }}>
                    <AntennaIcon className="w-4 h-4 lg:w-5 lg:h-5 text-gold drop-shadow-lg" />
                  </div>
                  <div>
                    <p className="text-white text-xs lg:text-sm font-bold tracking-tight">7 Channels</p>
                    <p className="text-gold/50 text-[10px] lg:text-xs font-medium">All connected</p>
                  </div>
                </div>

                <div className={cn("floating-badge absolute flex bottom-12 lg:bottom-20 right-[-15px] lg:right-[-80px] rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 lg:gap-4 z-30", styles.floatingBadge)}>
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border border-violet/30 shadow-inner" style={{ background: "linear-gradient(to bottom, rgba(108, 92, 231, 0.2), rgba(108, 92, 231, 0.05))" }}>
                    <FlameIcon className="w-4 h-4 lg:w-5 lg:h-5 text-violet drop-shadow-lg" />
                  </div>
                  <div>
                    <p className="text-white text-xs lg:text-sm font-bold tracking-tight">Streak Active</p>
                    <p className="text-violet/50 text-[10px] lg:text-xs font-medium">14 days strong</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Description Text */}
            <div className="card-left-text order-3 lg:order-1 flex flex-col justify-center text-center lg:text-left z-20 w-full lg:max-w-none px-4 lg:px-0" style={{ visibility: "hidden" }}>
              <h3 className="text-white text-2xl md:text-3xl lg:text-4xl font-heading font-bold mb-0 lg:mb-5 tracking-tight">
                Reminders, reimagined.
              </h3>
              <p className="hidden md:block text-purple-mist/55 text-sm md:text-base lg:text-lg font-normal leading-relaxed mx-auto lg:mx-0 max-w-sm lg:max-w-none">
                <span className="text-white font-semibold">UNJYNX</span> reaches you across WhatsApp, Telegram, Instagram, SMS, Discord, Slack, and Email — so no task ever slips through the cracks.
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
