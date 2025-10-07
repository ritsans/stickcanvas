"use client"

import { useState, useTransition } from "react"
import { followUser, unfollowUser, checkIsFollowedBy } from "@/lib/supabase/follows"

type FollowButtonProps = {
  targetAuthUserId: string
  initialIsFollowing: boolean
  initialIsMutualFollow: boolean
  isOwnProfile: boolean
  isLoggedIn: boolean
}

export default function FollowButton({
  targetAuthUserId,
  initialIsFollowing,
  initialIsMutualFollow,
  isOwnProfile,
  isLoggedIn,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isMutualFollow, setIsMutualFollow] = useState(initialIsMutualFollow)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  // 自分のプロフィールの場合はボタンを表示しない
  if (isOwnProfile) {
    return null
  }

  // ログインしていない場合はボタンを無効化
  if (!isLoggedIn) {
    return (
      <button
        disabled
        className="rounded-lg bg-gray-300 px-6 py-2 text-sm font-semibold text-gray-500 cursor-not-allowed"
      >
        フォロー
      </button>
    )
  }

  const handleToggleFollow = () => {
    setError(null)
    startTransition(async () => {
      if (isFollowing) {
        const result = await unfollowUser(targetAuthUserId)
        if (result.error) {
          setError(result.error)
        } else {
          setIsFollowing(false)
          setIsMutualFollow(false)
        }
      } else {
        const result = await followUser(targetAuthUserId)
        if (result.error) {
          setError(result.error)
        } else {
          setIsFollowing(true)
          // フォローした直後に相互フォローかチェック（相手が既に自分をフォローしていれば相互フォローになる）
          const isFollowedBack = await checkIsFollowedBy(targetAuthUserId)
          if (isFollowedBack) {
            setIsMutualFollow(true)
          }
        }
      }
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={handleToggleFollow}
          disabled={isPending}
          className={`rounded-lg px-6 py-2 text-sm font-semibold transition-colors ${
            isFollowing
              ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              : "bg-blue-600 text-white hover:bg-blue-700"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isPending ? "処理中..." : isFollowing ? "フォロー中" : "フォロー"}
        </button>
        {isMutualFollow && (
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
            相互フォロー
          </span>
        )}
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
