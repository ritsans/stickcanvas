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

/**
 * 相互フォローかどうかをチェック
 */
export async function checkIsMutualFollow(targetAuthUserId: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || user.id === targetAuthUserId) {
    return false
  }

  // 自分が相手をフォローしているか
  const { data: following } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", user.id)
    .eq("following_id", targetAuthUserId)
    .maybeSingle()

  // 相手が自分をフォローしているか
  const { data: follower } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", targetAuthUserId)
    .eq("following_id", user.id)
    .maybeSingle()

  return !!following && !!follower
}

/**
 * 相手が自分をフォローしているかチェック（相互フォロー判定用）
 */
export async function checkIsFollowedBy(targetAuthUserId: string) {
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
    .eq("follower_id", targetAuthUserId)
    .eq("following_id", user.id)
    .maybeSingle()

  return !!data
}

/**
 * ログインユーザーがフォローしているユーザーのリストを取得
 */
export async function getFollowingUsers() {
  const supabase = createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: "認証が必要です" }
  }

  // フォローしているユーザーのIDリストを取得
  const { data: follows, error: followsError } = await supabase
    .from("follows")
    .select("following_id, created_at")
    .eq("follower_id", user.id)
    .order("created_at", { ascending: false })

  if (followsError) {
    return { error: followsError.message }
  }

  if (!follows || follows.length === 0) {
    return { users: [] }
  }

  // フォローしているユーザーの詳細情報を取得
  const followingIds = follows.map((f) => f.following_id)
  const { data: usernamesData, error: usernamesError } = await supabase
    .from("usernames")
    .select("id, user_id, screen_name, avatar_url, biography")
    .in("id", followingIds)

  if (usernamesError) {
    return { error: usernamesError.message }
  }

  // フォロー順にソートするためにマッピング
  const usersMap = new Map(usernamesData?.map((u) => [u.id, u]) ?? [])

  return {
    users: follows
      .map((follow) => {
        const userData = usersMap.get(follow.following_id)
        if (!userData) return null
        return {
          authUserId: follow.following_id,
          userId: userData.user_id ?? "",
          displayName: userData.screen_name ?? "",
          avatarUrl: userData.avatar_url ?? "",
          biography: userData.biography ?? "",
        }
      })
      .filter((u) => u !== null),
  }
}
