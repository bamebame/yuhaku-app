import { redirect } from "next/navigation";

export default function HomePage() {
	// ホームページアクセス時は販売ケース一覧へリダイレクト
	redirect("/sas-cases");
}
