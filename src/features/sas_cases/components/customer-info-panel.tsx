"use client";

import { useState, useEffect } from "react";
import { useSasCaseEditStore } from "@/features/sas_cases/stores/edit-store";
import { PosButton, PosCard, PosInput } from "@/components/pos";
import { User, FileText, Search } from "lucide-react";

export function CustomerInfoPanel() {
	const { memberId, note, customerNote, updateMemberId, updateNote, updateCustomerNote } = useSasCaseEditStore();
	const [memberSearchOpen, setMemberSearchOpen] = useState(false);
	const [memberIdInput, setMemberIdInput] = useState(memberId || "");
	const [noteInput, setNoteInput] = useState(note || "");
	const [customerNoteInput, setCustomerNoteInput] = useState(customerNote || "");

	// ストアの値が変更されたら入力値も更新
	useEffect(() => {
		setMemberIdInput(memberId || "");
	}, [memberId]);

	useEffect(() => {
		setNoteInput(note || "");
	}, [note]);

	useEffect(() => {
		setCustomerNoteInput(customerNote || "");
	}, [customerNote]);

	// TODO: 実際は会員検索APIを使用
	const handleMemberSearch = () => {
		setMemberSearchOpen(true);
	};

	const handleSaveCustomerInfo = () => {
		// ストアの値を更新
		updateMemberId(memberIdInput || null);
		updateNote(noteInput);
		updateCustomerNote(customerNoteInput);
	};

	return (
		<div className="h-full flex flex-col bg-pos-light">
			{/* ヘッダー */}
			<div className="p-4 border-b-2 border-pos-border bg-pos-background">
				<h2 className="text-pos-lg font-semibold flex items-center gap-2">
					<User className="h-5 w-5" />
					顧客情報
				</h2>
			</div>

			{/* コンテンツ */}
			<div className="flex-1 overflow-y-auto p-4 space-y-4">
				{/* 会員情報 */}
				<PosCard className="p-4">
					<div className="space-y-3">
						<h3 className="font-medium text-pos-base flex items-center gap-2">
							<User className="h-4 w-4" />
							会員情報
						</h3>
						<div className="space-y-2">
							<label htmlFor="member-id" className="text-pos-sm font-medium">
								会員ID
							</label>
							<div className="flex gap-2">
								<PosInput
									id="member-id"
									value={memberIdInput}
									onChange={(e) => setMemberIdInput(e.target.value)}
									onBlur={handleSaveCustomerInfo}
									placeholder="会員IDを入力"
								/>
								<PosButton
									size="icon"
									variant="outline"
									onClick={handleMemberSearch}
								>
									<Search className="h-4 w-4" />
								</PosButton>
							</div>
						</div>
						{memberIdInput && (
							<div className="text-pos-sm text-pos-muted space-y-1">
								{/* TODO: 実際は会員情報を表示 */}
								<p>会員名: テスト会員</p>
								<p>ポイント: 1,234pt</p>
							</div>
						)}
					</div>
				</PosCard>

				{/* メモ */}
				<PosCard className="p-4">
					<div className="space-y-3">
						<h3 className="font-medium text-pos-base flex items-center gap-2">
							<FileText className="h-4 w-4" />
							メモ
						</h3>
						<div className="space-y-3">
							<div className="space-y-2">
								<label htmlFor="staff-note" className="text-pos-sm font-medium">
									スタッフメモ
								</label>
								<textarea
									id="staff-note"
									value={noteInput}
									onChange={(e) => setNoteInput(e.target.value)}
									onBlur={handleSaveCustomerInfo}
									placeholder="スタッフ用のメモを入力"
									rows={3}
									className="w-full px-3 py-2 text-pos-sm border-2 border-pos-border bg-pos-background focus:outline-none focus:ring-2 focus:ring-pos-accent"
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="customer-note" className="text-pos-sm font-medium">
									お客様メモ
								</label>
								<textarea
									id="customer-note"
									value={customerNoteInput}
									onChange={(e) => setCustomerNoteInput(e.target.value)}
									onBlur={handleSaveCustomerInfo}
									placeholder="レシートに印刷されるメモを入力"
									rows={3}
									className="w-full px-3 py-2 text-pos-sm border-2 border-pos-border bg-pos-background focus:outline-none focus:ring-2 focus:ring-pos-accent"
								/>
							</div>
						</div>
					</div>
				</PosCard>
			</div>
		</div>
	);
}