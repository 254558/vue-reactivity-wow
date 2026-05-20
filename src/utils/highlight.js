import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'

// 先加载语言核心
import 'prismjs/components/prism-javascript'

/**
 * 自定义 JavaScript 语法高亮规则（适配 Vue / 响应式源码）
 */
function extendJavaScriptHighlight() {
  const js = Prism.languages.javascript
  if (!js) return

  // 1. 基础关键字（蓝色/绿色）
  js.keyword = {
    pattern: /\b(?:let|const|var|function|return|if|else|for|while|class|extends|export|import|from|new|this|true|false|null|undefined)\b/,
    greedy: true
  }

  // 2. Vue / 响应式 / 源码函数（金色高亮）
  js.function = {
    pattern: /\b(?:ref|reactive|computed|watch|effect|track|trigger|traverse|proxyRefs|h|patch|diff|mountElement|setup|render|createComponentInstance|mountComponent|patchComponent)\b/,
    greedy: true
  }

  // 3. 类 / 构造函数（蓝色）
  js['class-name'] = {
    pattern: /\b(?:VNode|HTMLElement|WeakMap|Map|Set|Proxy|Object|Array)\b/,
    greedy: true
  }
}

// 确保语法定义完成后再扩展
if (Prism.languages.javascript) {
  extendJavaScriptHighlight()
} else {
  // 兼容异步加载场景
  Prism.hooks.add('complete', extendJavaScriptHighlight)
}

/**
 * 代码高亮工具函数
 * @param {string} code - 要高亮的代码字符串
 * @returns {string} 高亮后的 HTML
 */
export function highlightCode(code) {
  if (typeof code !== 'string' || !code.trim()) return ''
  return Prism.highlight(code, Prism.languages.javascript, 'javascript')
}