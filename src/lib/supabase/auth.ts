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
  redirect("/dashboard")
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

export async function requestPasswordReset(_: unknown, formData: FormData) {
  const email = String(formData.get("email") || "")

  const supabase = createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/reset-password-sent")
}

export async function resetPassword(_: unknown, formData: FormData) {
  const password = String(formData.get("password") || "")

  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function updateProfile(_: unknown, formData: FormData) {
  const screenName = String(formData.get("screenName") || "")

  const supabase = createClient()

  // 現在のユーザー情報を取得
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "認証が必要です" }
  }

  // メタデータを更新
  const { error } = await supabase.auth.updateUser({
    data: {
      screen_name: screenName,
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function uploadAvatar(_: unknown, formData: FormData) {
  const file = formData.get("avatar") as File

  if (!file || file.size === 0) {
    return { error: "ファイルを選択してください" }
  }

  // ファイルサイズチェック（5MB以下）
  if (file.size > 5 * 1024 * 1024) {
    return { error: "ファイルサイズは5MB以下にしてください" }
  }

  // ファイルタイプチェック
  if (!file.type.startsWith("image/")) {
    return { error: "画像ファイルを選択してください" }
  }

  const supabase = createClient()

  // 現在のユーザー情報を取得
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "認証が必要です" }
  }

  // ファイル名を生成（ユーザーID/タイムスタンプ.拡張子）
  const fileExt = file.name.split(".").pop()
  const fileName = `${user.id}/${Date.now()}.${fileExt}`

  // 古いアバターを削除（存在する場合）
  const oldAvatarUrl = user.user_metadata?.avatar_url
  if (oldAvatarUrl) {
    const oldPath = oldAvatarUrl.split("/").slice(-2).join("/")
    await supabase.storage.from("avatars").remove([oldPath])
  }

  // 新しいアバターをアップロード
  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    })

  if (uploadError) {
    return { error: uploadError.message }
  }

  // パブリックURLを取得
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(fileName)

  // メタデータにアバターURLを保存
  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      avatar_url: publicUrl,
    },
  })

  if (updateError) {
    return { error: updateError.message }
  }

  revalidatePath("/", "layout")
  redirect("/dashboard")
}
