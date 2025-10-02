import Link from "next/link"

export default function ResetPasswordSentPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold">メールを確認してください</h1>
      <p className="mt-4 text-sm text-gray-600">
        パスワードリセット用のリンクをメールで送信しました。
        メール内のリンクをクリックして、新しいパスワードを設定してください。
      </p>
      <p className="mt-4 text-sm text-gray-600">
        メールが届かない場合は、迷惑メールフォルダをご確認ください。
      </p>
      <div className="mt-8">
        <Link href="/login" className="text-sm text-blue-600 underline">
          ログインページに戻る
        </Link>
      </div>
    </main>
  )
}
