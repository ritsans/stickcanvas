// app/auth/callback/route.ts
import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { EmailOtpType } from "@supabase/supabase-js"

// 8文字のランダムなユーザーIDを生成
function generateRandomUserId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let userId = ""
  for (let i = 0; i < 8; i++) {
    userId += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return userId
}

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url)
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type")
  const code = searchParams.get("code")

  const isEmailOtpType = (value: string): value is EmailOtpType =>
    value === "signup" ||
    value === "invite" ||
    value === "magiclink" ||
    value === "recovery" ||
    value === "email_change" ||
    value === "email"

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
      },
    },
  )

  // メール確認リンク（token_hash）とOAuthコールバック（code）の両方に対応
  if (token_hash && type) {
    if (!isEmailOtpType(type)) {
      return NextResponse.redirect(`${origin}/login?error=invalid_type`)
    }

    const { error, data } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }

    if (!data.session) {
      return NextResponse.redirect(`${origin}/login?error=no_session`)
    }
  } else if (code) {
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error.message)}`)
    }

    if (!data.session) {
      return NextResponse.redirect(`${origin}/login?error=no_session`)
    }
  } else {
    return NextResponse.redirect(`${origin}/login?error=missing_params`)
  }

  // 新規ユーザーの場合、ランダムなユーザーIDを生成して登録
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: existingUserId } = await supabase
      .from("usernames")
      .select("user_id")
      .eq("id", user.id)
      .maybeSingle()

    if (!existingUserId) {
      // ユニークなユーザーIDを生成
      let userId = generateRandomUserId()
      let attempts = 0
      const maxAttempts = 10

      while (attempts < maxAttempts) {
        const { data: takenUserId } = await supabase
          .from("usernames")
          .select("id")
          .eq("user_id", userId)
          .maybeSingle()

        if (!takenUserId) break

        userId = generateRandomUserId()
        attempts++
      }

      // 10回試してもユニークなIDが見つからない場合はタイムスタンプを追加
      if (attempts >= maxAttempts) {
        userId = `user${Date.now().toString(36)}`
      }

      // メタデータにまず保存（これによりauth.uid()が利用可能になる）
      await supabase.auth.updateUser({
        data: { user_id: userId },
      })

      // usernamesテーブルに登録（RLSポリシーがauth.uid()をチェックするため、updateUser後に実行）
      await supabase.from("usernames").insert({
        id: user.id,
        user_id: userId,
        email: user.email,
      })
    }
  }

  // セッションが保存された状態で /dashboard へ
  return NextResponse.redirect(`${origin}/dashboard`)
}
