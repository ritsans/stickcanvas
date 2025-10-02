import ResetPasswordForm from "./reset-password-form"

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold">新しいパスワードを設定</h1>
      <p className="mt-2 text-sm text-gray-600">
        新しいパスワードを入力してください。
      </p>
      <div className="mt-8">
        <ResetPasswordForm />
      </div>
    </main>
  )
}
