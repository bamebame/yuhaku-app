import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request,
	});

	const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
	const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

	if (!supabaseUrl || !supabaseKey) {
		console.error("Missing Supabase environment variables");
		return supabaseResponse;
	}

	const supabase = createServerClient(supabaseUrl, supabaseKey, {
		cookies: {
			getAll() {
				return request.cookies.getAll();
			},
			setAll(cookiesToSet) {
				for (const { name, value } of cookiesToSet) {
					request.cookies.set(name, value);
				}
				supabaseResponse = NextResponse.next({
					request,
				});
				for (const { name, value, options } of cookiesToSet) {
					supabaseResponse.cookies.set(name, value, options);
				}
			},
		},
	});

	// 認証状態の確認
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// 保護されたルートの定義
	const protectedRoutes = ["/sas-cases", "/products", "/items", "/categories"];
	const authRoutes = ["/auth/login"];
	const publicRoutes = ["/", "/auth/unlock"];

	const pathname = request.nextUrl.pathname;
	const isProtectedRoute = protectedRoutes.some((route) =>
		pathname.startsWith(route),
	);
	const isAuthRoute = authRoutes.some((route) =>
		pathname.startsWith(route),
	);
	const isPublicRoute = publicRoutes.includes(pathname);

	// 未認証でprotectedRouteにアクセスした場合はログインページへ
	if (isProtectedRoute && !user) {
		const redirectUrl = request.nextUrl.clone();
		redirectUrl.pathname = "/auth/login";
		redirectUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
		return NextResponse.redirect(redirectUrl);
	}

	// 認証済みでauthRouteにアクセスした場合はホームへ
	if (isAuthRoute && user) {
		const redirectTo = request.nextUrl.searchParams.get("redirectedFrom") || "/";
		return NextResponse.redirect(new URL(redirectTo, request.url));
	}

	return supabaseResponse;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - public folder
		 * - api routes
		 */
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)",
	],
};
