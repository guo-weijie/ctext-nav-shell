let converter: ((text: string) => string) | null = null
let loadingPromise: Promise<void> | null = null

// 异步加载 OpenCC 繁->简 转换器（词典较大，单独分包按需加载，不拖慢首屏）。
// 浏览器版 opencc-js 将词典内嵌为 JS 字符串，import 即可用，无需外部请求。
export function ensureConverter(): Promise<void> {
  if (converter) return Promise.resolve()
  if (!loadingPromise) {
    loadingPromise = import('opencc-js').then((mod) => {
      converter = mod.Converter({ from: 'tw', to: 'cn' })
    })
  }
  return loadingPromise
}

export function isConverterReady(): boolean {
  return converter !== null
}

// 将字符串归一为简体；转换器未就绪时回退原串（首屏极短时间内），就绪后自动生效
export function toSimplified(text: string): string {
  return converter ? converter(text) : text
}
