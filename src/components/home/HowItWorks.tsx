import { useState, useEffect, useCallback, useRef, TouchEvent } from "react";
import { Search, Calendar, CreditCard, PartyPopper, Phone, Globe, Star, MapPin, Users, ChevronRight, Check, Hash, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

const STEP_DURATION = 5000; // ms per step

const steps = [
  {
    id: 1,
    icon: Search,
    title: "Search & Discover",
    description: "Browse curated listings of accommodations, rides, and event venues across Africa.",
    accent: "primary",
  },
  {
    id: 2,
    icon: Calendar,
    title: "Select & Customize",
    description: "Choose your dates, guests, and any special requirements for your perfect stay.",
    accent: "accent",
  },
  {
    id: 3,
    icon: CreditCard,
    title: "Book & Pay",
    description: "Secure your reservation with mobile money, card, or USSD — whatever suits you.",
    accent: "success",
  },
  {
    id: 4,
    icon: PartyPopper,
    title: "Enjoy Your Stay",
    description: "Receive instant confirmation via SMS & voice call, then enjoy world-class hospitality.",
    accent: "warning",
  },
  {
    id: 5,
    icon: Phone,
    title: "USSD Booking",
    description: "No internet? Dial *384*123# from any phone to book — works on every network.",
    accent: "destructive",
  },
];

/* ─── Simulated Phone Screens ─── */

const PhoneScreen1 = () => (
  <div className="flex flex-col h-full bg-background text-foreground">
    <div className="flex items-center justify-between px-4 pt-2 pb-1 text-[10px] text-muted-foreground">
      <span>9:41</span>
      <div className="flex gap-1 items-center">
        <div className="w-3 h-2 border border-muted-foreground rounded-sm">
          <div className="w-2 h-1 bg-success rounded-sm" />
        </div>
      </div>
    </div>
    <div className="px-3 pb-2">
      <div className="bg-muted rounded-xl px-3 py-2 flex items-center gap-2">
        <Search className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground">Search destinations...</span>
      </div>
    </div>
    <div className="flex gap-1.5 px-3 pb-2">
      {["Stays", "Rides", "Events"].map((c, i) => (
        <span key={c} className={cn(
          "text-[10px] px-2.5 py-1 rounded-full font-medium",
          i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>{c}</span>
      ))}
    </div>
    <div className="flex-1 px-3 space-y-2 overflow-hidden">
      {[
        { name: "Serengeti Safari Lodge", loc: "Tanzania", price: "$250", rating: "4.9", color: "bg-primary/10" },
        { name: "Zanzibar Beach Resort", loc: "Zanzibar", price: "$380", rating: "4.7", color: "bg-accent/10" },
        { name: "Cape Town Villa", loc: "South Africa", price: "$450", rating: "4.8", color: "bg-success/10" },
      ].map((item) => (
        <div key={item.name} className={cn("rounded-xl p-2.5 flex items-center gap-2.5", item.color)}>
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-foreground truncate">{item.name}</p>
            <p className="text-[9px] text-muted-foreground">{item.loc}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[11px] font-bold text-primary">{item.price}</p>
            <div className="flex items-center gap-0.5">
              <Star className="w-2.5 h-2.5 text-warning fill-warning" />
              <span className="text-[9px] text-muted-foreground">{item.rating}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
    <div className="flex items-center justify-around py-2 border-t border-border">
      {["Home", "Search", "Trips", "Profile"].map((t, i) => (
        <span key={t} className={cn("text-[9px] font-medium", i === 1 ? "text-primary" : "text-muted-foreground")}>{t}</span>
      ))}
    </div>
  </div>
);

const PhoneScreen2 = () => (
  <div className="flex flex-col h-full bg-background text-foreground">
    <div className="flex items-center justify-between px-4 pt-2 pb-1 text-[10px] text-muted-foreground">
      <span>9:42</span>
      <div className="flex gap-1 items-center">
        <div className="w-3 h-2 border border-muted-foreground rounded-sm">
          <div className="w-2 h-1 bg-success rounded-sm" />
        </div>
      </div>
    </div>
    <div className="px-3 pb-2">
      <p className="text-[13px] font-bold text-foreground">Serengeti Safari Lodge</p>
      <p className="text-[10px] text-muted-foreground">Select your dates & preferences</p>
    </div>
    <div className="px-3 pb-2">
      <div className="bg-muted/50 rounded-xl p-2.5">
        <p className="text-[10px] font-semibold text-foreground mb-1.5">March 2026</p>
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {["S","M","T","W","T","F","S"].map((d,i) => (
            <span key={`h${i}`} className="text-[8px] text-muted-foreground font-medium">{d}</span>
          ))}
          {Array.from({length: 31}, (_, i) => i + 1).map((d) => (
            <span key={d} className={cn(
              "text-[9px] w-5 h-5 flex items-center justify-center rounded-full mx-auto",
              d >= 10 && d <= 14 ? "bg-primary text-primary-foreground font-bold" :
              d < 4 ? "text-muted-foreground/40" : "text-foreground"
            )}>{d}</span>
          ))}
        </div>
      </div>
    </div>
    <div className="px-3 pb-2">
      <div className="flex items-center justify-between bg-muted/50 rounded-xl p-2.5">
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] text-foreground font-medium">Guests</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-border flex items-center justify-center text-[11px]">−</div>
          <span className="text-[12px] font-bold text-foreground">2</span>
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-[11px] text-primary-foreground">+</div>
        </div>
      </div>
    </div>
    <div className="px-3 pb-2">
      <p className="text-[10px] font-semibold text-foreground mb-1">Amenities</p>
      <div className="flex flex-wrap gap-1">
        {["WiFi", "Pool", "Spa", "Safari"].map((a) => (
          <span key={a} className="text-[8px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium flex items-center gap-0.5">
            <Check className="w-2 h-2" />{a}
          </span>
        ))}
      </div>
    </div>
    <div className="mt-auto px-3 pb-2">
      <div className="bg-primary/5 rounded-xl p-2.5 flex items-center justify-between">
        <div>
          <p className="text-[9px] text-muted-foreground">5 nights × $250</p>
          <p className="text-[14px] font-bold text-primary">$1,250</p>
        </div>
        <div className="bg-primary text-primary-foreground text-[10px] font-semibold px-3 py-1.5 rounded-lg">
          Continue
        </div>
      </div>
    </div>
    <div className="flex items-center justify-around py-2 border-t border-border">
      {["Home", "Search", "Trips", "Profile"].map((t) => (
        <span key={t} className="text-[9px] font-medium text-muted-foreground">{t}</span>
      ))}
    </div>
  </div>
);

const PhoneScreen3 = () => (
  <div className="flex flex-col h-full bg-background text-foreground">
    <div className="flex items-center justify-between px-4 pt-2 pb-1 text-[10px] text-muted-foreground">
      <span>9:43</span>
      <div className="flex gap-1 items-center">
        <div className="w-3 h-2 border border-muted-foreground rounded-sm">
          <div className="w-2 h-1 bg-success rounded-sm" />
        </div>
      </div>
    </div>
    <div className="px-3 pb-2">
      <p className="text-[13px] font-bold text-foreground">Secure Payment</p>
      <p className="text-[10px] text-muted-foreground">Choose your payment method</p>
    </div>
    <div className="px-3 pb-2">
      <div className="bg-muted/50 rounded-xl p-2.5 space-y-1.5">
        <div className="flex justify-between text-[10px]">
          <span className="text-muted-foreground">Serengeti Safari Lodge</span>
          <span className="text-foreground font-medium">5 nights</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-muted-foreground">Guests</span>
          <span className="text-foreground font-medium">2 adults</span>
        </div>
        <div className="border-t border-border my-1" />
        <div className="flex justify-between">
          <span className="text-[11px] font-semibold text-foreground">Total</span>
          <span className="text-[14px] font-bold text-primary">$1,250</span>
        </div>
      </div>
    </div>
    <div className="px-3 space-y-1.5 pb-2">
      {[
        { name: "M-Pesa", detail: "+254 7** ***89", selected: true },
        { name: "Credit Card", detail: "•••• 4242", selected: false },
        { name: "USSD", detail: "*384*123#", selected: false },
      ].map((m) => (
        <div key={m.name} className={cn(
          "rounded-xl p-2.5 flex items-center gap-2.5 border-2 transition-colors",
          m.selected ? "border-primary bg-primary/5" : "border-transparent bg-muted/50"
        )}>
          <div className={cn(
            "w-4 h-4 rounded-full border-2 flex items-center justify-center",
            m.selected ? "border-primary" : "border-muted-foreground/30"
          )}>
            {m.selected && <div className="w-2 h-2 rounded-full bg-primary" />}
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-foreground">{m.name}</p>
            <p className="text-[9px] text-muted-foreground">{m.detail}</p>
          </div>
          {m.selected && <Check className="w-3.5 h-3.5 text-primary" />}
        </div>
      ))}
    </div>
    <div className="mt-auto px-3 pb-2">
      <div className="bg-primary text-primary-foreground text-center text-[12px] font-bold py-2.5 rounded-xl">
        Pay $1,250
      </div>
      <p className="text-[8px] text-center text-muted-foreground mt-1">🔒 Secured by Snippe</p>
    </div>
    <div className="flex items-center justify-around py-2 border-t border-border">
      {["Home", "Search", "Trips", "Profile"].map((t) => (
        <span key={t} className="text-[9px] font-medium text-muted-foreground">{t}</span>
      ))}
    </div>
  </div>
);

const PhoneScreen4 = () => (
  <div className="flex flex-col h-full bg-background text-foreground">
    <div className="flex items-center justify-between px-4 pt-2 pb-1 text-[10px] text-muted-foreground">
      <span>9:44</span>
      <div className="flex gap-1 items-center">
        <div className="w-3 h-2 border border-muted-foreground rounded-sm">
          <div className="w-2 h-1 bg-success rounded-sm" />
        </div>
      </div>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center mb-3">
        <Check className="w-7 h-7 text-success" />
      </div>
      <p className="text-[15px] font-bold text-foreground mb-1">Booking Confirmed!</p>
      <p className="text-[10px] text-muted-foreground text-center mb-4">Your reservation at Serengeti Safari Lodge is confirmed.</p>
      <div className="w-full bg-muted/50 rounded-xl p-3 space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-foreground">Serengeti Safari Lodge</p>
            <p className="text-[9px] text-muted-foreground">Mar 10 – 15, 2026 · 2 guests</p>
          </div>
        </div>
        <div className="border-t border-border" />
        <div className="flex justify-between text-[10px]">
          <span className="text-muted-foreground">Booking ID</span>
          <span className="text-foreground font-mono font-medium">SF-2026-0847</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-muted-foreground">Amount paid</span>
          <span className="text-success font-bold">$1,250</span>
        </div>
      </div>
      <div className="w-full space-y-1.5">
        <div className="flex items-center gap-2 bg-success/5 rounded-lg p-2">
          <Phone className="w-3 h-3 text-success" />
          <p className="text-[9px] text-success font-medium">Voice confirmation call initiated</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/5 rounded-lg p-2">
          <Globe className="w-3 h-3 text-primary" />
          <p className="text-[9px] text-primary font-medium">SMS confirmation sent</p>
        </div>
      </div>
    </div>
    <div className="flex items-center justify-around py-2 border-t border-border">
      {["Home", "Search", "Trips", "Profile"].map((t, i) => (
        <span key={t} className={cn("text-[9px] font-medium", i === 2 ? "text-primary" : "text-muted-foreground")}>{t}</span>
      ))}
    </div>
  </div>
);

/* ─── USSD Old-Style Phone Screen ─── */
const PhoneScreen5 = () => {
  const ussdFlow = [
    { prompt: "Dial *384*123#", response: null },
    { prompt: null, response: "Welcome to SafariConnect\n1. Accommodations\n2. Rides\n3. Event Halls\n0. Exit" },
    { prompt: "Reply: 1", response: null },
    { prompt: null, response: "Select Location:\n1. Serengeti, TZ\n2. Zanzibar\n3. Cape Town, SA\n0. Back" },
    { prompt: "Reply: 1", response: null },
    { prompt: null, response: "Serengeti Safari Lodge\n$250/night\n\n1. Book Now\n2. More Info\n0. Back" },
    { prompt: "Reply: 1", response: null },
    { prompt: null, response: "Booking Confirmed!\nRef: SF-2026-0847\nM-Pesa prompt sent\nto +254 7** ***89" },
  ];

  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    setVisibleLines(0);
    let line = 0;
    const interval = setInterval(() => {
      line++;
      if (line >= ussdFlow.length) {
        clearInterval(interval);
      }
      setVisibleLines(line);
    }, 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full bg-[hsl(var(--muted))] text-foreground">
      {/* Old phone top bar */}
      <div className="flex items-center justify-between px-3 pt-2 pb-1">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-[9px] text-muted-foreground font-mono">Safaricom</span>
        </div>
        <span className="text-[9px] text-muted-foreground font-mono">12:30</span>
      </div>

      {/* USSD Dialog */}
      <div className="flex-1 px-3 py-2 overflow-hidden">
        <div className="bg-background border-2 border-border rounded-lg p-3 h-full overflow-y-auto">
          <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-border">
            <Hash className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-foreground font-mono">USSD Session</span>
          </div>
          <div className="space-y-2">
            {ussdFlow.slice(0, visibleLines + 1).map((item, i) => (
              <div key={i} className="animate-fade-in">
                {item.prompt && (
                  <div className="flex justify-end mb-1">
                    <div className="bg-primary/10 border border-primary/20 rounded-lg px-2 py-1 max-w-[85%]">
                      <p className="text-[9px] font-mono text-primary font-semibold">{item.prompt}</p>
                    </div>
                  </div>
                )}
                {item.response && (
                  <div className="flex justify-start">
                    <div className="bg-muted border border-border rounded-lg px-2 py-1.5 max-w-[90%]">
                      <p className="text-[9px] font-mono text-foreground whitespace-pre-line leading-relaxed">{item.response}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {visibleLines < ussdFlow.length - 1 && (
              <div className="flex gap-1 items-center px-1">
                <div className="w-1 h-1 rounded-full bg-muted-foreground animate-pulse" />
                <div className="w-1 h-1 rounded-full bg-muted-foreground animate-pulse [animation-delay:200ms]" />
                <div className="w-1 h-1 rounded-full bg-muted-foreground animate-pulse [animation-delay:400ms]" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Old phone keypad hint */}
      <div className="px-3 pb-2">
        <div className="grid grid-cols-3 gap-1">
          {[1,2,3,4,5,6,7,8,9,"*",0,"#"].map((k) => (
            <div key={k} className="bg-background border border-border rounded text-center py-1">
              <span className="text-[9px] font-mono font-bold text-foreground">{k}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const phoneScreens = [PhoneScreen1, PhoneScreen2, PhoneScreen3, PhoneScreen4, PhoneScreen5];

const glowColors = ["bg-primary", "bg-accent", "bg-success", "bg-warning", "bg-destructive"];

/* ─── Phone Frame Component ─── */
const PhoneFrame = ({ children }: { children: React.ReactNode }) => (
  <div className="relative mx-auto">
    <div className="relative w-[200px] h-[400px] sm:w-[220px] sm:h-[440px] bg-foreground rounded-[32px] p-[6px] shadow-xl">
      <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-[60px] h-[18px] bg-foreground rounded-full z-20" />
      <div className="w-full h-full rounded-[26px] overflow-hidden bg-background">
        <div className="pt-[20px] h-full">
          {children}
        </div>
      </div>
    </div>
    <div className="absolute inset-0 rounded-[32px] bg-gradient-to-br from-primary-foreground/5 to-transparent pointer-events-none" />
  </div>
);

/* ─── Progress Bar ─── */
const StepProgressBar = ({ isActive, isPaused, duration }: { isActive: boolean; isPaused: boolean; duration: number }) => (
  <div className="h-0.5 w-full bg-border rounded-full overflow-hidden mt-2">
    <div
      className={cn(
        "h-full bg-primary rounded-full",
        isActive && !isPaused ? "animate-[progress_linear]" : "",
        !isActive ? "w-0" : ""
      )}
      style={isActive ? {
        animation: isPaused ? "none" : `progress ${duration}ms linear forwards`,
        width: isActive && !isPaused ? undefined : isActive ? "100%" : "0%",
      } : {}}
    />
  </div>
);

/* ─── Main Component ─── */
export const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [animKey, setAnimKey] = useState(0);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const ActiveScreen = phoneScreens[activeStep];

  const nextStep = useCallback(() => {
    setDirection('next');
    setActiveStep((prev) => (prev + 1) % steps.length);
    setProgressKey((k) => k + 1);
    setAnimKey((k) => k + 1);
  }, []);

  const prevStep = useCallback(() => {
    setDirection('prev');
    setActiveStep((prev) => (prev - 1 + steps.length) % steps.length);
    setProgressKey((k) => k + 1);
    setAnimKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(nextStep, STEP_DURATION);
    return () => clearInterval(timer);
  }, [isPaused, nextStep]);

  const handleStepClick = (index: number) => {
    setDirection(index > activeStep ? 'next' : 'prev');
    setActiveStep(index);
    setProgressKey((k) => k + 1);
    setAnimKey((k) => k + 1);
    setIsPaused(true);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), 10000);
  };

  const togglePause = () => {
    setIsPaused((p) => !p);
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    if (!isPaused) {
      // If we're pausing, don't auto-resume
    } else {
      // If we're resuming, reset progress
      setProgressKey((k) => k + 1);
    }
  };

  // Swipe handlers
  const handleTouchStart = (e: TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    // Only trigger if horizontal swipe is significant and more horizontal than vertical
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) nextStep(); else prevStep();
      setIsPaused(true);
      if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
      pauseTimeoutRef.current = setTimeout(() => setIsPaused(false), 10000);
    }
  };

  const accentColors: Record<string, string> = {
    primary: "bg-primary text-primary-foreground",
    accent: "bg-accent text-accent-foreground",
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    destructive: "bg-destructive text-destructive-foreground",
  };

  const ringColors: Record<string, string> = {
    primary: "ring-primary/30",
    accent: "ring-accent/30",
    success: "ring-success/30",
    warning: "ring-warning/30",
    destructive: "ring-destructive/30",
  };

  return (
    <section className="py-16 lg:py-28 bg-background overflow-hidden">
      {/* Progress bar keyframe */}
      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-10 lg:mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary mb-3 px-3 py-1 rounded-full bg-primary/10">
            Simple Process
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            From discovery to doorstep — book your perfect African experience in five easy steps.
          </p>
        </div>

        {/* Main Content: Steps + Phone */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-16 lg:mb-20">
          {/* Phone Simulator — shows first on mobile */}
          <div className="order-1 flex justify-center">
            <div
              className="relative"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div className={cn(
                "absolute inset-0 blur-[80px] opacity-20 rounded-full transition-colors duration-700",
                glowColors[activeStep]
              )} />
              <PhoneFrame>
                <ActiveScreen />
              </PhoneFrame>
              {/* Pause/Play overlay button */}
              <button
                onClick={togglePause}
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-card border-2 border-border shadow-lg flex items-center justify-center hover:bg-muted transition-colors z-30"
                aria-label={isPaused ? "Resume auto-play" : "Pause auto-play"}
              >
                {isPaused ? (
                  <Play className="w-4 h-4 text-primary ml-0.5" />
                ) : (
                  <Pause className="w-4 h-4 text-primary" />
                )}
              </button>
            </div>
          </div>

          {/* Steps List */}
          <div className="order-2 space-y-2">
            {steps.map((step, index) => {
              const isActive = activeStep === index;
              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  className={cn(
                    "w-full text-left rounded-2xl p-4 lg:p-5 transition-all duration-300 border-2 group",
                    isActive
                      ? `border-transparent shadow-lg ring-4 ${ringColors[step.accent]} bg-card`
                      : "border-transparent hover:bg-muted/50 bg-transparent"
                  )}
                >
                  <div className="flex items-start gap-3 lg:gap-4">
                    <div className={cn(
                      "w-10 h-10 lg:w-12 lg:h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300",
                      isActive ? accentColors[step.accent] : "bg-muted text-muted-foreground"
                    )}>
                      <step.icon className="w-4 h-4 lg:w-5 lg:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          isActive ? "text-primary" : "text-muted-foreground/60"
                        )}>
                          Step {step.id}
                        </span>
                      </div>
                      <h3 className={cn(
                        "text-base lg:text-lg font-semibold mb-0.5 transition-colors",
                        isActive ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {step.title}
                      </h3>
                      <p className={cn(
                        "text-sm leading-relaxed transition-all duration-300",
                        isActive ? "text-muted-foreground max-h-20 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                      )}>
                        {step.description}
                      </p>
                      {isActive && (
                        <StepProgressBar
                          key={progressKey}
                          isActive={isActive}
                          isPaused={isPaused}
                          duration={STEP_DURATION}
                        />
                      )}
                    </div>
                    <ChevronRight className={cn(
                      "w-5 h-5 mt-1 shrink-0 transition-all",
                      isActive ? "text-primary rotate-0" : "text-muted-foreground/30 -rotate-90"
                    )} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Booking Methods */}
        <div className="bg-gradient-hero rounded-3xl p-6 lg:p-12 text-primary-foreground">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-center">
            <div className="lg:col-span-1">
              <h3 className="text-xl lg:text-3xl font-display font-bold mb-3">
                Multiple Ways to Book
              </h3>
              <p className="text-primary-foreground/80 text-sm lg:text-base">
                Whether you're online or offline, we've got you covered with flexible booking options.
              </p>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
              {[
                { icon: Globe, title: "Web Booking", desc: "Book through our website anytime, anywhere with full access to all features." },
                { icon: Phone, title: "USSD Booking", desc: "Dial *384*123# from any phone — no internet required!" },
              ].map((method) => (
                <div
                  key={method.title}
                  className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-5 lg:p-6 border border-primary-foreground/20 hover:bg-primary-foreground/15 transition-colors"
                >
                  <method.icon className="w-8 h-8 lg:w-10 lg:h-10 mb-3 lg:mb-4 text-accent" />
                  <h4 className="text-base lg:text-lg font-semibold mb-2">{method.title}</h4>
                  <p className="text-sm text-primary-foreground/80">{method.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
