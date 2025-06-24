"use client";

import { useState, useEffect } from "react";
import { useSasCaseEditStore } from "@/features/sas_cases/stores/edit-store";
import { PosButton, PosCard, PosInput } from "@/components/pos";
import { User, FileText, Search, X } from "lucide-react";
import { MemberSearchModal } from "@/features/members/components/search-modal";
import useSWR from "swr";
import type { Member } from "@/features/members/types";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function CustomerInfoPanel() {
	const { memberId, note, customerNote, updateMemberId, updateNote, updateCustomerNote } = useSasCaseEditStore();
	const [memberSearchOpen, setMemberSearchOpen] = useState(false);
	const [noteInput, setNoteInput] = useState(note || "");
	const [customerNoteInput, setCustomerNoteInput] = useState(customerNote || "");

	// 会員情報を取得
	const { data: memberData } = useSWR<{ data: Member }>(
		memberId ? `/api/members/${memberId}` : null,
		fetcher
	);

	const member = memberData?.data;

	useEffect(() => {
		setNoteInput(note || "");
	}, [note]);

	useEffect(() => {
		setCustomerNoteInput(customerNote || "");
	}, [customerNote]);

	const handleMemberSearch = () => {
		setMemberSearchOpen(true);
	};

	const handleMemberSelect = (memberIds: string[]) => {
		if (memberIds.length > 0) {
			updateMemberId(memberIds[0]);
		}
	};

	const handleClearMember = () => {
		updateMemberId(null);
	};

	const handleSaveNote = () => {
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
						
						{!memberId ? (
							<div className="space-y-3">
								<p className="text-pos-sm text-pos-muted">
									会員が選択されていません
								</p>
								<PosButton
									variant="outline"
									onClick={handleMemberSearch}
									className="w-full"
								>
									<Search className="mr-2 h-4 w-4" />
									会員を検索
								</PosButton>
							</div>
						) : (
							<div className="space-y-3">
								{member ? (
									<div className="border-2 border-pos-border p-3 bg-pos-background">
										<div className="flex items-start justify-between">
											<div className="space-y-1">
												<div className="flex items-center gap-2">
													<span className="font-medium">{member.code}</span>
													{member.lastName && member.firstName && (
														<span>{member.lastName} {member.firstName}</span>
													)}
												</div>
												{member.email && (
													<p className="text-pos-sm text-pos-muted">{member.email}</p>
												)}
												{member.tel && (
													<p className="text-pos-sm text-pos-muted">{member.tel}</p>
												)}
												<div className="flex items-center gap-4 mt-2">
													<span className="text-pos-sm font-medium">
														ポイント: {member.point ? `${member.point.total.toLocaleString()} pt` : "0 pt"}
													</span>
													<span className="text-pos-xs text-pos-muted">
														ステータス: {member.status}
													</span>
												</div>
											</div>
											<PosButton
												size="icon"
												variant="ghost"
												onClick={handleClearMember}
												className="h-8 w-8"
											>
												<X className="h-4 w-4" />
											</PosButton>
										</div>
									</div>
								) : (
									<div className="text-pos-sm text-pos-muted">
										会員情報を読み込み中...
									</div>
								)}
								
								<PosButton
									variant="outline"
									size="sm"
									onClick={handleMemberSearch}
									className="w-full"
								>
									<Search className="mr-2 h-3 w-3" />
									別の会員を検索
								</PosButton>
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
									onBlur={handleSaveNote}
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
									onBlur={handleSaveNote}
									placeholder="レシートに印刷されるメモを入力"
									rows={3}
									className="w-full px-3 py-2 text-pos-sm border-2 border-pos-border bg-pos-background focus:outline-none focus:ring-2 focus:ring-pos-accent"
								/>
							</div>
						</div>
					</div>
				</PosCard>
			</div>

			{/* 会員検索モーダル */}
			<MemberSearchModal
				open={memberSearchOpen}
				onOpenChange={setMemberSearchOpen}
				selectedMemberIds={memberId ? [memberId] : []}
				onConfirm={handleMemberSelect}
				multiSelect={false}
			/>
		</div>
	);
}