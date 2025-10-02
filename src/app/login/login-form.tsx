"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { signIn } from "@/lib/supabase/auth";

type FormState = {
  error?: string;
};

const initialState: FormState = {};

// issue: この段階ではまだログイン・ログアウトが正常にできるかテストしただけのコードです。

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "サインイン中..." : "ログイン"}
    </button>
  );
}

export default function LoginForm() {
  const [state, formAction] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          メールアドレス
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          パスワード
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
      <p className="text-sm text-gray-600">
        アカウントをお持ちでない場合は{" "}
        <Link href="/sign-up" className="underline">
          新規登録
        </Link>
        へどうぞ。
      </p>
    </form>
  );
}
