// URN → 原站阅读页 URL
//
// ctext.org 的书目 URN 实际为「单段扁平」结构，分两类：
//  1) 知名经典：ctp:mozi / ctp:analects …… 对应干净阅读路径 https://ctext.org/<name>/zh （实测 200）
//  2) 内部文本：ctp:wb123456（占 49,646 中的 49,507 条）无干净路径，
//     若硬拼 https://ctext.org/wb123456/zh 会被 ctext.org 302 重定向回首页（https://ctext.org/）。
//     此类必须用官方 URN 解析器 https://ctext.org/library?urn=<编码> ，可落到真实书籍页（非首页）。
//
// 故采用混合规则：单段非 wb 的经典走干净路径；其余（含所有 wb 文本）走 library?urn= 解析器。
// 该链接由浏览器直接跳转、重定向发生在 ctext.org 服务端，无需本前端发起运行时请求。
export function urnToUrl(urn: string): string {
  const m = /^ctp:([^:]+)$/.exec(urn)
  if (m) {
    const seg = m[1] // ctp: 之后的单段
    if (!/^wb\d+$/i.test(seg)) {
      return `https://ctext.org/${seg}/zh`
    }
  }
  return `https://ctext.org/library?urn=${encodeURIComponent(urn)}`
}
