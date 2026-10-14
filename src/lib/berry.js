/**
 * 莓莓的「大脑」。
 *
 * 真回复来自 /api/chat（Cloudflare Pages Function，见 functions/api/chat.js），
 * 人设和调用模型都在那边。这里只负责三件事：
 *   1. 把请求发出去（带上对话历史）；
 *   2. 把给前端/TTS 用的控制信息剥掉（首行「情绪：xxx」、「【语音】」标记）；
 *   3. 逐字吐出去，喂给页面上那套打字动效。
 *
 * 底下的 RULES / FALLBACKS 是本地模拟回复。开发环境本来就没有 Cloudflare Functions，
 * 不兜底的话 `npm run dev` 的聊天整个是坏的；线上目前也没接后端（见 MOCK_UNTIL_BACKEND）。
 *
 * 约定：yield 的是累积文本（不是增量），返回的是最终文本。
 */

/** 可中断的 sleep —— 正常结束时摘掉监听，避免长回复堆积一堆 listener */
const wait = (ms, signal) =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(new DOMException('aborted', 'AbortError'))

    const onAbort = () => {
      clearTimeout(timer)
      reject(new DOMException('aborted', 'AbortError'))
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    signal?.addEventListener('abort', onAbort, { once: true })
  })

/* ── 应答库：按关键词命中，命中不了就走兜底 ───────────────────── */

const RULES = [
  {
    test: /你好|您好|hi|hello|嗨|在吗/i,
    replies: [
      '你好呀！我是莓莓 🍓\n\n今天想聊点什么？我可以陪你闲扯、帮你理清思路，或者一起把某件事想明白。',
      '嗨～我在的 🍓\n\n说说看，你现在脑子里转的是什么？',
    ],
  },
  {
    test: /你是谁|你叫什么|介绍一下自己|什么ai|你是什么/i,
    replies: [
      '我是莓莓 🍓，一个常驻在浏览器里的 AI 伙伴。\n\n我擅长三件事：\n· 陪你聊天，接得住你的每一句话\n· 帮你把混乱的想法整理成清晰的条目\n· 在你卡住的时候，换个角度提问\n\n我会一直在这儿，随时开始，随时结束。',
    ],
  },
  {
    test: /代码|编程|bug|报错|函数|react|javascript|python|css|前端/i,
    replies: [
      '代码的问题我最喜欢了 🍓\n\n不过要给你靠谱的答案，我需要知道三件事：\n\n1. 你想达到的效果是什么？\n2. 现在实际发生了什么？（报错原话最好）\n3. 用的是什么技术栈 / 版本？\n\n把这几条补上，我就能直接给你能跑的方案。',
    ],
  },
  {
    test: /难过|焦虑|累|压力|emo|不开心|烦|崩溃|失眠/i,
    replies: [
      '听起来这段时间你扛了不少。\n\n先不用急着振作，也不用急着找到答案。你可以就把现在最堵的那件事讲给我听——我不评价，也不催你。\n\n如果连讲都懒得讲，那我们也可以先聊点别的，等你想说的时候再说 🍓',
    ],
  },
  {
    test: /谢谢|感谢|多谢|thanks|thx/i,
    replies: ['不客气呀 🍓', '随时都在，别客气～', '能帮上就好 🍓 还有别的想聊的吗？'],
  },
  {
    test: /再见|拜拜|晚安|睡了|bye/i,
    replies: ['晚安，好好休息 🍓\n\n明天想聊了随时回来，我都在。', '好，那先到这儿 🍓 保重。'],
  },
  {
    test: /推荐|建议|怎么办|如何|怎么|怎样|该不该/i,
    replies: [
      '这个问题值得认真拆一下。我的思路是：\n\n1. **先定标准** —— 你最终想优化的到底是什么？钱、时间、还是心里踏实？\n2. **列出选项** —— 把所有可能的路径都写出来，先不评判\n3. **两两比较** —— 只比较相邻的两个，人脑一次只能比两样\n\n你先把第 1 步的答案告诉我，我们一步步来。',
    ],
  },
  {
    test: /写|帮我写|文案|标题|总结|润色/i,
    replies: [
      '可以，我来写 🍓\n\n给我这几个信息，出来的稿子会准很多：\n\n· 给谁看（读者是谁）\n· 什么场合（正式 / 轻松 / 社交平台）\n· 大概多长\n· 有没有必须出现或必须避开的词\n\n当然，你不说我也可以先写一版，你再改。',
    ],
  },
  {
    test: /吃|天气|音乐|电影|游戏|旅行|咖啡|运动/i,
    replies: [
      '这个话题我喜欢 🍓\n\n不过我得先坦白：我没有实时数据，不知道今天下不下雨，也不知道最近上了什么新片。\n\n但如果你是想找个由头聊聊、或者拿不定主意想听个意见——那我很在行。说说看？',
    ],
  },
]

const FALLBACKS = [
  '我听到了 🍓 「{q}」——能再多说一点吗？\n\n比如：这件事是什么时候开始的，你当时的第一反应是什么？细节往往藏着真正的答案。',
  '关于「{q}」，我想先确认一下我理解得对不对。\n\n你更想要的是：\n· 一个可以直接执行的方案？\n· 还是先有人陪你把它捋顺？\n\n两种我都能给，就是方向不太一样。',
  '「{q}」——这个提问本身挺有意思的。\n\n如果把它拆开，至少有两层：表面上是你在问 A，但可能你真正在意的是 B。\n\n你觉得是哪一层？',
  '我想了一下「{q}」。\n\n说实话，我给不了你一个"标准答案"——因为这类问题通常没有。但我可以陪你把它拆成几个更小、更容易下决定的问题。要从哪儿开始？',
]

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

function composeReply(text) {
  const clean = text.trim()
  const rule = RULES.find((r) => r.test.test(clean))
  if (rule) return pick(rule.replies)

  const q = clean.length > 24 ? `${clean.slice(0, 24)}…` : clean
  return pick(FALLBACKS).replaceAll('{q}', q)
}

/**
 * 剥掉给前端 / TTS 用的控制信息，别让用户看见。
 * 「情绪：」限定在首行 —— 正文里偶尔也会出现「情绪」这个词，不能误伤。
 */
function stripControl(raw) {
  return raw
    .replace(/^\s*【语音】\s*/, '')
    .replace(/^\s*情绪\s*[：:][^\n]*\n?/, '')
    .replaceAll('【语音】', '')
    .trimStart()
}

/**
 * 还没接后端 —— 线上也走本地模拟回复。
 *
 * 部署到 Pages 后 /api/chat 是存在的（functions/ 目录会被自动接管），
 * 但没有 LLM_API_KEY，它只会返回 500，于是聊天页每发一条都是红色错误气泡。
 * 这个开关就是让线上退回 mock 的。
 *
 * 配好 key、确认 /api/chat 真能出话之后，改回 false。
 */
const MOCK_UNTIL_BACKEND = true

/** 向 /api/chat 要一条回复；后端不可用时退回本地模拟 */
async function fetchReply(text, history, signal) {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, history }),
      signal,
    })
    if (!res.ok) throw new Error(`/api/chat 返回 ${res.status}`)
    const { reply } = await res.json()
    if (!reply) throw new Error('/api/chat 返回了空回复')
    return reply
  } catch (e) {
    // 用户主动停止不算故障，别吞掉 —— 上面要按 AbortError 处理
    if (e?.name === 'AbortError') throw e
    if (import.meta.env.PROD && !MOCK_UNTIL_BACKEND) throw e
    console.warn('[berry] 后端不可用，回退到本地模拟回复：', e.message)
    return composeReply(text)
  }
}

/**
 * 流式产出回复。
 *
 * 文案其实是一次性拿回来的，但仍然逐字吐 —— 打字节奏和光标动效都挂在这个流上，
 * 页面那边不需要知道后端是不是真流式。
 *
 * @param {string} text 用户输入
 * @param {{ signal?: AbortSignal, history?: Array<{role: string, content: string}> }} options
 * @yields {string} 累积到当前的完整文本
 * @returns {Promise<string>} 最终完整文本
 */
export async function* streamReply(text, { signal, history = [] } = {}) {
  const full = stripControl(await fetchReply(text, history, signal))

  // "思考"停顿，让节奏更像真人
  await wait(280 + Math.random() * 420, signal)

  let acc = ''
  for (const ch of full) {
    acc += ch
    yield acc
    const pause = /[，。！？；：\n]/.test(ch) ? 110 + Math.random() * 90 : 16 + Math.random() * 26
    await wait(pause, signal)
  }
  return acc
}

/** 欢迎页的推荐提问 */
export const SUGGESTIONS = [
  { icon: '💡', title: '帮我把想法捋顺', prompt: '我脑子里有几个想法，但很乱，帮我理一理' },
  { icon: '🐛', title: '看一段报错的代码', prompt: '我这段代码报错了，帮我看看问题出在哪' },
  { icon: '🌙', title: '就是想找人说说话', prompt: '今天有点累，想随便聊聊' },
  { icon: '✍️', title: '帮我写点东西', prompt: '帮我写一段自我介绍，要自然一点' },
]
