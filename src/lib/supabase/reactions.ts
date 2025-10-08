"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "./server"

/**
 * リアクションを追加（既存のリアクションがあれば絵文字を更新）
 */
export async function addReaction(postId: string, emoji: string) {
  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "認証が必要です" }
  }

  // 既存のリアクションがあるか確認
  const { data: existingReaction } = await supabase
    .from("reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (existingReaction) {
    // 既存のリアクションがある場合は絵文字を更新
    const { error } = await supabase
      .from("reactions")
      .update({ emoji })
      .eq("id", existingReaction.id)

    if (error) {
      return { error: error.message }
    }
  } else {
    // 新規リアクションを追加
    const { error } = await supabase.from("reactions").insert({
      post_id: postId,
      user_id: user.id,
      emoji,
    })

    if (error) {
      return { error: error.message }
    }
  }

  revalidatePath("/", "layout")
  return { success: true }
}

/**
 * リアクションを削除
 */
export async function removeReaction(postId: string) {
  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "認証が必要です" }
  }

  const { error } = await supabase
    .from("reactions")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  return { success: true }
}

/**
 * 投稿のリアクション一覧を取得（絵文字ごとのカウント）
 */
export async function getPostReactions(postId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("reactions")
    .select("emoji")
    .eq("post_id", postId)

  if (error) {
    console.error("リアクション取得エラー:", error)
    return []
  }

  // 絵文字ごとにカウント
  const reactionCounts = new Map<string, number>()
  data?.forEach((reaction) => {
    const count = reactionCounts.get(reaction.emoji) || 0
    reactionCounts.set(reaction.emoji, count + 1)
  })

  return Array.from(reactionCounts.entries()).map(([emoji, count]) => ({
    emoji,
    count,
  }))
}

/**
 * ログインユーザーの投稿へのリアクションを取得
 */
export async function getUserReaction(postId: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from("reactions")
    .select("emoji")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return data.emoji
}
