"use client"

import { useActionState, useState } from "react"
import { updateProfile, uploadAvatar } from "@/lib/supabase/auth"
import type { User } from "@supabase/supabase-js"
import Image from "next/image"

export default function ProfileForm({ user }: { user: User }) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfile, null)
  const [avatarState, avatarAction, avatarPending] = useActionState(uploadAvatar, null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const currentScreenName = user.user_metadata?.screen_name || ""
  const currentAvatarUrl = user.user_metadata?.avatar_url || ""

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
    <div className="space-y-8">
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

        <form action={avatarAction} className="space-y-4">
          <div>
            <input
              type="file"
              id="avatar"
              name="avatar"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-900 file:mr-4 file:rounded file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
            />
            <p className="mt-2 text-xs text-gray-500">
              PNG, JPG, GIF（最大5MB）
            </p>
          </div>

          {avatarState?.error && (
            <p className="text-sm text-red-600">{avatarState.error}</p>
          )}

          <button
            type="submit"
            disabled={avatarPending}
            className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {avatarPending ? "アップロード中..." : "アバターを更新"}
          </button>
        </form>
      </section>

      {/* スクリーンネームセクション */}
      <section className="rounded-lg border border-gray-200 p-6">
        <h2 className="mb-4 text-lg font-semibold">スクリーンネーム</h2>

        <form action={profileAction} className="space-y-4">
          <div>
            <label htmlFor="screenName" className="block text-sm font-medium">
              表示名
            </label>
            <input
              type="text"
              id="screenName"
              name="screenName"
              defaultValue={currentScreenName}
              className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
              placeholder="山田太郎"
            />
          </div>

          {profileState?.error && (
            <p className="text-sm text-red-600">{profileState.error}</p>
          )}

          <button
            type="submit"
            disabled={profilePending}
            className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
          >
            {profilePending ? "保存中..." : "保存"}
          </button>
        </form>
      </section>

      {/* メールアドレス（読み取り専用） */}
      <section className="rounded-lg border border-gray-200 p-6">
        <h2 className="mb-4 text-lg font-semibold">アカウント情報</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            メールアドレス
          </label>
          <p className="mt-1 text-sm text-gray-900">{user.email}</p>
        </div>
      </section>
    </div>
  )
}
