"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "./server"

/**
 * 指定したユーザーをフォローする
 */
export async function followUser(targetAuthUserId: string) {
  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "認証が必要です" }
  }

  if (user.id === targetAuthUserId) {
    return { error: "自分自身をフォローすることはできません" }
  }

  const { error } = await supabase.from("follows").insert({
    follower_id: user.id,
    following_id: targetAuthUserId,
  })

  if (error) {
    return { error: error.message }
  }

  // プロフィールページのキャッシュを無効化
  const { data: targetUser } = await supabase
    .from("usernames")
    .select("user_id")
    .eq("id", targetAuthUserId)
    .single()

  if (targetUser?.user_id) {
    revalidatePath(`/${targetUser.user_id}`)
  }

  return { success: true }
}

/**
 * 指定したユーザーのフォローを解除する
 */
export async function unfollowUser(targetAuthUserId: string) {
  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "認証が必要です" }
  }

  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", targetAuthUserId)

  if (error) {
    return { error: error.message }
  }

  // プロフィールページのキャッシュを無効化
  const { data: targetUser } = await supabase
    .from("usernames")
    .select("user_id")
    .eq("id", targetAuthUserId)
    .single()

  if (targetUser?.user_id) {
    revalidatePath(`/${targetUser.user_id}`)
  }

  return { success: true }
}

/**
 * フォロー数・フォロワー数を取得
 */
export async function getFollowStats(authUserId: string) {
  const supabase = createClient()

  // フォロー数
  const { count: followingCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower_id", authUserId)

  // フォロワー数
  const { count: followerCount } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following_id", authUserId)

  return {
    followingCount: followingCount ?? 0,
    followerCount: followerCount ?? 0,
  }
}

/**
 * ログインユーザーが指定したユーザーをフォローしているかチェック
 */
export async function checkIsFollowing(targetAuthUserId: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", targetAuthUserId)
    .maybeSingle()

  return !!data
}
