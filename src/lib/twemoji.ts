/**
 * 絵文字をTwemoji CDN URLに変換するユーティリティ
 */

/**
 * 絵文字文字列からUnicodeコードポイントを取得
 * @param emoji - 絵文字文字列（例: "👏"）
 * @returns コードポイント（例: "1f44f"）
 */
function getEmojiCodePoint(emoji: string): string {
  const codePoint = emoji.codePointAt(0)
  if (!codePoint) {
    throw new Error(`Invalid emoji: ${emoji}`)
  }
  return codePoint.toString(16)
}

/**
 * 絵文字からTwemoji SVG CDN URLを生成
 * @param emoji - 絵文字文字列（例: "👏"）
 * @returns Twemoji CDN URL
 */
export function getTwemojiUrl(emoji: string): string {
  const codePoint = getEmojiCodePoint(emoji)
  return `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${codePoint}.svg`
}
