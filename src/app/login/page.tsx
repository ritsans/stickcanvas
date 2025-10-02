import LoginForm from "./login-form";

type Props = {
  searchParams: { message?: string };
};

export default async function LoginPage({ searchParams }: Props) {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold">ログイン</h1>

      {searchParams?.message === "check-email" && (
        <p className="mt-4 rounded border border-amber-400 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          確認メールを送信しました。メール内のリンクから認証を完了してください。
        </p>
      )}

      <div className="mt-8">
        <LoginForm />
      </div>
    </main>
  );
}
