import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PosLayout } from "@/components/pos/layout";
import { Toaster } from "@/components/ui/toaster";

export default async function AuthenticatedLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) {
		redirect("/auth/login");
	}

	return (
		<>
			<PosLayout>{children}</PosLayout>
			<Toaster />
		</>
	);
}
