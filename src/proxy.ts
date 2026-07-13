import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register", "/auth", "/demo", "/forgot-password", "/reset-password"];

export async function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathname = url.pathname;

  // 1. Correct CUID keyboard Shift-7 slashes (e.g. converting cmpnntz0k000004l//700lmqiy back to cmpnntz0k000004l7700lmqiy)
  if (pathname.includes("/session/")) {
    const startIndex = pathname.indexOf("/session/") + "/session/".length;
    // Find the start of /boarding or /boarding/ (case-insensitive) to isolate the CUID
    let endIndex = pathname.toLowerCase().indexOf("/boarding", startIndex);
    if (endIndex === -1) {
      endIndex = pathname.length;
    }
    
    const cuidPart = pathname.substring(startIndex, endIndex);
    
    // Clean and correct CUID if it contains slashes, avoiding the boarding path separator
    if (cuidPart.includes("/") && cuidPart !== "/") {
      const cleanCuid = cuidPart.replace(/\/+/g, "7");
      const rest = pathname.substring(endIndex);
      url.pathname = `/session/${cleanCuid}${rest}`;
      return NextResponse.redirect(url, 301);
    }
  }

  // 2. Collapse multiple consecutive slashes (e.g. //) in path to a single slash
  if (pathname.includes("//")) {
    const cleanPath = pathname.replace(/\/+/g, "/");
    url.pathname = cleanPath;
    return NextResponse.redirect(url, 301);
  }

  // Generate a cryptographically secure random base64 nonce
  const nonce = btoa(crypto.randomUUID());

  // Format the Content-Security-Policy header
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval' https://hcaptcha.com https://*.hcaptcha.com https://unpkg.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com;
    img-src 'self' blob: data: https://api.dicebear.com https://*.openstreetmap.org https://images.unsplash.com https://*.supabase.co https://*.googleusercontent.com https://*.githubusercontent.com https://*.gravatar.com https://*.cartocdn.com https://*.arcgisonline.com https://hcaptcha.com https://*.hcaptcha.com;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://nominatim.openstreetmap.org https://api.dicebear.com https://*.vercel-insights.com https://hcaptcha.com https://*.hcaptcha.com;
    frame-src 'self' https://hcaptcha.com https://*.hcaptcha.com;
    frame-ancestors 'none';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
  `.replace(/\s{2,}/g, " ").trim();

  // Clone headers and inject custom request headers so that layout/server components can read them
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", cspHeader);

  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let user = null;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            for (const { name, value } of cookiesToSet) {
              request.cookies.set(name, value);
            }
            response = NextResponse.next({
              request: {
                headers: requestHeaders,
              },
            });
            for (const { name, value, options } of cookiesToSet) {
              response.cookies.set(name, value, options);
            }
          },
        },
      }
    );

    try {
      const { data } = await supabase.auth.getUser();
      user = data?.user || null;
    } catch (err) {
      console.error("⚠️ Supabase Edge proxy middleware auth failed:", err);
    }
  } else {
    // If supabase credentials are not set, we are in local development / simulated flight config mode without auth constraints
    if (process.env.NODE_ENV === "development") {
      // In local dev, mock a pilot user so the app is accessible offline
      user = { id: "simulated-guest-user-id", email: "guest@gofocusgen.com" };
    }
  }

  const isPublic = PUBLIC_PATHS.some((p) =>
    pathname === p || pathname.startsWith(p + "/")
  );

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Set response headers for Content Security Policy & nonce tracking
  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set("x-nonce", nonce);

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
