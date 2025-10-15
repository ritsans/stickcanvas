"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { resetPassword } from "@/lib/supabase/auth"
import { resetPasswordSchema } from "@/lib/validations/auth"
<<<<<<< Updated upstream
import { z } from "zod"
=======
import { z } from "@/lib/zod"
import { Button } from "@/components/ui/button"
>>>>>>> Stashed changes

type FormState = {
  error?: string
}

const initialState: FormState = {}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "更新中..." : "パスワードを更新"}
    </button>
  )
}

export default function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPassword, initialState)
  const [errors, setErrors] = useState<{ password?: string; password_confirm?: string }>({})

  const handleChange = (field: "password" | "password_confirm", value: string) => {
    try {
      if (field === "password") {
        resetPasswordSchema.shape[field].parse(value)
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      } else {
        // password_confirmは単体バリデーションのみ（一致チェックは送信時）
        z.string().min(1, "パスワード（確認）を入力してください").parse(value)
        setErrors((prev) => ({ ...prev, [field]: undefined }))
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstIssue = error.issues[0]
        setErrors((prev) => ({
          ...prev,
          [field]: firstIssue?.message,
        }))
      }
    }
  }

  const handleSubmit = async (formData: FormData) => {
    try {
      resetPasswordSchema.parse({
        password: formData.get("password"),
        password_confirm: formData.get("password_confirm"),
      })
      setErrors({})
      return formAction(formData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: { password?: string; password_confirm?: string } = {}
        for (const issue of error.issues) {
          const fieldKey = issue.path[0]
          if (fieldKey === "password" || fieldKey === "password_confirm") {
            newErrors[fieldKey] = issue.message
          }
        }
        setErrors(newErrors)
      }
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          新しいパスワード
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full rounded border px-3 py-2"
            onChange={(e) => handleChange("password", e.target.value)}
          />
        </label>
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          新しいパスワード（確認）
          <input
            name="password_confirm"
            type="password"
            autoComplete="new-password"
            className="mt-1 w-full rounded border px-3 py-2"
            onChange={(e) => handleChange("password_confirm", e.target.value)}
          />
        </label>
        {errors.password_confirm && (
          <p className="mt-1 text-xs text-red-600">{errors.password_confirm}</p>
        )}
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  )
}
