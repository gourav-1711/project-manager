"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ───────────────────────────────────────────
   Icons (inline to avoid dependencies)
   ─────────────────────────────────────────── */

function IconCommand({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
    </svg>
  );
}

function IconCheckSquare({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 11 3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function IconShare({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="m16 6-4-4-4 4" />
      <path d="M12 2v13" />
    </svg>
  );
}

function IconBox({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.27 6.96 12 12.01l8.73-5.05" />
      <path d="M12 22.08V12" />
    </svg>
  );
}

function IconTimeline({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
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

function IconArrowUpRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

function IconSun({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="M4.93 4.93l1.41 1.41" />
      <path d="M17.66 17.66l1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="M6.34 17.66l-1.41 1.41" />
      <path d="M19.07 4.93l-1.41 1.41" />
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

/* ───────────────────────────────────────────
   Types
   ─────────────────────────────────────────── */

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

type Theme = "light" | "dark";

/* ───────────────────────────────────────────
   Theme Toggle
   ─────────────────────────────────────────── */

function useTheme(): { theme: Theme; toggle: () => void } {
  const [theme, setTheme] = useState<Theme>("dark");

  // On mount: read localStorage, fall back to system preference
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
    <button
      type="button"
      onClick={onToggle}
      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <IconSun className="size-4" />
      ) : (
        <IconMoon className="size-4" />
      )}
    </button>
  );
}

/* ───────────────────────────────────────────
   Feature Card Component
   ─────────────────────────────────────────── */

function FeatureCard({ icon, title, description, index }: FeatureProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`group relative flex flex-col gap-4 rounded-xl border border-border bg-card/50 p-6 transition-all duration-500 hover:border-muted-foreground/30 hover:bg-card/80 sm:p-8 ${
        visible
          ? "translate-y-0 opacity-100"
          : "translate-y-8 opacity-0"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Hover glow */}
      <div className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-muted/50 to-transparent" />
      </div>

      <div className="relative flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors duration-300 group-hover:bg-muted-foreground/20 group-hover:text-foreground">
          {icon}
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-foreground">
          {title}
        </h3>
      </div>

      <p className="relative text-sm leading-relaxed text-muted-foreground transition-colors duration-300 group-hover:text-foreground/80">
        {description}
      </p>

      {/* Placeholder screenshot area */}
      <div className="relative mt-2 aspect-video w-full overflow-hidden rounded-lg border border-border bg-gradient-to-br from-muted to-background">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.3) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────
   Navbar
   ─────────────────────────────────────────── */

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 sm:px-10 ${
        scrolled
          ? "border-b border-border/50 bg-background/80 backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <a href="#" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground">
        <IconCommand className="size-4 text-indigo-500" />
        <span>Dev Project Organizer</span>
      </a>

      <div className="flex items-center gap-2">
        <a
          href="#features"
          className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
        >
          Features
        </a>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
        >
          <IconGithub className="size-4" />
          GitHub
        </a>
        <a
          href="https://github.com/gourav-1711/project-manager/releases"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block"
        >
          Releases
        </a>
        <ThemeToggle theme={theme} onToggle={toggle} />
        <a
          href="#download"
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-all hover:opacity-90 active:scale-[0.97]"
        >
          Get Started
          <IconArrowUpRight className="size-3.5" />
        </a>
      </div>
    </nav>
  );
}

/* ───────────────────────────────────────────
   Hero Section
   ─────────────────────────────────────────── */

function HeroSection() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-32 sm:px-10">
      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(128,128,128,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(128,128,128,0.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          animation: "grid-shift 30s linear infinite",
        }}
      />

      {/* Radial gradient glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 h-[300px] w-[300px] rounded-full bg-fuchsia-500/8 blur-[100px]" />

      <div
        className={`relative flex max-w-3xl flex-col items-center gap-8 text-center transition-all duration-1000 ${
          mounted ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
      >
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Open source desktop app
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          <span className="gradient-text">Your projects,</span>
          <br />
          <span className="gradient-text-accent">one click away</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground/90 sm:text-lg">
          Stop losing time jumping between projects, terminals, and IDEs.
          Dev Project Organizer brings your project tools into one lightweight
          desktop app.
        </p>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4 sm:flex-row" id="download">
          <a
            href="#download"
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-8 text-sm font-semibold text-accent-foreground transition-all hover:opacity-90 active:scale-[0.97]"
          >
            Download for macOS
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="M7 10l5 5 5-5" />
              <path d="M12 15V3" />
            </svg>
          </a>
          <a
            href="#features"
            className="inline-flex h-12 items-center gap-2 rounded-xl border border-border px-8 text-sm font-medium text-muted-foreground transition-all hover:border-muted-foreground/30 hover:text-foreground active:scale-[0.97]"
          >
            See features
          </a>
        </div>

        {/* Platform badges */}
        <p className="text-xs text-muted-foreground/50">
          macOS · Windows · Linux · Free & open source
        </p>
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────
   Features Section
   ─────────────────────────────────────────── */

const features: FeatureProps[] = [
  {
    icon: <IconCommand className="size-5" />,
    title: "Project Registry & Quick Launch",
    description:
      "Register any local project and launch it in VS Code, your terminal, or Finder with one click. No more digging through folders or remembering paths.",
    index: 0,
  },
  {
    icon: <IconCheckSquare className="size-5" />,
    title: "Todos & Error Tracking",
    description:
      "Per-project todo lists for quick capture and a structured error log with severity levels. Keep track of what needs doing and what's broken, separately.",
    index: 1,
  },
  {
    icon: <IconShare className="size-5" />,
    title: "Mobile Share",
    description:
      "Spin up a local HTTP server, scan the QR code with your phone, and send text or images to your laptop over Wi-Fi. No cloud, no setup, no data leaving your machine.",
    index: 2,
  },
  {
    icon: <IconBox className="size-5" />,
    title: "Skills Manager",
    description:
      "Browse and install AI agent skills into any project via npm. A curated catalog of reusable agent capabilities — from design taste to database setup — installable in one click.",
    index: 3,
  },
  {
    icon: <IconTimeline className="size-5" />,
    title: "Timeline Planning",
    description:
      "Plan project milestones and phases with a dated timeline view. Group items by month, track status per milestone, and keep planning separate from quick-capture todos.",
    index: 4,
  },
];

function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative mx-auto flex max-w-6xl flex-col items-center gap-16 px-6 py-24 sm:px-10 sm:py-32"
    >
      {/* Section header */}
      <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-xs font-medium text-muted-foreground">
          Everything you need
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Built for the way you actually work
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          Five integrated features that cover the daily workflow of any developer
          managing multiple projects.
        </p>
      </div>

      {/* Feature grid */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
        {/* Empty spacer to fill grid layout */}
        <div className="hidden xl:block" />
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────
   CTA Section
   ─────────────────────────────────────────── */

function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative flex items-center justify-center px-6 py-24 sm:py-32">
      <div
        ref={ref}
        className={`relative flex max-w-2xl flex-col items-center gap-8 rounded-2xl border border-border bg-card/50 px-8 py-16 text-center transition-all duration-700 sm:px-16 ${
          visible
            ? "translate-y-0 opacity-100"
            : "translate-y-12 opacity-0"
        }`}
      >
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-indigo-500/5 to-transparent" />

        <div className="relative">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to tidy up your dev life?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Download the app, add your first project, and see the difference
            that one-click access makes.
          </p>
        </div>

        <a
          href="#download"
          className="relative inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-8 text-sm font-semibold text-accent-foreground transition-all hover:opacity-90 active:scale-[0.97]"
        >
          Download for free
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <path d="M7 10l5 5 5-5" />
            <path d="M12 15V3" />
          </svg>
        </a>
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────
   Footer
   ─────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="border-t border-border/50 px-6 py-12 sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <IconCommand className="size-4 text-indigo-500" />
          <span>Dev Project Organizer</span>
        </div>

        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <IconGithub className="size-4" />
            GitHub
          </a>
          <a
            href="https://github.com/gourav-1711/project-manager/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            Releases
          </a>
          <span className="text-border">·</span>
          <span>Open source · MIT</span>
        </div>

        <p className="text-xs text-muted-foreground/60">
          Built with Next.js, Tauri, and TypeScript.{" "}
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
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
