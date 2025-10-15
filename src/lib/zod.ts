import { z } from "zod"
import { jaErrorMap } from "./zod-error-map-ja"

// すべてのバリデーションで日本語メッセージを使用
z.setErrorMap(jaErrorMap)

export { z }

