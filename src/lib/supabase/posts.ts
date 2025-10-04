"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "./server"

export async function createPost(_: unknown, formData: FormData) {
  const caption = String(formData.get("caption") || "")
  const imageFile = formData.get("image") as File

  const supabase = createClient()

  // 現在のユーザー情報を取得
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "認証が必要です" }
  }

  // キャプションと画像の両方が空の場合はエラー
  if (!caption.trim() && (!imageFile || imageFile.size === 0)) {
    return { error: "キャプションまたは画像を入力してください" }
  }

  // キャプションの文字数チェック
  if (caption.length > 2000) {
    return { error: "キャプションは2000文字以内で入力してください" }
  }

  let imageUrl = null
  let hasImage = false

  // 画像ファイルの処理
  if (imageFile && imageFile.size > 0) {
    // ファイルサイズチェック（5MB以下）
    if (imageFile.size > 5 * 1024 * 1024) {
      return { error: "画像ファイルは5MB以下にしてください" }
    }

    // ファイルタイプチェック
    if (!imageFile.type.startsWith("image/")) {
      return { error: "画像ファイルを選択してください" }
    }

    // 一時的なpost_idを生成（UUIDの代わりにタイムスタンプを使用）
    const postId = `${Date.now()}`
    const fileExt = imageFile.name.split(".").pop()
    const fileName = `${user.id}/${postId}/${Date.now()}.${fileExt}`

    // 画像をアップロード
    const { error: uploadError } = await supabase.storage
      .from("post-images")
      .upload(fileName, imageFile, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      return { error: uploadError.message }
    }

    // パブリックURLを取得
    const {
      data: { publicUrl },
    } = supabase.storage.from("post-images").getPublicUrl(fileName)

    imageUrl = publicUrl
    hasImage = true
  }

  // 投稿をデータベースに挿入
  const { error: insertError } = await supabase.from("posts").insert({
    user_id: user.id,
    caption: caption.trim() || null,
    image_url: imageUrl,
    has_image: hasImage,
  })

  if (insertError) {
    // アップロードした画像があれば削除
    if (imageUrl) {
      const fileName = imageUrl.split("/").slice(-3).join("/")
      await supabase.storage.from("post-images").remove([fileName])
    }
    return { error: insertError.message }
  }

  revalidatePath("/dashboard")
  revalidatePath("/", "layout")
  redirect("/dashboard")
}

export async function deletePost(postId: string) {
  const supabase = createClient()

  // 現在のユーザー情報を取得
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "認証が必要です" }
  }

  // 投稿を取得
  const { data: post, error: fetchError } = await supabase
    .from("posts")
    .select("id, user_id, image_url, has_image")
    .eq("id", postId)
    .single()

  if (fetchError || !post) {
    return { error: "投稿が見つかりません" }
  }

  // 投稿の所有者確認
  if (post.user_id !== user.id) {
    return { error: "この投稿を削除する権限がありません" }
  }

  // 画像がある場合は削除
  if (post.has_image && post.image_url) {
    const fileName = post.image_url.split("/").slice(-3).join("/")
    await supabase.storage.from("post-images").remove([fileName])
  }

  // 投稿を削除
  const { error: deleteError } = await supabase.from("posts").delete().eq("id", postId)

  if (deleteError) {
    return { error: deleteError.message }
  }

  revalidatePath("/dashboard")
  revalidatePath("/", "layout")
  return { success: true }
}

export async function getAllPosts() {
  const supabase = createClient()

  // 全ユーザーの投稿を取得（新しい順）
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("id, caption, image_url, has_image, created_at, user_id")
    .order("created_at", { ascending: false })

  if (postsError) {
    console.error("投稿の取得に失敗しました:", postsError)
    return []
  }

  if (!posts || posts.length === 0) {
    return []
  }

  // 投稿者のユーザー情報を取得
  const userIds = [...new Set(posts.map((p) => p.user_id))]
  const { data: usernames, error: usernamesError } = await supabase
    .from("usernames")
    .select("auth_user_id, user_id, screen_name, avatar_url, email")
    .in("auth_user_id", userIds)

  if (usernamesError) {
    console.error("ユーザー情報の取得に失敗しました:", usernamesError)
    return []
  }

  // ユーザー情報をマッピング
  const usernamesMap = new Map(usernames?.map((u) => [u.auth_user_id, u]) || [])

  // 投稿とユーザー情報を結合
  return posts.map((post) => ({
    ...post,
    usernames: usernamesMap.get(post.user_id) || null,
  }))
}
