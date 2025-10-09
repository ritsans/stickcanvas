"use client"

import { useState, useTransition } from "react"
import { followUser, unfollowUser, checkIsFollowedBy } from "@/lib/supabase/follows"
import { Button } from "@/components/ui/button"

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
      <Button disabled variant="secondary" className="cursor-not-allowed">
        フォロー
      </Button>
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
      <Button
        onClick={handleToggleFollow}
        disabled={isPending}
        variant={isFollowing ? "outline" : "default"}
      >
        {isPending ? "処理中..." : isFollowing ? "フォロー中" : "フォロー"}
      </Button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
