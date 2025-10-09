"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { signIn } from "@/lib/supabase/auth";
import { signInSchema } from "@/lib/validations/auth";
import { z } from "zod";
import { Button } from "@/components/ui/button";

type FormState = {
  error?: string;
};

const initialState: FormState = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "サインイン中..." : "ログイン"}
    </Button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState(signIn, initialState);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleChange = (field: "email" | "password", value: string) => {
    try {
      signInSchema.shape[field].parse(value);
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstIssue = error.issues[0];
        setErrors((prev) => ({
          ...prev,
          [field]: firstIssue?.message,
        }));
      }
    }
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      signInSchema.parse({
        email: formData.get("email"),
        password: formData.get("password"),
      });
      setErrors({});
      return formAction(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { email?: string; password?: string } = {};
        for (const issue of error.issues) {
          const fieldKey = issue.path[0];
          if (fieldKey === "email" || fieldKey === "password") {
            newErrors[fieldKey] = issue.message;
          }
        }
        setErrors(newErrors);
      }
    }
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          メールアドレス
          <input
            name="email"
            type="email"
            autoComplete="email"
            className="mt-1 w-full rounded border px-3 py-2"
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </label>
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          パスワード
          <input
            name="password"
            type="password"
            autoComplete="current-password"
            className="mt-1 w-full rounded border px-3 py-2"
            onChange={(e) => handleChange("password", e.target.value)}
          />
        </label>
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
      <div className="flex justify-between text-sm">
        <Link href="/forgot-password" className="text-gray-600 underline">
          パスワードをお忘れですか？
        </Link>
      </div>
      <p className="text-sm text-gray-600">
        アカウントをお持ちでない場合は{" "}
        <Link href="/signup" className="underline">
          新規登録
        </Link>
        へどうぞ。
      </p>
    </form>
  );
}
