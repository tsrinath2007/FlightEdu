"use client";

import * as React from "react";

// --- Retro CSS & Font Injection Helper ---
(function(){
  if (typeof document === "undefined") return;
  // --- force dark: 4 layers ---
  try { localStorage.setItem("theme","dark"); localStorage.setItem("vite-ui-theme","dark"); } catch(e){}
  const __forceDark = function(){ 
    const de = document.documentElement; 
    de.classList.remove("light"); 
    de.classList.add("dark"); 
    de.style.colorScheme="dark"; 
  };
  __forceDark();
  let __n = 0;
  const __iv = setInterval(function(){ __forceDark(); if(++__n>=30) clearInterval(__iv); }, 100);
  try { 
    new MutationObserver(function(){ if(!document.documentElement.classList.contains("dark")) __forceDark(); })
      .observe(document.documentElement,{attributes:true,attributeFilter:["class"]}); 
  } catch(e){}
  
  // Inject the exact Press Start 2P game font stylesheet
  if (!document.getElementById("__8bit_retro_css__")) {
    const s = document.createElement("style"); 
    s.id = "__8bit_retro_css__";
    s.textContent = '@font-face{font-family:"Press Start 2P";font-style:normal;font-weight:400;font-display:swap;src:url("https://fonts.gstatic.com/s/pressstart2p/v15/e3t4U10oDRax0Mx5Hh13UXx2RYOTacyXNQ.woff2") format("woff2");}'
      + '.retro{font-family:"Press Start 2P",system-ui,-apple-system,sans-serif;line-height:1.5;letter-spacing:0.5px;}'
      + '.pixelated{image-rendering:pixelated;image-rendering:crisp-edges;}'
      + 'html.light,html:not(.dark){--background:oklch(0.145 0 0);--foreground:oklch(0.985 0 0);--card:oklch(0.205 0 0);--card-foreground:oklch(0.985 0 0);--muted-foreground:oklch(0.708 0 0);--border:oklch(0.985 0 0);--ring:oklch(0.556 0 0);color-scheme:dark;}'
      + '@import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");';
    document.head.appendChild(s);
  }
})();

// Utility function to merge class names
function cn(...c: (string | undefined | boolean)[]) {
  return c.filter(Boolean).join(" ");
}

// Button subcomponent with 8-bit styling
export function Button2({
  children,
  className,
  variant = "default",
  size = "default",
  font = "retro",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "link" | "secondary" | "destructive";
  size?: "default" | "sm" | "lg" | "icon" | "xs";
  font?: "normal" | "retro";
}) {
  return (
    <button
      {...props}
      className={cn(
        "rounded-none active:translate-y-1 transition-transform relative inline-flex items-center justify-center gap-1.5 border-none",
        size === "icon" && "mx-1 my-0",
        font !== "normal" && "retro",
        variant === "default" && "bg-white text-black hover:bg-white/90",
        variant === "outline" && "border border-white bg-transparent text-white hover:bg-white/10",
        variant === "ghost" && "bg-transparent text-white hover:bg-white/10",
        variant === "link" && "bg-transparent text-sky-400 underline underline-offset-4 hover:text-sky-300",
        className
      )}
    >
      <span className="relative inline-flex items-center justify-center gap-1.5 w-full h-full">
        {children}

        {variant !== "ghost" && variant !== "link" && size !== "icon" && (
          <>
            {/* Pixelated border */}
            <div className="absolute -top-1.5 w-1/2 left-1.5 h-1.5 bg-foreground dark:bg-ring" />
            <div className="absolute -top-1.5 w-1/2 right-1.5 h-1.5 bg-foreground dark:bg-ring" />
            <div className="absolute -bottom-1.5 w-1/2 left-1.5 h-1.5 bg-foreground dark:bg-ring" />
            <div className="absolute -bottom-1.5 w-1/2 right-1.5 h-1.5 bg-foreground dark:bg-ring" />
            <div className="absolute top-0 left-0 size-1.5 bg-foreground dark:bg-ring" />
            <div className="absolute top-0 right-0 size-1.5 bg-foreground dark:bg-ring" />
            <div className="absolute bottom-0 left-0 size-1.5 bg-foreground dark:bg-ring" />
            <div className="absolute bottom-0 right-0 size-1.5 bg-foreground dark:bg-ring" />
            <div className="absolute top-1.5 -left-1.5 h-[calc(100%-12px)] w-1.5 bg-foreground dark:bg-ring" />
            <div className="absolute top-1.5 -right-1.5 h-[calc(100%-12px)] w-1.5 bg-foreground dark:bg-ring" />
            {variant !== "outline" && (
              <>
                {/* Top shadow */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-foreground/20" />
                <div className="absolute top-1.5 left-0 w-3 h-1.5 bg-foreground/20" />

                {/* Bottom shadow */}
                <div className="absolute bottom-0 left-0 w-full h-1.5 bg-foreground/20" />
                <div className="absolute bottom-1.5 right-0 w-3 h-1.5 bg-foreground/20" />
              </>
            )}
          </>
        )}

        {size === "icon" && (
          <>
            <div className="absolute top-0 left-0 w-full h-[5px] md:h-1.5 bg-foreground dark:bg-ring pointer-events-none" />
            <div className="absolute bottom-0 w-full h-[5px] md:h-1.5 bg-foreground dark:bg-ring pointer-events-none" />
            <div className="absolute top-1 -left-1 w-[5px] md:w-1.5 h-1/2 bg-foreground dark:bg-ring pointer-events-none" />
            <div className="absolute bottom-1 -left-1 w-[5px] md:w-1.5 h-1/2 bg-foreground dark:bg-ring pointer-events-none" />
            <div className="absolute top-1 -right-1 w-[5px] md:w-1.5 h-1/2 bg-foreground dark:bg-ring pointer-events-none" />
            <div className="absolute bottom-1 -right-1 w-[5px] md:w-1.5 h-1/2 bg-foreground dark:bg-ring pointer-events-none" />
          </>
        )}
      </span>
    </button>
  );
}

// Card subcomponent with 8-bit styling
export function Card2({
  className,
  font = "retro",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { font?: "normal" | "retro" }) {
  return (
    <div
      className={cn(
        "relative bg-card text-card-foreground border-y-6 border-foreground dark:border-ring p-6 flex flex-col gap-6",
        font !== "normal" && "retro",
        className
      )}
      {...props}
    >
      {props.children}
      <div
        className="absolute inset-y-0 border-x-6 -mx-1.5 border-inherit pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}

// Input subcomponent with 8-bit styling
export function Input2({
  className,
  font = "retro",
  type = "text",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { font?: "normal" | "retro" }) {
  return (
    <div
      className={cn(
        "relative border-y-6 border-foreground dark:border-ring !p-0 flex items-center bg-transparent",
        className
      )}
    >
      <input
        type={type}
        {...props}
        className={cn(
          "h-9 w-full min-w-0 bg-transparent px-3 py-1 text-sm text-foreground outline-none border-none ring-0",
          font !== "normal" && "retro",
          className
        )}
      />
      <div
        className="absolute inset-y-0 border-x-6 -mx-1.5 border-foreground dark:border-ring pointer-events-none"
        aria-hidden="true"
      />
    </div>
  );
}

// Label subcomponent with 8-bit styling
export function Label4({
  className,
  font = "retro",
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { font?: "normal" | "retro" }) {
  return (
    <label
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none text-foreground",
        font !== "normal" && "retro",
        className
      )}
      {...props}
    />
  );
}

// --- MAIN LOGIN FORM COMPONENT ---
export function LoginForm({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-sm mx-auto", className)} {...props}>
      <Card2>
        <div className="space-y-2">
          <h2 className="text-xl font-bold uppercase tracking-widest text-center text-foreground">Login</h2>
          <p className="text-[8px] text-muted-foreground text-center uppercase tracking-wider">
            Enter your email below to login to your account
          </p>
        </div>
        
        <form onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label4 htmlFor="email">Email</Label4>
              <Input2
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <Label4 htmlFor="password">Password</Label4>
                <a
                  href="#"
                  className="inline-block text-[9px] underline underline-offset-4 hover:text-primary transition-colors uppercase"
                >
                  Forgot password?
                </a>
              </div>
              <Input2 id="password" type="password" required />
            </div>
            <Button2 type="submit" className="w-full">
              Login
            </Button2>
            <Button2 variant="outline" className="w-full">
              Login with Google
            </Button2>
          </div>
          <div className="mt-6 text-center text-[9px] uppercase tracking-wide">
            Don&apos;t have an account?{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary transition-colors">
              Sign up
            </a>
          </div>
        </form>
      </Card2>
    </div>
  );
}

export default LoginForm;
