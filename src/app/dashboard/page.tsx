import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/lib/supabase/auth";

export default async function DashbordPage() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-xl space-y-6 px-6 py-12">
      <header>
        <h1 className="text-3xl font-bold">ダッシュボード</h1>
        <p className="mt-2 text-sm text-gray-600">
          現在ログイン中: {user.email}
        </p>
      </header>

      <form action={signOut}>
        <button
          type="submit"
          className="rounded bg-black px-4 py-2 text-sm text-white"
        >
          ログアウト
        </button>
      </form>
    </main>
  );
}
