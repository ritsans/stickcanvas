import { z } from "@/lib/zod"

// メールアドレスのバリデーションルール
export const emailSchema = z
  .string()
  .min(1, "メールアドレスを入力してください")
  //.email(z.string().emailは非推奨になりました)
  .pipe(z.email({ message: "有効なメールアドレスを入力してください" }))

// パスワードのバリデーションルール
export const passwordSchema = z.string().min(8, "パスワードは8文字以上で入力してください")

// ログインフォームのスキーマ
export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

// 新規登録フォームのスキーマ
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

// パスワードリセット申請フォームのスキーマ
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

// パスワードリセットフォームのスキーマ
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    password_confirm: z.string().min(1, "パスワード（確認）を入力してください"),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "パスワードが一致しません",
    path: ["password_confirm"],
  })

export type SignInFormData = z.infer<typeof signInSchema>
export type SignUpFormData = z.infer<typeof signUpSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
