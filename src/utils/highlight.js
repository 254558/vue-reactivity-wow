import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css' // 完美契合深色主题的高亮主题
import 'prismjs/components/prism-javascript'
// 自定义 Vue/响应式 相关的高亮关键词，让代码着色更符合本项目
if (Prism.languages.javascript) {
  Prism.languages.javascript.keyword = /\b(?:let|const|var|function|return|if|else|for|while|new|true|false|null|undefined|typeof|this|class|extends|export|import|from)\b/
  Prism.languages.javascript.function = /\b(?:effect|track|trigger|reactive|ref|computed|watch|traverse|proxyRefs|mountElement|patch|diff|parse|transform|generate|h|createComponentInstance|mountComponent|patchComponent|setup|render)\b/
  Prism.languages.javascript['class-name'] = /\b(?:VNode|HTMLElement|WeakMap|Map|Set|Proxy|Object|Array)\b/
}
/**
 * 高亮代码字符串
 * @param {string} code 原始代码
 * @returns {string} HTML 字符串
 */
export function highlightCode(code) {
  return Prism.highlight(code, Prism.languages.javascript, 'javascript')
}