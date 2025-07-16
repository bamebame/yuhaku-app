"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  PosDialog,
  PosDialogContent,
  PosDialogHeader,
  PosDialogTitle,
  PosDialogFooter,
  PosButton,
  PosInput
} from "@/components/pos";
import { Search, Check, User } from "lucide-react";
import type { Member } from "../types";
import useSWR from "swr";
import { useDebounce } from "@/hooks/use-debounce";

interface MemberSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMemberIds: string[];
  onConfirm: (memberIds: string[]) => void;
  multiSelect?: boolean; // デフォルトは複数選択
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function MemberSearchModal({
  open,
  onOpenChange,
  selectedMemberIds,
  onConfirm,
  multiSelect = true
}: MemberSearchModalProps) {
  const [searchType, setSearchType] = useState<"code" | "keyword">("keyword");
  const [searchValue, setSearchValue] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedMemberIds);
  
  // 検索値をdebounce（300ms）
  const debouncedSearchValue = useDebounce(searchValue, 300);
  
  // 検索パラメータの構築
  const searchParams = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedSearchValue && open) {
      if (searchType === "code") {
        params.append("codes", debouncedSearchValue);
      } else {
        params.append("keyword", debouncedSearchValue);
      }
      params.append("limit", "50");
    }
    return params.toString();
  }, [debouncedSearchValue, searchType, open]);
  
  const { data, isLoading } = useSWR<{ data: Member[] }>(
    searchParams ? `/api/members?${searchParams}` : null,
    fetcher
  );
  
  // モーダルが開いたときに選択状態を初期化
  useEffect(() => {
    if (open) {
      setSelectedIds(selectedMemberIds);
    }
  }, [open, selectedMemberIds]);
  
  const handleToggleMember = (memberId: string) => {
    if (multiSelect) {
      if (selectedIds.includes(memberId)) {
        setSelectedIds(selectedIds.filter(id => id !== memberId));
      } else {
        setSelectedIds([...selectedIds, memberId]);
      }
    } else {
      // 単一選択モード
      setSelectedIds([memberId]);
    }
  };
  
  const handleConfirm = () => {
    onConfirm(selectedIds);
    onOpenChange(false);
  };
  
  const handleCancel = () => {
    setSearchValue("");
    onOpenChange(false);
  };
  
  return (
    <PosDialog open={open} onOpenChange={onOpenChange}>
      <PosDialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <PosDialogHeader>
          <PosDialogTitle>会員検索</PosDialogTitle>
        </PosDialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col space-y-4 p-4">
          {/* 検索タイプ選択 */}
          <div className="flex gap-2">
            <PosButton
              variant={searchType === "code" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSearchType("code");
                setSearchValue("");
              }}
            >
              会員コード
            </PosButton>
            <PosButton
              variant={searchType === "keyword" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSearchType("keyword");
                setSearchValue("");
              }}
            >
              キーワード
            </PosButton>
          </div>
          
          {/* 検索入力 */}
          <div className="flex gap-2">
            <PosInput
              placeholder={searchType === "code" ? "会員コードを入力" : "名前・電話番号・メールアドレスなど"}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                }
              }}
            />
            <PosButton variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </PosButton>
          </div>
          
          {/* 選択済み会員数 */}
          {selectedIds.length > 0 && (
            <div className="text-pos-sm text-pos-muted">
              {selectedIds.length}名の会員を選択中
            </div>
          )}
          
          {/* 検索結果 */}
          <div className="flex-1 overflow-y-auto border-2 border-pos-border">
            {isLoading || (searchValue !== debouncedSearchValue) ? (
              <div className="p-4 text-center text-pos-muted">
                検索中...
              </div>
            ) : data?.data && data.data.length > 0 ? (
              <div className="divide-y divide-pos-border">
                {data.data.map((member) => (
                  <div
                    key={member.id}
                    className="p-4 flex items-center gap-4 hover:bg-pos-hover cursor-pointer"
                    onClick={() => handleToggleMember(member.id)}
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-6 h-6 border-2 border-pos-border flex items-center justify-center ${
                        selectedIds.includes(member.id) ? "bg-pos-foreground" : "bg-pos-background"
                      }`}>
                        {selectedIds.includes(member.id) && (
                          <Check className="h-4 w-4 text-pos-background" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-pos-muted" />
                        <span className="font-medium">{member.code}</span>
                        {member.lastName && member.firstName && (
                          <span>{member.lastName} {member.firstName}</span>
                        )}
                      </div>
                      <div className="text-pos-sm text-pos-muted">
                        {member.email && <span className="mr-4">{member.email}</span>}
                        {member.tel && <span>{member.tel}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-pos-sm font-medium">
                        {member.point ? `${member.point.total.toLocaleString()} pt` : "0 pt"}
                      </div>
                      <div className="text-pos-xs text-pos-muted">{member.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchValue ? (
              <div className="p-4 text-center text-pos-muted">
                該当する会員が見つかりません
              </div>
            ) : (
              <div className="p-4 text-center text-pos-muted">
                検索条件を入力してください
              </div>
            )}
          </div>
        </div>
        
        <PosDialogFooter>
          <PosButton variant="secondary" onClick={handleCancel}>
            キャンセル
          </PosButton>
          <PosButton onClick={handleConfirm}>
            選択確定 ({selectedIds.length}名)
          </PosButton>
        </PosDialogFooter>
      </PosDialogContent>
    </PosDialog>
  );
}