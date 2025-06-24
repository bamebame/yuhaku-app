"use client";

import { useState } from "react";
import { PosButton, PosInput, PosCard, PosCardContent } from "@/components/pos";
import { Calendar, Users, X } from "lucide-react";
import { MemberSearchModal } from "@/features/members/components/search-modal";
import { format } from "date-fns";

interface SasCasesFilterProps {
  onFilterChange: (filters: FilterValues) => void;
}

export interface FilterValues {
  doneAtFrom?: string;
  doneAtTo?: string;
  memberIds?: string[];
}

export function SasCasesFilter({ onFilterChange }: SasCasesFilterProps) {
  const [doneAtFrom, setDoneAtFrom] = useState("");
  const [doneAtTo, setDoneAtTo] = useState("");
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [showMemberSearch, setShowMemberSearch] = useState(false);
  
  const handleApplyFilter = () => {
    const filters: FilterValues = {};
    
    if (doneAtFrom) {
      filters.doneAtFrom = `${doneAtFrom} 00:00:00`;
    }
    if (doneAtTo) {
      filters.doneAtTo = `${doneAtTo} 23:59:59`;
    }
    if (selectedMemberIds.length > 0) {
      filters.memberIds = selectedMemberIds;
    }
    
    onFilterChange(filters);
  };
  
  const handleClearFilter = () => {
    setDoneAtFrom("");
    setDoneAtTo("");
    setSelectedMemberIds([]);
    onFilterChange({});
  };
  
  const handleMemberSelect = (memberIds: string[]) => {
    setSelectedMemberIds(memberIds);
  };
  
  const hasFilters = doneAtFrom || doneAtTo || selectedMemberIds.length > 0;
  
  return (
    <>
      <PosCard>
        <PosCardContent className="p-4">
          <div className="space-y-4">
            {/* 完了日付範囲 */}
            <div>
              <label className="text-pos-sm font-medium mb-2 block">完了日付範囲</label>
              <div className="flex gap-2 items-center">
                <Calendar className="h-4 w-4 text-pos-muted" />
                <PosInput
                  type="date"
                  value={doneAtFrom}
                  onChange={(e) => setDoneAtFrom(e.target.value)}
                  className="flex-1"
                />
                <span className="text-pos-muted">〜</span>
                <PosInput
                  type="date"
                  value={doneAtTo}
                  onChange={(e) => setDoneAtTo(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
            
            {/* 会員選択 */}
            <div>
              <label className="text-pos-sm font-medium mb-2 block">会員絞り込み</label>
              <div className="flex gap-2">
                <PosButton
                  variant="outline"
                  className="flex-1 justify-start"
                  onClick={() => setShowMemberSearch(true)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  {selectedMemberIds.length > 0
                    ? `${selectedMemberIds.length}名の会員を選択中`
                    : "会員を選択"}
                </PosButton>
                {selectedMemberIds.length > 0 && (
                  <PosButton
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedMemberIds([])}
                  >
                    <X className="h-4 w-4" />
                  </PosButton>
                )}
              </div>
            </div>
            
            {/* フィルタボタン */}
            <div className="flex gap-2">
              <PosButton
                variant="default"
                onClick={handleApplyFilter}
                className="flex-1"
              >
                フィルタを適用
              </PosButton>
              {hasFilters && (
                <PosButton
                  variant="secondary"
                  onClick={handleClearFilter}
                >
                  クリア
                </PosButton>
              )}
            </div>
          </div>
        </PosCardContent>
      </PosCard>
      
      {/* 会員検索モーダル */}
      <MemberSearchModal
        open={showMemberSearch}
        onOpenChange={setShowMemberSearch}
        selectedMemberIds={selectedMemberIds}
        onConfirm={handleMemberSelect}
      />
    </>
  );
}