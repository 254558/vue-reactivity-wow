// 第五章：原始值响应式 ref 的步骤配置数据
export const sourceCode = `// 响应式系统基础 (简化)
let activeEffect = null
const bucket = new WeakMap()

function track(target, key) { /* ... */ }
function trigger(target, key) { /* ... */ }

// ================= Proxy 的局限 =================
function reactive(data) {
  return new Proxy(data, {
    // ... 拦截操作
  })
}

// ❌ 原始值无法使用 Proxy
// const a = reactive(0) -> TypeError

// ================= ref 实现 =================
function ref(val) {
  // 如果已经是 ref，直接返回
  if (val && val.__v_isRef) return val

  // 包装为对象
  const wrapper = {
    __v_isRef: true, // 标记为 ref
    value: val       // 内部值
  }

  // 使用类对象 + 访问器描述符
  Object.defineProperty(wrapper, 'value', {
    get() {
      track(wrapper, 'value')
      return val
    },
    set(newVal) {
      val = newVal
      trigger(wrapper, 'value')
    }
  })

  return wrapper
}

// ================= 自动脱 ref =================
function proxyRefs(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver)
      // 如果是 ref，自动返回 .value
      return value && value.__v_isRef ? value.value : value
    },
    set(target, key, newVal, receiver) {
      const oldValue = target[key]
      // 如果旧值是 ref，新值不是，则赋给 .value
      if (oldValue && oldValue.__v_isRef && !newVal.__v_isRef) {
        oldValue.value = newVal
        return true
      }
      return Reflect.set(target, key, newVal, receiver)
    }
  })
}

// ================= 使用 ref =================
const count = ref(0)          // 原始值
const state = reactive({
  count: ref(1)               // 嵌套在 reactive 中
})

// 必须通过 .value 访问
console.log(count.value)      // 0
count.value++                 // 修改

// 在 reactive 中自动脱 ref
const obj = proxyRefs(state)
console.log(obj.count)        // 1 (无需 .value)
obj.count = 2                 // 直接赋值`

export const steps = [
  {
    id: 1,
    title: 'Proxy 的局限',
    label: 'Proxy局限',
    desc: 'Proxy 只能代理对象（Object、Array、Map 等），无法代理原始值（Number、String、Boolean 等）。尝试 reactive(0) 会抛出 TypeError。',
    detail: 'new Proxy(0, handler)\n  → TypeError: Cannot create proxy\n    with a non-object as target\n\n原始值没有属性，无法被拦截',
    color: '#ef4444',
    lines: [7, 8, 9, 10, 11, 12, 13, 14, 15],
    highlight: { problem: true, wrapper: false, define: false, unwrap: false },
  },
  {
    id: 2,
    title: '包装策略：转为对象',
    label: '包装策略',
    desc: 'ref 的核心思路是将原始值包装为一个对象。该对象拥有 __v_isRef 标记和 value 属性，这样就能被 Proxy 或 Object.defineProperty 拦截。',
    detail: 'ref(0)\n  ↓\nwrapper = {\n  __v_isRef: true, // 标识\n  value: 0          // 存储原始值\n}\n\n对于对象也适用：ref({a:1}) 会自动调用 reactive',
    color: '#f59e0b',
    lines: [18, 19, 20, 21, 22, 23, 24, 25, 26],
    highlight: { problem: false, wrapper: true, define: false, unwrap: false },
  },
  {
    id: 3,
    title: '访问器拦截：get/set',
    label: 'get/set拦截',
    desc: '通过 Object.defineProperty 为 value 属性定义 get 和 set 访问器。读取 value 时 track 收集依赖，设置 value 时 trigger 触发更新。',
    detail: 'Object.defineProperty(wrapper, "value", {\n  get() {\n    track(wrapper, "value")\n    return val\n  },\n  set(newVal) {\n    val = newVal\n    trigger(wrapper, "value")\n  }\n})',
    color: '#10b981',
    lines: [28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38],
    highlight: { problem: false, wrapper: true, define: true, unwrap: false },
  },
  {
    id: 4,
    title: '使用 ref：.value 访问',
    label: '.value访问',
    desc: '因为响应式数据挂载在 wrapper.value 上，所以读取和修改时必须通过 .value。这是 ref 最显著的语法特征。',
    detail: 'const count = ref(0)\n\ncount.value  // 读取 (触发 get 拦截)\ncount.value++ // 修改 (触发 set 拦截)\n\ncount + 1     // ❌ 错误！丢失响应性',
    color: '#60a5fa',
    lines: [63, 64, 65, 66, 67],
    highlight: { problem: false, wrapper: true, define: true, unwrap: false },
  },
  {
    id: 5,
    title: '自动脱 ref：proxyRefs',
    label: '自动脱ref',
    desc: '在模板或 reactive 对象中，每次写 .value 很繁琐。Vue 通过 proxyRefs 代理，在 get 时自动读取 ref.value，在 set 时自动赋值给 ref.value。',
    detail: 'const obj = proxyRefs({ count: ref(0) })\n\nobj.count     // 自动脱 ref，等同于 obj.count.value\nobj.count = 1 // 自动赋 .value，等同于 obj.count.value = 1',
    color: '#f59e0b',
    lines: [43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61],
    highlight: { problem: false, wrapper: false, define: false, unwrap: true },
  },
  {
    id: 6,
    title: '完成机制闭环',
    label: '闭环验证',
    desc: '通过 proxyRefs，ref 在保持原始值响应性的同时，也获得了和 reactive 一样简洁的访问方式。setup 返回的对象就是被 proxyRefs 处理过的。',
    detail: 'setup() {\n  const count = ref(0)\n  return { count } // 自动 proxyRefs\n}\n\n模板中:\n{{ count }}  // 无需 .value\n<count @click="count++" />',
    color: '#10b981',
    lines: [69, 70, 71],
    highlight: { problem: false, wrapper: false, define: false, unwrap: true },
  },
]