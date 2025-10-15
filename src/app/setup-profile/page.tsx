import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SetupProfileForm } from "./setup-profile-form"

export default async function SetupProfilePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 一時的に認証チェックとプロフィールチェックを無効化
  // if (!user) {
  //   redirect("/login")
  // }

  // // プロフィール設定済みかチェック
  // const { data: profile } = await supabase
  //   .from("usernames")
  //   .select("user_id")
  //   .eq("auth_user_id", user.id)
  //   .single()

  // if (profile?.user_id) {
  //   redirect("/dashboard")
  // }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">プロフィールを設定</h1>
          <p className="mt-2 text-sm text-gray-600">
            アカウントの初期設定を行ってください
          </p>
        </div>
        <SetupProfileForm email={user?.email || "example@example.com"} />
      </div>
    </div>
  )
}
