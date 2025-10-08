import type { Metadata } from "next"
import { Noto_Sans_JP } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "StickCanvas",
  description: "作品を気軽にアップするプラットフォーム",
}

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  weight: ["400", "500", "700"],
  display: "swap",
  preload: true,
  fallback: [
    "Hiragino Kaku Gothic ProN",
    "Hiragino Sans",
    "Yu Gothic",
    "YuGothic",
    "Meiryo",
    "MS PGothic",
    "system-ui",
    "sans-serif",
  ],
  // 「フォールバック（fallback）」は「第一候補が使えない時に代わりを使うこと」。
  //  ここではフォントに関するフォールバックを指しています。
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className={`${notoSansJP.className} antialiased flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
