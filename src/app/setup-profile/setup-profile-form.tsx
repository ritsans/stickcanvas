"use client"

import { useActionState } from "react"
import { setupInitialProfile } from "@/lib/supabase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export function SetupProfileForm({ email }: { email: string }) {
  const [state, formAction, isPending] = useActionState(setupInitialProfile, null)

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">{state.error}</div>
      )}

      <div>
        <Label htmlFor="email">メールアドレス</Label>
        <Input id="email" type="email" value={email} disabled className="mt-1" />
      </div>

      <div>
        <Label htmlFor="userId">
          ユーザーID<span className="text-red-500">*</span>
        </Label>
        <Input
          id="userId"
          name="userId"
          type="text"
          placeholder="例: potato"
          required
          minLength={3}
          maxLength={20}
          pattern="^[a-z0-9_]{3,20}$"
          className="mt-1"
        />
        <p className="mt-1 text-xs text-gray-500">
          3〜20文字、半角英数字とアンダースコアのみ使用可能
        </p>
      </div>

      <div>
        <Label htmlFor="screenName">
          表示名<span className="text-red-500">*</span>
        </Label>
        <Input
          id="screenName"
          name="screenName"
          type="text"
          placeholder="例: ぽてと"
          required
          maxLength={50}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="avatar">アバター画像（任意）</Label>
        <Input id="avatar" name="avatar" type="file" accept="image/*" className="mt-1" />
        <p className="mt-1 text-xs text-gray-500">5MB以下の画像ファイル</p>
      </div>

      <div>
        <Label htmlFor="biography">自己紹介（任意）</Label>
        <Textarea
          id="biography"
          name="biography"
          placeholder="自己紹介を入力してください"
          maxLength={500}
          rows={4}
          className="mt-1"
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "設定中..." : "プロフィールを設定"}
      </Button>
    </form>
  )
}
