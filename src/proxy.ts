import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register", "/auth", "/demo"];

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

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data?.user || null;
  } catch (err) {
    console.error("⚠️ Supabase Edge proxy middleware auth failed:", err);
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

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
