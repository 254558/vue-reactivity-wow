// 第九章：编译模板的步骤配置数据
export const sourceCode = `// ================= 1. Parse: 模板 → AST =================
function parse(template) {
  let root = { type: 'Root', children: [] }
  let context = { source: template }
  while (context.source) {
    if (context.source.startsWith('{{')) {
      // 解析插值表达式
      const node = parseInterpolation(context)
      root.children.push(node)
    } else if (context.source.startsWith('<')) {
      // 解析标签节点
      const node = parseElement(context)
      root.children.push(node)
    } else {
      // 解析纯文本
      const node = parseText(context)
      root.children.push(node)
    }
  }
  return root // 返回 AST
}
// ================= 2. Transform: AST → AST =================
function transform(ast) {
  // 创建转换上下文
  const context = {
    nodeTransforms: [transformElement, transformText]
  }
  // 深度遍历 AST
  traverseNode(ast, context)
}
function traverseNode(ast, context) {
  const transforms = context.nodeTransforms
  transforms.forEach(fn => fn(ast)) // 执行转换插件
  const children = ast.children
  if (children) {
    children.forEach(child => {
      traverseNode(child, context) // 递归
    })
  }
}
// ================= 3. Codegen: AST → 渲染函数 =================
function generate(ast) {
  const context = {
    code: '',        // 生成的代码字符串
    push(code) { this.code += code },
    indent() {},     // 缩进
    deindent() {}    // 减少缩进
  }
  // 拼接函数前导码
  push('function render() {')
  push('  return ')
  // 递归生成代码
  genNode(ast, context)
  push('}')
  return context.code
}
function genNode(node, context) {
  if (node.type === 'Element') {
    genElement(node, context)
  } else if (node.type === 'Interpolation') {
    genInterpolation(node, context)
  } else if (node.type === 'Text') {
    genText(node, context)
  }
}
// ================= 最终产物 =================
// 模板: <div>hello {{ name }}</div>
// 编译结果:
function render() {
  return h('div', null, [
    'hello ',
    _ctx.name
  ])
}`
export const steps = [
  {
    id: 1,
    title: '编译器的三段式',
    label: '三段式',
    desc: 'Vue 的编译器分为三个核心阶段：Parse（解析）、Transform（转换）、Codegen（生成）。类似流水线，每一步处理并传递给下一步。',
    detail: 'Template 字符串\n  ↓ Parse\nAST 抽象语法树\n  ↓ Transform\n优化后的 AST\n  ↓ Codegen\n渲染函数代码字符串',
    color: '#10b981',
    lines: [],
    highlight: { parse: false, ast: false, transform: false, codegen: false, result: false },
  },
  {
    id: 2,
    title: 'Parse：解析模板',
    label: 'Parse',
    desc: '解析器通过有限状态机逐字符扫描模板，识别出标签、属性、插值、文本等语法结构，最终构建出一棵 AST（抽象语法树）。',
    detail: '遇到 < → 切换到标签状态\n遇到 {{ → 切换到插值状态\n其他 → 作为纯文本解析\n\n状态机驱动，避免正则回溯灾难',
    color: '#60a5fa',
    lines: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    highlight: { parse: true, ast: false, transform: false, codegen: false, result: false },
  },
  {
    id: 3,
    title: 'AST：抽象语法树',
    label: 'AST',
    desc: 'AST 是源代码的树状结构表示。每个节点代表一种语法结构，它独立于具体语法，是编译器中间表示的标准形式。',
    detail: 'Root\n └── Element (div)\n      ├── Text (hello )\n      └── Interpolation (name)\n\n丢失了空格、逗号等细节\n保留了核心层级与逻辑关系',
    color: '#f59e0b',
    lines: [19],
    highlight: { parse: true, ast: true, transform: false, codegen: false, result: false },
  },
  {
    id: 4,
    title: 'Transform：转换 AST',
    label: 'Transform',
    desc: '转换器深度遍历 AST，执行一系列插件化转换函数。在 Vue3 中，这包括标记静态提升、合并静态节点等优化操作。',
    detail: 'traverseNode(ast, context)\n  ↓\n对每个节点执行 nodeTransforms:\n  transformElement()\n  transformText()\n  transformIf()\n  transformFor()...\n\n插件化架构，方便扩展',
    color: '#8b5cf6',
    lines: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39],
    highlight: { parse: false, ast: true, transform: true, codegen: false, result: false },
  },
  {
    id: 5,
    title: 'Codegen：生成代码',
    label: 'Codegen',
    desc: '代码生成器递归遍历 AST，根据节点类型拼接出 JavaScript 渲染函数的字符串代码。最终产物是一个可执行的 render 函数。',
    detail: 'genNode(ast)\n  ↓ Element → h(\'div\', ...)\n  ↓ Text → \'hello \'\n  ↓ Interpolation → _ctx.name\n\n拼接字符串，形成完整函数体',
    color: '#ef4444',
    lines: [41,42,43,44,45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64],
    highlight: { parse: false, ast: false, transform: false, codegen: true, result: false },
  },
  {
    id: 6,
    title: '最终产物：render 函数',
    label: '产物',
    desc: '编译的最终目的：将声明式的 HTML 模板，转换为命令式的 JavaScript 渲染函数。它可以在运行时高效地创建 VNode 树。',
    detail: '模板: <div>hello {{ name }}</div>\n  ↓ 编译\nfunction render() {\n  return h(\'div\', null, [\n    \'hello \',\n    _ctx.name\n  ])\n}\n\n声明式 → 命令式，模板 → VNode',
    color: '#10b981',
    lines: [65, 66, 67, 68, 69, 70, 71, 72, 73],
    highlight: { parse: false, ast: false, transform: false, codegen: true, result: true },
  },
]