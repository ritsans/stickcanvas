import { createClient } from "@/lib/supabase/server";

export default async function ProfilesPage() {
  const supabase = await createClient();

  // profilesテーブルからデータ取得チュートリアル完了なので不要
  //const { data: profiles, error } = await supabase.from("profiles").select("*");
  // if (error) {
  //   return <p className="text-red-600">Error: {error.message}</p>;
  // }

  return (
    <main className="p-8">

    </main>
  );
}