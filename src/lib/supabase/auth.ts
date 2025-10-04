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
  const biography = String(formData.get("biography") || "")

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
      biography,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // usernamesテーブルも同期
  await supabase
    .from("usernames")
    .update({
      screen_name: screenName,
      biography,
    })
    .eq("id", user.id)

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function updateAllProfile(_: unknown, formData: FormData) {
  const screenName = String(formData.get("screenName") || "")
  const biography = String(formData.get("biography") || "")
  const rawUserId = String(formData.get("userId") || "")
  const userId = rawUserId.trim().toLowerCase()
  const avatarFile = formData.get("avatar") as File

  const supabase = createClient()

  // 現在のユーザー情報を取得
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "認証が必要です" }
  }

  // ユーザーID検証
  if (userId && !/^[a-z0-9_]{3,20}$/.test(userId)) {
    return { error: "ユーザーIDは3〜20文字の半角英数字とアンダースコアのみ利用できます" }
  }

  let avatarUrl = user.user_metadata?.avatar_url || ""
  let previousUserId = null

  // アバター画像処理
  if (avatarFile && avatarFile.size > 0) {
    // ファイルサイズチェック（5MB以下）
    if (avatarFile.size > 5 * 1024 * 1024) {
      return { error: "ファイルサイズは5MB以下にしてください" }
    }

    // ファイルタイプチェック
    if (!avatarFile.type.startsWith("image/")) {
      return { error: "画像ファイルを選択してください" }
    }

    // ファイル名を生成
    const fileExt = avatarFile.name.split(".").pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    // 古いアバターを削除
    const oldAvatarUrl = user.user_metadata?.avatar_url
    if (oldAvatarUrl) {
      const oldPath = oldAvatarUrl.split("/").slice(-2).join("/")
      await supabase.storage.from("avatars").remove([oldPath])
    }

    // 新しいアバターをアップロード
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatarFile, {
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
    avatarUrl = publicUrl
  }

  // ユーザーID処理
  if (userId) {
    const { data: currentEntry } = await supabase
      .from("usernames")
      .select("id, user_id")
      .eq("id", user.id)
      .maybeSingle()

    previousUserId = currentEntry?.user_id || null

    if (previousUserId !== userId) {
      // 重複チェック
      const { data: takenRecord, error: takenError } = await supabase
        .from("usernames")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle()

      if (takenError) {
        return { error: takenError.message }
      }

      if (takenRecord && takenRecord.id !== user.id) {
        return { error: "このユーザーIDは既に使用されています" }
      }
    }
  }

  // メタデータを更新
  const { error: metadataError } = await supabase.auth.updateUser({
    data: {
      screen_name: screenName,
      biography,
      avatar_url: avatarUrl,
      user_id: userId || user.user_metadata?.user_id,
    },
  })

  if (metadataError) {
    return { error: metadataError.message }
  }

  // usernamesテーブルを更新
  if (userId) {
    const { error: upsertError } = await supabase.from("usernames").upsert({
      id: user.id,
      user_id: userId,
      email: user.email,
      screen_name: screenName,
      avatar_url: avatarUrl,
      biography,
    })

    if (upsertError) {
      return { error: upsertError.message }
    }
  } else {
    // ユーザーIDが設定されていない場合は既存レコードを更新
    await supabase
      .from("usernames")
      .update({
        screen_name: screenName,
        avatar_url: avatarUrl,
        biography,
      })
      .eq("id", user.id)
  }

  // キャッシュ無効化
  if (previousUserId && previousUserId !== userId) {
    revalidatePath(`/${previousUserId}`)
  }
  if (userId) {
    revalidatePath(`/${userId}`)
  }
  revalidatePath("/profile")
  revalidatePath("/dashboard")
  revalidatePath("/", "layout")

  redirect("/profile")
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

  // usernamesテーブルも同期
  await supabase
    .from("usernames")
    .update({
      avatar_url: publicUrl,
    })
    .eq("id", user.id)

  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function updateUsername(_: unknown, formData: FormData) {
  const rawInput = String(formData.get("userId") || "")
  const userId = rawInput.trim().toLowerCase()

  if (!userId) {
    return { error: "ユーザーIDを入力してください" }
  }

  if (!/^[a-z0-9_]{3,20}$/.test(userId)) {
    return { error: "ユーザーIDは3〜20文字の半角英数字とアンダースコアのみ利用できます" }
  }

  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "認証が必要です" }
  }

  const { data: currentEntry, error: currentError } = await supabase
    .from("usernames")
    .select("id, user_id")
    .eq("id", user.id)
    .maybeSingle()

  if (currentError) {
    return { error: currentError.message }
  }

  const previousUserId = currentEntry?.user_id || null

  if (previousUserId === userId) {
    revalidatePath("/profile")
    revalidatePath("/dashboard")
    revalidatePath(`/${userId}`)
    redirect("/profile")
  }

  const { data: takenRecord, error: takenError } = await supabase
    .from("usernames")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle()

  if (takenError) {
    return { error: takenError.message }
  }

  if (takenRecord && takenRecord.id !== user.id) {
    return { error: "このユーザーIDは既に使用されています" }
  }

  const { error: upsertError } = await supabase
    .from("usernames")
    .upsert({
      id: user.id,
      user_id: userId,
      email: user.email,
      screen_name: user.user_metadata?.screen_name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
      biography: user.user_metadata?.biography || null,
    })

  if (upsertError) {
    return { error: upsertError.message }
  }

  const { error: metadataError } = await supabase.auth.updateUser({
    data: {
      user_id: userId,
    },
  })

  if (metadataError) {
    return { error: metadataError.message }
  }

  if (previousUserId && previousUserId !== userId) {
    revalidatePath(`/${previousUserId}`)
  }

  revalidatePath("/profile")
  revalidatePath("/dashboard")
  revalidatePath("/", "layout")
  revalidatePath(`/${userId}`)

  redirect("/profile")
}
