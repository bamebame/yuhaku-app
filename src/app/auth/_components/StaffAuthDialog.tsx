"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Loader2, ScanLine, AlertCircle } from "lucide-react";
import { PosButton } from "@/components/pos";
import { staffCodeSchema } from "@/features/staffs/schema/staff";
import { STAFF_CODE_LENGTH } from "@/features/staffs/types";

interface StaffAuthDialogProps {
  open: boolean;
  onSuccess: (staffCode: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function StaffAuthDialog({
  open,
  onSuccess,
  isLoading = false,
  error = null,
}: StaffAuthDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const [lastInputTime, setLastInputTime] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const [form, fields] = useForm({
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: staffCodeSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const submission = parseWithZod(new FormData(event.currentTarget), {
      schema: staffCodeSchema,
    });
    
    if (submission.status === "success") {
      onSuccess(submission.value.code);
    }
  };

  // バーコードスキャナー対応
  useEffect(() => {
    const handleInput = (value: string) => {
      const now = Date.now();
      const timeDiff = now - lastInputTime;
      
      // 高速入力（バーコードスキャナー）の検知
      if (timeDiff < 50) {
        // バーコード入力として処理
        if (value.length === STAFF_CODE_LENGTH) {
          // 自動送信
          setTimeout(() => {
            const formElement = document.getElementById(form.id) as HTMLFormElement;
            if (formElement) {
              formElement.requestSubmit();
            }
          }, 100);
        }
      }
      
      setLastInputTime(now);
    };

    if (inputValue) {
      handleInput(inputValue);
    }
  }, [inputValue, lastInputTime, form.id]);

  // ダイアログが開いたときにフォーカス
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // 入力値の変更ハンドラー
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setInputValue(value);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop - 透過背景 */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" />
      
      {/* Modal */}
      <div className="relative z-50 w-full max-w-md bg-white/95 backdrop-blur border-3 border-pos-border shadow-2xl">
        <div className="p-6">
          <h2 className="text-center text-2xl font-semibold mb-6">
            スタッフ認証
          </h2>

          <form
            id={form.id}
            method="post"
            className="space-y-6"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="space-y-4">
              <div className="text-center">
                <ScanLine className="mx-auto h-16 w-16 text-pos-muted mb-4" />
                <p className="text-sm text-pos-muted">
                  スタッフコードをスキャンまたは入力してください
                </p>
              </div>

              <div className="space-y-2">
                <input
                  ref={inputRef}
                  type="text"
                  name="code"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="SF••••••••••"
                  maxLength={STAFF_CODE_LENGTH}
                  className="w-full px-4 py-3 text-center text-xl font-mono tracking-wider border-3 border-pos-border focus:outline-none focus:ring-2 focus:ring-pos-accent uppercase"
                  disabled={isLoading}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
                
                {fields.code.errors && (
                  <p className="text-sm text-destructive text-center">
                    {fields.code.errors}
                  </p>
                )}
                
                {error && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <PosButton
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isLoading || inputValue.length !== STAFF_CODE_LENGTH}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      認証中...
                    </>
                  ) : (
                    "認証"
                  )}
                </PosButton>
                
                <p className="text-xs text-center text-pos-muted">
                  {inputValue.length} / {STAFF_CODE_LENGTH}
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}