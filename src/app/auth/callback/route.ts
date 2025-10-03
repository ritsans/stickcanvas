// app/auth/callback/route.ts
import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

// 8文字のランダムなユーザーIDを生成
function generateRandomUsername(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let username = ""
  for (let i = 0; i < 8; i++) {
    username += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return username
}

export async function GET(request: Request) {
  const { origin, searchParams } = new URL(request.url)
  const token_hash = searchParams.get("token_hash")
  const type = searchParams.get("type")
  const code = searchParams.get("code")

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
    const { error, data } = await supabase.auth.verifyOtp({
      type: type as any,
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
    const { data: existingUsername } = await supabase
      .from("usernames")
      .select("username")
      .eq("id", user.id)
      .maybeSingle()

    if (!existingUsername) {
      // ユニークなユーザーIDを生成
      let username = generateRandomUsername()
      let attempts = 0
      const maxAttempts = 10

      while (attempts < maxAttempts) {
        const { data: takenUsername } = await supabase
          .from("usernames")
          .select("id")
          .eq("username", username)
          .maybeSingle()

        if (!takenUsername) break

        username = generateRandomUsername()
        attempts++
      }

      // 10回試してもユニークなIDが見つからない場合はタイムスタンプを追加
      if (attempts >= maxAttempts) {
        username = `user${Date.now().toString(36)}`
      }

      // usernamesテーブルに登録
      await supabase.from("usernames").insert({
        id: user.id,
        username,
        email: user.email,
      })

      // メタデータにも保存
      await supabase.auth.updateUser({
        data: { username },
      })
    }
  }

  // セッションが保存された状態で /dashboard へ
  return NextResponse.redirect(`${origin}/dashboard`)
}
