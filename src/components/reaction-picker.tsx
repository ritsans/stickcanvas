"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { addReaction, removeReaction } from "@/lib/supabase/reactions"
import { getTwemojiUrl } from "@/lib/twemoji"

type ReactionPickerProps = {
  postId: string
  initialReactions: { emoji: string; count: number }[]
  userReaction: string | null
  isAuthenticated: boolean
}

export default function ReactionPicker({
  postId,
  initialReactions,
  userReaction,
  isAuthenticated,
}: ReactionPickerProps) {
  const [isPending, startTransition] = useTransition()
  const [currentUserReaction, setCurrentUserReaction] = useState(userReaction)

  // 拍手絵文字（今後、複数の絵文字を追加可能）
  const CLAP_EMOJI = "👏"

  // リアクション数を計算（楽観的更新を含む）
  const getReactionCount = (emoji: string) => {
    const serverCount = initialReactions.find((r) => r.emoji === emoji)?.count || 0

    // 楽観的更新: サーバーからのデータとクライアント状態の差分を反映
    if (emoji === currentUserReaction && emoji !== userReaction) {
      return serverCount + 1
    }
    if (emoji === userReaction && emoji !== currentUserReaction) {
      return Math.max(0, serverCount - 1)
    }

    return serverCount
  }

  const handleReactionClick = () => {
    if (!isAuthenticated || isPending) return

    startTransition(async () => {
      if (currentUserReaction === CLAP_EMOJI) {
        // リアクション削除
        setCurrentUserReaction(null)
        const result = await removeReaction(postId)
        if (result?.error) {
          // エラー時は元に戻す
          setCurrentUserReaction(CLAP_EMOJI)
        }
      } else {
        // リアクション追加
        setCurrentUserReaction(CLAP_EMOJI)
        const result = await addReaction(postId, CLAP_EMOJI)
        if (result?.error) {
          // エラー時は元に戻す
          setCurrentUserReaction(null)
        }
      }
    })
  }

  const clapCount = getReactionCount(CLAP_EMOJI)
  const hasUserReacted = currentUserReaction === CLAP_EMOJI

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleReactionClick}
        disabled={!isAuthenticated || isPending}
        className={`group flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition-colors ${
          hasUserReacted
            ? "border-blue-500 bg-blue-50 text-blue-600"
            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        } ${!isAuthenticated || isPending ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
        aria-label={hasUserReacted ? "拍手を取り消す" : "拍手する"}
      >
        <Image
          src={getTwemojiUrl(CLAP_EMOJI)}
          alt={CLAP_EMOJI}
          width={20}
          height={20}
          className="inline-block transition-transform duration-200 group-hover:scale-125"
        />
        {clapCount > 0 && <span className="font-medium">{clapCount}</span>}
      </button>
    </div>
  )
}
