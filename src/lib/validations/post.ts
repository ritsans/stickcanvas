import { z } from "zod"

// 投稿キャプションのバリデーションルール
export const captionSchema = z
  .string()
  .max(2000, "キャプションは2000文字以内で入力してください")
  .optional()

// 投稿作成フォームのスキーマ
export const createPostSchema = z.object({
  caption: captionSchema,
})

export type CreatePostFormData = z.infer<typeof createPostSchema>
