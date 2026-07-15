"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, useMotionValue, useSpring, useScroll, useTransform, AnimatePresence } from "motion/react";
import { useReducedMotion } from "motion/react";
import { Spotlight, WobbleCard, Marquee, BackgroundBeamsWithCollision } from "@workspace/ui";

/* ───────────────────────────────────────────
   Icons (inline SVG to keep deps minimal)
   ─────────────────────────────────────────── */

function IconCommand({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
    </svg>
  );
}

function IconGithub({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function IconSun({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="M4.93 4.93l1.41 1.41" /><path d="M17.66 17.66l1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="M6.34 17.66l-1.41 1.41" /><path d="M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function IconMoon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function IconArrowUpRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 7h10v10" /><path d="M7 17 17 7" />
    </svg>
  );
}

function IconDownload({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" />
    </svg>
  );
}

function IconTerminal({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 17l6-6-6-6" /><path d="M12 19h8" />
    </svg>
  );
}

function IconCheckSquare({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 11 3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function IconShare({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="m16 6-4-4-4 4" /><path d="M12 2v13" />
    </svg>
  );
}

function IconBox({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.27 6.96 12 12.01l8.73-5.05" /><path d="M12 22.08V12" />
    </svg>
  );
}

function IconTimeline({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </svg>
  );
}

function IconArrowDown({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14" /><path d="M19 12l-7 7-7-7" />
    </svg>
  );
}

/* ───────────────────────────────────────────
   Types
   ─────────────────────────────────────────── */

type Theme = "light" | "dark";

interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
}

/* ───────────────────────────────────────────
   Theme Toggle
   ─────────────────────────────────────────── */

function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "light" || stored === "dark") {
      applyTheme(stored);
      setTheme(stored);
    } else if (window.matchMedia("(prefers-color-scheme: light)").matches) {
      applyTheme("light");
      setTheme("light");
    }
  }, []);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem("theme", next);
      return next;
    });
  }, []);

  return { theme, toggle };
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex size-9 items-center justify-center rounded-xl border border-border/50 bg-card/50 text-muted-foreground transition-colors hover:border-muted-foreground/30 hover:text-foreground backdrop-blur-sm"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <AnimatePresence mode="wait">
        {theme === "dark" ? (
          <motion.span key="sun" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
            <IconSun className="size-4" />
          </motion.span>
        ) : (
          <motion.span key="moon" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
            <IconMoon className="size-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ───────────────────────────────────────────
   Navbar
   ─────────────────────────────────────────── */

function Navbar() {
  const { theme, toggle } = useTheme();
  const prefersReduced = useReducedMotion();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const unsubscribe = scrollY.on("change", (latest) => {
      setScrolled(latest > 20);
    });
    return unsubscribe;
  }, [scrollY]);

  return (
    <motion.nav
      initial={prefersReduced ? undefined : { y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-3 transition-all duration-500 sm:px-10 ${
        scrolled
          ? "border-b border-border/30 bg-background/70 backdrop-blur-2xl"
          : "bg-transparent"
      }`}
    >
      <motion.a
        href="#"
        className="flex items-center gap-2.5 text-sm font-semibold tracking-tight"
        whileHover={{ scale: 1.02 }}
      >
        <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/20">
          <IconCommand className="size-4" />
        </div>
        <span className="hidden sm:inline">Dev Project Organizer</span>
      </motion.a>

      <div className="flex items-center gap-1.5 sm:gap-3">
        <NavLink href="#features">Features</NavLink>
        <NavLink href="https://github.com" external icon={<IconGithub className="size-4" />}>GitHub</NavLink>
        <NavLink href="https://github.com/gourav-1711/project-manager/releases" external>Releases</NavLink>
        <ThemeToggle theme={theme} onToggle={toggle} />
        <motion.a
          href="#download"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all hover:opacity-90 shadow-lg shadow-accent/20"
        >
          Get Started
          <IconArrowUpRight className="size-3.5" />
        </motion.a>
      </div>
    </motion.nav>
  );
}

function NavLink({ href, children, external, icon }: { href: string; children: React.ReactNode; external?: boolean; icon?: React.ReactNode }) {
  return (
    <motion.a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {icon}{children}
    </motion.a>
  );
}

/* ───────────────────────────────────────────
   Hero Section
   ─────────────────────────────────────────── */

function HeroSection() {
  const [mounted, setMounted] = useState(false);
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Parallax mouse tracking
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [mouseX, mouseY]);

  const glowX = useTransform(mouseX, [0, 1], ["30%", "70%"]);
  const glowY = useTransform(mouseY, [0, 1], ["30%", "70%"]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const } },
  };

  const shouldAnimate = !prefersReduced && mounted;

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-32 sm:px-10"
    >
      {/* Animated grid background */}
      <motion.div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(rgba(128,128,128,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,0.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
        animate={prefersReduced ? {} : { backgroundPosition: ["0px 0px", "32px 32px"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      />

      {/* Aceternity Spotlight */}
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="#818cf8" />

      {/* Interactive radial gradients that follow mouse */}
      <motion.div
        className="pointer-events-none absolute top-1/2 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px]"
        style={{
          left: glowX,
          top: glowY,
          background: "radial-gradient(circle, rgba(129,140,248,0.15) 0%, transparent 70%)",
        }}
      />
      <motion.div
        className="pointer-events-none absolute right-1/4 h-[400px] w-[400px] rounded-full blur-[120px]"
        style={{
          left: useTransform(mouseX, [0, 1], ["60%", "80%"]),
          top: useTransform(mouseY, [0, 1], ["20%", "40%"]),
          background: "radial-gradient(circle, rgba(192,132,252,0.1) 0%, transparent 70%)",
        }}
      />

      <motion.div
        variants={containerVariants}
        initial={shouldAnimate ? "hidden" : false}
        animate={shouldAnimate ? "visible" : false}
        className="relative flex max-w-3xl flex-col items-center gap-8 text-center"
      >
        {/* Badge */}
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/40 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-muted-foreground"
        >
          <motion.span
            className="size-1.5 rounded-full bg-emerald-500"
            animate={prefersReduced ? {} : { scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          Open source desktop app
          <span className="ml-1 rounded bg-muted/50 px-1.5 py-0.5 text-[10px]">v0.1</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl"
        >
          <span className="gradient-text">Your projects,</span>
          <br />
          <span className="gradient-text-accent">one click away</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="max-w-xl text-base leading-relaxed text-muted-foreground/90 sm:text-lg"
        >
          Stop losing time jumping between projects, terminals, and IDEs.
          Dev Project Organizer brings your project tools into one lightweight
          desktop app.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center gap-4 sm:flex-row"
          id="download"
        >
          <motion.a
            href="#download"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="group relative inline-flex h-12 items-center gap-2.5 overflow-hidden rounded-xl bg-accent px-8 text-sm font-semibold text-accent-foreground transition-all hover:opacity-90 shadow-xl shadow-accent/25"
          >
            <motion.span
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
            <span className="relative flex items-center gap-2">
              Download for macOS
              <IconDownload className="size-4" />
            </span>
          </motion.a>
          <motion.a
            href="#features"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm px-8 text-sm font-medium text-muted-foreground transition-all hover:border-muted-foreground/30 hover:text-foreground hover:bg-card/50"
          >
            See features
          </motion.a>
        </motion.div>

        {/* Platforms */}
        <motion.p
          variants={itemVariants}
          className="text-xs text-muted-foreground/40"
        >
          macOS · Windows · Linux · Free & open source
        </motion.p>

        {/* Animated scroll indicator */}
        <motion.div
          variants={itemVariants}
          className="mt-8"
          animate={prefersReduced ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <IconArrowDown className="size-5 text-muted-foreground/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ───────────────────────────────────────────
   ScrollReveal wrapper
   ─────────────────────────────────────────── */

function ScrollReveal({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={prefersReduced ? false : { opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ───────────────────────────────────────────
   Feature Card
   ─────────────────────────────────────────── */

function FeatureCard({ icon, title, description, index }: FeatureItem & { index: number }) {
  const prefersReduced = useReducedMotion();
  const cardRef = useRef<HTMLDivElement>(null);

  // Magnetic hover effect
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (prefersReduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(px * 8);
    y.set(py * 8);
  }, [prefersReduced, x, y]);

  const handlePointerLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return (
    <ScrollReveal delay={index * 0.1}>
      <motion.div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        style={{ x: springX, y: springY }}
        className="group relative flex flex-col gap-4 rounded-2xl border border-border/50 bg-card/40 p-6 backdrop-blur-sm transition-colors duration-300 hover:border-muted-foreground/20 hover:bg-card/60 sm:p-8"
      >
        {/* Hover glow */}
        <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-indigo-500/5 to-transparent" />
        </div>

        <motion.div
          className="relative flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/10 to-fuchsia-500/10 text-muted-foreground transition-colors duration-300 group-hover:text-foreground"
          whileHover={{ scale: 1.05 }}
        >
          {icon}
        </motion.div>

        <h3 className="relative text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h3>

        <p className="relative text-sm leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
          {description}
        </p>

        {/* Subtle corner accent */}
        <div className="pointer-events-none absolute top-0 right-0 size-16 overflow-hidden rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="absolute -top-8 -right-8 size-16 rotate-45 bg-gradient-to-br from-indigo-500/10 to-transparent" />
        </div>
      </motion.div>
    </ScrollReveal>
  );
}

/* ───────────────────────────────────────────
   Features Section
   ─────────────────────────────────────────── */

const features: FeatureItem[] = [
  {
    icon: <IconTerminal className="size-5" />,
    title: "Project Registry & Quick Launch",
    description: "Register any local project and launch it in VS Code, your terminal, or Finder with one click. No more digging through folders or remembering paths.",
  },
  {
    icon: <IconCheckSquare className="size-5" />,
    title: "Todos & Error Tracking",
    description: "Per-project todo lists for quick capture and a structured error log with severity levels. Keep track of what needs doing and what's broken, separately.",
  },
  {
    icon: <IconShare className="size-5" />,
    title: "Mobile Share",
    description: "Spin up a local HTTP server, scan the QR code with your phone, and send text or images to your laptop over Wi-Fi. No cloud, no setup, no data leaving your machine.",
  },
  {
    icon: <IconBox className="size-5" />,
    title: "Skills Manager",
    description: "Browse and install AI agent skills into any project via npm. A curated catalog of reusable agent capabilities — from design taste to database setup — installable in one click.",
  },
  {
    icon: <IconTimeline className="size-5" />,
    title: "Timeline Planning",
    description: "Plan project milestones and phases with a dated timeline view. Group items by month, track status per milestone, and keep planning separate from quick-capture todos.",
  },
];

function FeaturesSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="features"
      className="relative mx-auto flex max-w-6xl flex-col items-center gap-16 px-6 py-24 sm:px-10 sm:py-32"
    >
      {/* Section header */}
      <ScrollReveal className="flex max-w-2xl flex-col items-center gap-4 text-center">
        <motion.div
          className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/40 backdrop-blur-sm px-4 py-1.5 text-xs font-medium text-muted-foreground"
          whileHover={{ scale: 1.02 }}
        >
          Everything you need
        </motion.div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Built for the way you actually work
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          Five integrated features that cover the daily workflow of any developer
          managing multiple projects.
        </p>
      </ScrollReveal>

      {/* Feature grid */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, i) => (
          <FeatureCard key={feature.title} {...feature} index={i} />
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────
   Marquee Showcase
   ─────────────────────────────────────────── */

interface MarqueeItem {
  icon: React.ReactNode;
  label: string;
}

const marqueeItems: MarqueeItem[] = [
  { icon: <IconTerminal className="size-4" />, label: "Quick Launch" },
  { icon: <IconCheckSquare className="size-4" />, label: "Todo Lists" },
  { icon: <IconShare className="size-4" />, label: "Mobile Share" },
  { icon: <IconBox className="size-4" />, label: "Skills Manager" },
  { icon: <IconTimeline className="size-4" />, label: "Timeline Planning" },
  { icon: <IconGithub className="size-4" />, label: "Open Source" },
  { icon: <IconCommand className="size-4" />, label: "Tauri Native" },
  { icon: <IconDownload className="size-4" />, label: "Cross Platform" },
];

function MarqueeShowcase() {
  const prefersReduced = useReducedMotion();

  const card = (item: MarqueeItem) => (
    <div className="mx-2 flex items-center gap-2.5 rounded-xl border border-border/40 bg-card/30 px-4 py-2.5 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-colors duration-300 hover:border-indigo-500/30 hover:text-foreground">
      <span className="text-indigo-400">{item.icon}</span>
      <span>{item.label}</span>
    </div>
  );

  if (prefersReduced) {
    return (
      <section className="relative mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 px-6 py-16 sm:px-10">
        {marqueeItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-card/30 px-4 py-2.5 text-sm font-medium text-muted-foreground"
          >
            <span className="text-indigo-400">{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="relative mx-auto max-w-6xl overflow-hidden px-6 py-16 sm:px-10">
      <ScrollReveal className="flex flex-col gap-6">
        {/* First row — scrolls left */}
        <Marquee pauseOnHover repeat={3}>
          {marqueeItems.map((item) => (
            <div key={item.label}>
              {card(item)}
            </div>
          ))}
        </Marquee>
        {/* Second row — scrolls right */}
        <Marquee reverse pauseOnHover repeat={3}>
          {marqueeItems.map((item) => (
            <div key={item.label}>
              {card(item)}
            </div>
          ))}
        </Marquee>
      </ScrollReveal>
    </section>
  );
}

/* ───────────────────────────────────────────
   Stats Section
   ─────────────────────────────────────────── */

const stats = [
  { value: "100%", label: "TypeScript" },
  { value: "7", label: "Integrated features" },
  { value: "0", label: "Cloud dependencies" },
  { value: "Free", label: "Open source (MIT)" },
];

function StatsSection() {
  return (
    <section className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 py-20 sm:px-10 sm:py-28">
      <ScrollReveal className="grid w-full grid-cols-2 gap-6 sm:grid-cols-4">
        {stats.map((stat, i) =>
          i === 0 ? (
            <WobbleCard key={stat.label} containerClassName="!bg-indigo-500/10 border-0 !rounded-2xl" className="!px-4 !py-10 !pb-10 flex flex-col items-center gap-2">
              <span className="text-3xl font-bold tracking-tight gradient-text-accent sm:text-4xl">
                {stat.value}
              </span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </WobbleCard>
          ) : (
            <motion.div
              key={stat.label}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border/30 bg-card/20 py-10 backdrop-blur-sm"
              whileHover={{ scale: 1.03, borderColor: "rgba(129,140,248,0.2)" }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <span className="text-3xl font-bold tracking-tight gradient-text-accent sm:text-4xl">
                {stat.value}
              </span>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </motion.div>
          )
        )}
      </ScrollReveal>
    </section>
  );
}

/* ───────────────────────────────────────────
   CTA Section
   ─────────────────────────────────────────── */

function CTASection() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="relative flex items-center justify-center overflow-hidden px-6 py-24 sm:py-32">
      <div className="absolute inset-0">
        <BackgroundBeamsWithCollision className="h-full w-full bg-transparent from-transparent to-transparent dark:from-transparent dark:to-transparent">
          <div />
        </BackgroundBeamsWithCollision>
      </div>
      <ScrollReveal className="relative z-10 flex max-w-2xl flex-col items-center gap-8 rounded-3xl border border-border/40 bg-gradient-to-b from-card/60 to-card/20 px-8 py-16 text-center backdrop-blur-sm sm:px-16">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute -inset-20 rounded-3xl bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent blur-3xl" />

        <motion.div
          className="relative"
          initial={prefersReduced ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to tidy up your dev life?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Download the app, add your first project, and see the difference
            that one-click access makes.
          </p>
        </motion.div>

        <motion.a
          href="#download"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="group relative inline-flex h-12 items-center gap-2.5 overflow-hidden rounded-xl bg-accent px-8 text-sm font-semibold text-accent-foreground transition-all hover:opacity-90 shadow-xl shadow-accent/25"
        >
          <motion.span
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
          <span className="relative flex items-center gap-2">
            Download for free
            <IconDownload className="size-4" />
          </span>
        </motion.a>
      </ScrollReveal>
    </section>
  );
}

/* ───────────────────────────────────────────
   Footer
   ─────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-border/30 px-6 py-12 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-white">
            <IconCommand className="size-3.5" />
          </div>
          <span>Dev Project Organizer</span>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <motion.a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            whileHover={{ scale: 1.05 }}
          >
            <IconGithub className="size-4" />
            GitHub
          </motion.a>
          <motion.a
            href="https://github.com/gourav-1711/project-manager/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
            whileHover={{ scale: 1.05 }}
          >
            Releases
          </motion.a>
          <span className="text-border">·</span>
          <span>Open source · MIT</span>
        </div>

        <p className="text-xs text-muted-foreground/50">
          Built with Next.js, Tauri, and TypeScript.{' '}
          <span className="hidden sm:inline">Not affiliated with any IDE company.</span>
        </p>
      </div>
    </footer>
  );
}

/* ───────────────────────────────────────────
   Page
   ─────────────────────────────────────────── */

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <MarqueeShowcase />
        <StatsSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
