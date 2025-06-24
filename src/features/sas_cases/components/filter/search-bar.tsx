"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, Package } from "lucide-react";
import { useFilterStore } from "../../stores/filter-store";
import { useDebouncedCallback } from "use-debounce";
import { PosButton } from "@/components/pos";
import { cn } from "@/lib/utils";

export function SearchBar() {
	const {
		searchKeyword,
		setSearchKeyword,
		searchHistory,
		addSearchHistory,
		clearSearchHistory,
		showInStockOnly,
		setShowInStockOnly,
	} = useFilterStore();
	
	const [inputValue, setInputValue] = useState(searchKeyword);
	const [showHistory, setShowHistory] = useState(false);
	
	// デバウンスされた検索
	const debouncedSearch = useDebouncedCallback((value: string) => {
		setSearchKeyword(value);
		if (value.trim()) {
			addSearchHistory(value.trim());
		}
	}, 300);
	
	// 入力値の変更
	const handleInputChange = (value: string) => {
		setInputValue(value);
		debouncedSearch(value);
	};
	
	// クリア
	const handleClear = () => {
		setInputValue('');
		setSearchKeyword('');
		setShowHistory(false);
	};
	
	// 検索履歴から選択
	const handleSelectHistory = (keyword: string) => {
		setInputValue(keyword);
		setSearchKeyword(keyword);
		setShowHistory(false);
	};
	
	// フォーカス時の処理
	const handleFocus = () => {
		if (searchHistory.length > 0) {
			setShowHistory(true);
		}
	};
	
	// キーボードショートカット
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
				e.preventDefault();
				document.getElementById('product-search')?.focus();
			}
		};
		
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, []);
	
	return (
		<div className="relative">
			<div className="flex items-center gap-2 p-4">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-pos-muted" />
					<input
						id="product-search"
						type="text"
						value={inputValue}
						onChange={(e) => handleInputChange(e.target.value)}
						onFocus={handleFocus}
						onBlur={() => setTimeout(() => setShowHistory(false), 200)}
						placeholder="商品名・コード・シリーズで検索..."
						className="w-full pl-10 pr-10 py-2 border-2 border-pos-border focus:outline-none focus:ring-2 focus:ring-pos-accent"
					/>
					{inputValue && (
						<button
							onClick={handleClear}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-pos-muted hover:text-pos-foreground"
						>
							<X className="h-4 w-4" />
						</button>
					)}
				</div>
				<PosButton
					onClick={() => {
						if (inputValue.trim()) {
							addSearchHistory(inputValue.trim());
						}
					}}
					disabled={!inputValue.trim()}
				>
					検索
				</PosButton>
				
				{/* 在庫ありのみチェックボックス */}
				<div className="flex items-center gap-2 ml-2">
					<button
						onClick={() => setShowInStockOnly(!showInStockOnly)}
						className={cn(
							"flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all",
							"border-2 border-pos-border rounded",
							showInStockOnly ? "bg-pos-foreground text-white" : "bg-white hover:bg-pos-hover"
						)}
					>
						<div 
							className={cn(
								"w-4 h-4 border-2 rounded flex items-center justify-center",
								showInStockOnly ? "bg-white border-white" : "border-pos-border"
							)}
						>
							{showInStockOnly && (
								<svg
									className="w-3 h-3 text-pos-foreground"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={3}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							)}
						</div>
						<Package className="h-4 w-4" />
						<span>在庫あり</span>
					</button>
				</div>
			</div>
			
			{/* 検索履歴 */}
			{showHistory && searchHistory.length > 0 && (
				<div className="absolute top-full left-0 right-0 z-50 bg-white border-2 border-t-0 border-pos-border shadow-lg">
					<div className="flex items-center justify-between px-4 py-2 border-b border-pos-border">
						<span className="text-sm font-semibold">最近の検索</span>
						<button
							onClick={() => {
								clearSearchHistory();
								setShowHistory(false);
							}}
							className="text-xs text-pos-muted hover:text-pos-foreground"
						>
							履歴をクリア
						</button>
					</div>
					<div className="max-h-40 overflow-y-auto">
						{searchHistory.map((keyword, index) => (
							<button
								key={index}
								onClick={() => handleSelectHistory(keyword)}
								className="w-full px-4 py-2 text-left hover:bg-pos-hover transition-colors"
							>
								{keyword}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}