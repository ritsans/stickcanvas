"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "./server"

export async function signIn(_: unknown, formData: FormData) {
  const email = String(formData.get("email") || "")
  const password = String(formData.get("password") || "")

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    // そのままフォームの下にエラー表示したい場合は return で返す
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/dashbord")
}

export async function signUp(_: unknown, formData: FormData) {
  const email = String(formData.get("email") || "")
  const password = String(formData.get("password") || "")

  const supabase = createClient()
  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { error: error.message }
  }

  // メール確認を有効にしている場合は確認フローへ誘導するのが一般的
  revalidatePath("/", "layout")
  redirect("/check-email")
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}
