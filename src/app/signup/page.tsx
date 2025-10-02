import SignUpForm from "./sign-up-form";

export default async function SignUpPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold">新規登録</h1>
      <p className="mt-2 text-sm text-gray-600">
        メールアドレスとパスワードでアカウントを作成します。
      </p>
      <div className="mt-8">
        <SignUpForm />
      </div>
    </main>
  );
}
