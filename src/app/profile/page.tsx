import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import ProfileForm from "./profile-form"

export default async function ProfilePage() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  return (
    <main className="mx-auto max-w-xl space-y-6 px-6 py-12">
      <header>
        <h1 className="text-3xl font-bold">プロフィール編集</h1>
        <p className="mt-2 text-sm text-gray-600">
          スクリーンネームとアバター画像を設定できます
        </p>
      </header>

      <ProfileForm user={user} />
    </main>
  )
}
