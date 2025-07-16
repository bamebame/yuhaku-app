"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Home, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function Navigation() {
	const pathname = usePathname();
	const router = useRouter();
	const supabase = createClient();

	const handleSignOut = async () => {
		await supabase.auth.signOut();
		router.push("/auth/signin");
	};

	const navItems = [
		{
			title: "ダッシュボード",
			href: "/dashboard",
			icon: Home,
		},
		{
			title: "店頭販売",
			href: "/sas-cases",
			icon: ShoppingCart,
		},
	];

	return (
		<nav className="border-b">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					<div className="flex items-center gap-6">
						<Link href="/dashboard" className="font-bold text-xl">
							Yuhaku POS
						</Link>
						<div className="hidden md:flex items-center gap-1">
							{navItems.map((item) => {
								const Icon = item.icon;
								const isActive = pathname.startsWith(item.href);
								return (
									<Button
										key={item.href}
										variant={isActive ? "secondary" : "ghost"}
										asChild
									>
										<Link href={item.href}>
											<Icon className="mr-2 h-4 w-4" />
											{item.title}
										</Link>
									</Button>
								);
							})}
						</div>
					</div>
					<Button variant="ghost" onClick={handleSignOut}>
						<LogOut className="mr-2 h-4 w-4" />
						ログアウト
					</Button>
				</div>
			</div>
		</nav>
	);
}
