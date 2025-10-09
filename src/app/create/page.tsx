"use client"

import { useActionState, useState } from "react"
import { createPost } from "@/lib/supabase/posts"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function PostForm() {
  const [formState, formAction, formPending] = useActionState(createPost, null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleRemoveImage = () => {
    setPreviewUrl(null)
    const fileInput = document.getElementById("image") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-12">
      <form action={formAction} className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">新しい投稿</h2>

      {/* 画像プレビュー */}
      {previewUrl && (
        <div className="mb-4 relative">
          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
            <Image
              src={previewUrl}
              alt="プレビュー"
              fill
              sizes="(max-width: 672px) 100vw, 672px"
              className="object-cover"
            />
          </div>
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute right-2 top-2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* 画像アップロード */}
      <div className="mb-4">
        <label
          htmlFor="image"
          className="block cursor-pointer rounded border-2 border-dashed border-gray-300 p-4 text-center hover:border-gray-400"
        >
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600">画像を選択（任意）</p>
          <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF（最大5MB）</p>
        </label>
        <input
          type="file"
          id="image"
          name="image"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* キャプション入力 */}
      <div className="mb-4">
        <label htmlFor="caption" className="block text-sm font-medium">
          キャプション
        </label>
        <textarea
          id="caption"
          name="caption"
          rows={4}
          maxLength={2000}
          className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
          placeholder="この投稿について..."
        />
        <p className="mt-1 text-xs text-gray-500">最大2000文字まで</p>
      </div>

      {/* エラー表示 */}
      {formState?.error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4">
          <p className="text-sm text-red-600">{formState.error}</p>
        </div>
      )}

        {/* 投稿ボタン */}
        <div className="flex justify-end">
          <Button type="submit" disabled={formPending}>
            {formPending ? "投稿中..." : "投稿する"}
          </Button>
        </div>
      </form>
    </main>
  )
}
