import ForgotPasswordForm from "./forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold">パスワードをお忘れですか？</h1>
      <p className="mt-2 text-sm text-gray-600">
        登録されたメールアドレスを入力してください。パスワードリセット用のリンクをお送りします。
      </p>
      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </main>
  )
}
