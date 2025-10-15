import type { ZodErrorMap } from "zod"

// Zodのエラーメッセージを日本語化する共通エラーマップ
export const jaErrorMap: ZodErrorMap = (issue, ctx) => {
  switch (issue.code) {
    case "invalid_type": {
      if (issue.received === "undefined") return { message: "必須項目です" }
      return { message: "無効な型です" }
    }
    case "too_small": {
      if (issue.type === "string") {
        if (issue.minimum === 1) return { message: "入力してください" }
        return { message: `${issue.minimum}文字以上で入力してください` }
      }
      if (issue.type === "array") return { message: `${issue.minimum}件以上必要です` }
      if (issue.type === "number") return { message: `${issue.minimum}以上の数値を入力してください` }
      return { message: "値が小さすぎます" }
    }
    case "too_big": {
      if (issue.type === "string") return { message: `${issue.maximum}文字以内で入力してください` }
      if (issue.type === "array") return { message: `${issue.maximum}件以内で入力してください` }
      if (issue.type === "number") return { message: `${issue.maximum}以下の数値を入力してください` }
      return { message: "値が大きすぎます" }
    }
    case "invalid_string": {
      if (issue.validation === "email") return { message: "有効なメールアドレスを入力してください" }
      if (issue.validation === "url") return { message: "有効なURLを入力してください" }
      if (issue.validation === "uuid") return { message: "有効なUUIDを入力してください" }
      return { message: "文字列の形式が正しくありません" }
    }
    case "invalid_date": {
      return { message: "有効な日付を入力してください" }
    }
    case "invalid_enum_value": {
      return { message: "無効な選択です" }
    }
    case "unrecognized_keys": {
      return { message: "未対応の項目が含まれています" }
    }
    case "invalid_union":
    case "invalid_union_discriminator": {
      return { message: "入力形式が正しくありません" }
    }
    case "not_multiple_of": {
      return { message: `${issue.multipleOf}の倍数で入力してください` }
    }
    case "custom": {
      return { message: "入力が不正です" }
    }
    default:
      return { message: ctx.defaultError }
  }
}

