import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-javascript'

// 确保语言加载完成，再扩展（修复潜在报错）
if (Prism.languages.javascript) {
  // 基础关键字（蓝色/绿色）
  Prism.languages.javascript.keyword = {
    pattern: /\b(?:let|const|var|function|return|if|else|for|while|class|extends|export|import|from|new|this|true|false|null|undefined)\b/,
    greedy: true
  }

  // Vue / 响应式 / 源码函数（金色高亮）
  Prism.languages.javascript.function = {
    pattern: /\b(?:ref|reactive|computed|watch|effect|track|trigger|traverse|proxyRefs|h|patch|diff|mountElement|setup|render|createComponentInstance|mountComponent|patchComponent)\b/,
    greedy: true
  }

  // 类 / 构造函数（蓝色）
  Prism.languages.javascript['class-name'] = {
    pattern: /\b(?:VNode|HTMLElement|WeakMap|Map|Set|Proxy|Object|Array)\b/,
    greedy: true
  }
}

// 高亮工具函数
export function highlightCode(code) {
  if (!code) return ''
  return Prism.highlight(code, Prism.languages.javascript, 'javascript')
}