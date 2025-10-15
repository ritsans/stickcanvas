// app/auth/callback/route.ts
import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { EmailOtpType } from "@supabase/supabase-js"

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

  // プロフィール設定済みかチェック
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase
      .from("usernames")
      .select("user_id")
      .eq("auth_user_id", user.id)
      .single()

    // プロフィール未設定の場合は初期設定ページへ
    if (!profile?.user_id) {
      return NextResponse.redirect(`${origin}/setup-profile`)
    }
  }

  // プロフィール設定済みの場合は /dashboard へ
  return NextResponse.redirect(`${origin}/dashboard`)
}
