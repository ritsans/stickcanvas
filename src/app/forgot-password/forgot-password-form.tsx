"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import Link from "next/link"
import { requestPasswordReset } from "@/lib/supabase/auth"
import { forgotPasswordSchema } from "@/lib/validations/auth"
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
      {pending ? "送信中..." : "リセットリンクを送信"}
    </button>
  )
}

export default function ForgotPasswordForm() {
  const [state, formAction] = useActionState(requestPasswordReset, initialState)
  const [errors, setErrors] = useState<{ email?: string }>({})

  const handleChange = (value: string) => {
    try {
      forgotPasswordSchema.shape.email.parse(value)
      setErrors({ email: undefined })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstIssue = error.issues[0]
        setErrors({ email: firstIssue?.message })
      }
    }
  }

  const handleSubmit = async (formData: FormData) => {
    try {
      forgotPasswordSchema.parse({
        email: formData.get("email"),
      })
      setErrors({})
      return formAction(formData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstIssue = error.issues[0]
        setErrors({ email: firstIssue?.message })
      }
    }
  }

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
            onChange={(e) => handleChange(e.target.value)}
          />
        </label>
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
      <p className="text-sm text-gray-600">
        <Link href="/login" className="underline">
          ログインページに戻る
        </Link>
      </p>
    </form>
  )
}
