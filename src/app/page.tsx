import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilesPage() {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  // profilesテーブルからデータ取得チュートリアル完了なので不要
  //const { data: profiles, error } = await supabase.from("profiles").select("*");
  // if (error) {
  //   return <p className="text-red-600">Error: {error.message}</p>;
  // }

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold">Welcome</h1>

      {user ? (
        <div className="mt-6 space-y-3">
          <p>ログイン中：{user.email}</p>
          <Link
            href="/dashbord"
            className="inline-block rounded bg-black text-white px-4 py-2"
          >
            ダッシュボードへ
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-x-3">
          <Link
            href="/login"
            className="inline-block rounded bg-black text-white px-4 py-2"
          >
            ログイン
          </Link>
          <Link
            href="/sign-up"
            className="inline-block rounded border px-4 py-2"
          >
            新規登録
          </Link>
        </div>
      )}

      {!process.env.NEXT_PUBLIC_SUPABASE_URL && (
        <p className="mt-6 text-sm text-amber-600">
          環境変数が未設定です。<code>.env.local</code> に
          <code>NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
          を設定してください。
        </p>
      )}
    </main>
  );
}
