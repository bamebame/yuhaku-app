import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "Yuhaku POS System",
	description: "店頭販売POSシステム",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="ja">
			<head>
				{/* Epson ePOS SDK */}
				<script src="/libs/epos-2.27.0.js" async />
			</head>
			<body className={inter.className}>{children}</body>
		</html>
	);
}
