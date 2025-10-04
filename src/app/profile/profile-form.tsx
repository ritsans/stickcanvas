"use client"

import { useActionState, useState } from "react"
import { updateAllProfile } from "@/lib/supabase/auth"
import type { User } from "@supabase/supabase-js"
import Image from "next/image"

export default function ProfileForm({ user, userId }: { user: User; userId: string | null }) {
  const [formState, formAction, formPending] = useActionState(updateAllProfile, null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const currentDisplayName = user.user_metadata?.display_name || ""
  const currentBiography = user.user_metadata?.biography || ""
  const currentAvatarUrl = user.user_metadata?.avatar_url || ""
  const currentUserId = userId || ""
  const hasUserId = Boolean(currentUserId)
  const shareBaseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <form action={formAction} className="space-y-8">
      {/* アバター画像セクション */}
      <section className="rounded-lg border border-gray-200 p-6">
        <h2 className="mb-4 text-lg font-semibold">アバター画像</h2>

        <div className="mb-4 flex items-center gap-6">
          <div className="relative h-24 w-24 overflow-hidden rounded-full bg-gray-200">
            {(previewUrl || currentAvatarUrl) && (
              <Image
                src={previewUrl || currentAvatarUrl}
                alt="アバター"
                fill
                className="object-cover"
              />
            )}
            {!previewUrl && !currentAvatarUrl && (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <svg
                  className="h-12 w-12"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>

        <div>
          <input
            type="file"
            id="avatar"
            name="avatar"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-900 file:mr-4 file:rounded file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
          />
          <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF（最大5MB）</p>
        </div>
      </section>

      {/* ユーザーIDセクション */}
      <section className="rounded-lg border border-gray-200 p-6">
        <h2 className="mb-2 text-lg font-semibold">ユーザーID</h2>
        <p className="mb-4 text-sm text-gray-600">
          プロフィールURLに表示されるIDです。半角英数字とアンダースコアが利用できます。
        </p>

        <div>
          <label htmlFor="userId" className="block text-sm font-medium">
            ユーザーID
          </label>
          <div className="mt-1 flex">
            <span className="flex items-center rounded-l border border-gray-300 bg-gray-100 px-3 text-sm text-gray-600">
              {(shareBaseUrl || "stickcanvas.com").replace(/^https?:\/\//, "")}/
            </span>
            <input
              type="text"
              id="userId"
              name="userId"
              defaultValue={currentUserId}
              pattern="[a-z0-9_]{3,20}"
              title="3〜20文字の半角英数字とアンダースコアのみ利用できます"
              className="flex-1 rounded-r border border-l-0 border-gray-300 px-3 py-2"
              placeholder="your_id"
              required
            />
          </div>
        </div>

        {hasUserId && (
          <p className="mt-2 text-xs text-gray-500">
            公開URL：
            {shareBaseUrl
              ? `${shareBaseUrl}/${currentUserId}`
              : `https://stickcanvas.com/${currentUserId}`}
          </p>
        )}
      </section>

      {/* プロフィール情報セクション */}
      <section className="rounded-lg border border-gray-200 p-6">
        <h2 className="mb-4 text-lg font-semibold">プロフィール情報</h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium">
              表示名
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              defaultValue={currentDisplayName}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
              placeholder="山田太郎"
            />
          </div>

          <div>
            <label htmlFor="biography" className="block text-sm font-medium">
              自己紹介
            </label>
            <textarea
              id="biography"
              name="biography"
              defaultValue={currentBiography}
              rows={4}
              maxLength={500}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
              placeholder="あなたについて教えてください"
            />
            <p className="mt-1 text-xs text-gray-500">最大500文字まで</p>
          </div>
        </div>
      </section>

      {/* メールアドレス（読み取り専用） */}
      <section className="rounded-lg border border-gray-200 p-6">
        <h2 className="mb-4 text-lg font-semibold">アカウント情報</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">メールアドレス</label>
          <p className="mt-1 text-sm text-gray-900">{user.email}</p>
        </div>
      </section>

      {/* エラー表示と保存ボタン */}
      {formState?.error && (
        <div className="rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-600">{formState.error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={formPending}
          className="rounded bg-black px-6 py-2 text-sm text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
        >
          {formPending ? "保存中..." : "プロフィールを保存"}
        </button>
      </div>
    </form>
  )
}
