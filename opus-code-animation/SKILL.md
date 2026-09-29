---
name: "opus-code-animation"
description: "用纯代码（Canvas2D / three.js）直出带配乐、卡点、字幕的短动画 MP4，或逐镜复刻参考视频。含拼贴纸艺质感层与动态图形（kinetic type / 形变 / 粒子 / 运动模糊）模板。适用于角色小短片、产品梗动画、品牌片头、X/小红书短视频。"
---

# Opus 代码直出动画

不用 Blender、Seedance、MiniMax 这类视频模型：动画全部由代码逐帧渲染，再用 ffmpeg 合成 MP4。
方法整理自 @Alex_ybuild 在 2026 年 9 月发布的一组 Opus 5.5 直出动画。他的原话是：提示词可能比你们想的简单很多，把一切交给模型。
所以这套 skill 的重点**不是写长提示词**，而是让模型自己把导演、分镜、美术、作曲和剪辑这几件事做扎实。

---

## 一、案例库（原始提示词 + 成片效果）

### 1. CapCut 剪辑主题 · 30 秒 one-shot（手绘风 2D）
**原始提示词（附一张主角参考图）：**
```
Opus 5.5 is the character. Make a 30-second animation. The theme is CapCut and short-form video editing. Opus 5.5 is creating a fun social video inside a playful editing workflow, trimming clips, adding transitions, captions, effects, and syncing everything to the beat. Make it feel energetic, cute, clever, and charming, with a few humorous editing moments. This should be a single continuous shot. It will be posted on X.

For the soundtrack, do not use local audio files. Use Gemini's Lyria 3 Pro to generate an original upbeat instrumental track that fits the animation. Keep it playful, modern, catchy, and suitable for a short-form editing montage. Do not use vocals unless absolutely necessary.

End with Opus 5.5 proudly revealing the finished edit and signing off as Opus 5.5.
[参考图]
```
**成片效果：** 1920×1080，30 秒，米白纸张底配手绘描边，UI 像一个卡通化的剪辑软件（左边素材库卡片，中间手机预览，右边 Adjust 滑杆，底部多轨时间线和音频波形）。橙色方块角色在界面里跑来跑去：拖素材、剪片段、拉滑杆。画面会弹出“SHAKE MAX”“NAILED IT”这类贴纸字，并踩着鼓点抖动。结尾手机里放出成片，出现手写体“made in 30 seconds by Opus 5.5”。
**要点：** 一镜到底、节奏卡点和幽默桥段都在一小段提示词里交代清楚，其余全交给模型。

### 2. Claude 和它的 sub-agents · 30 秒（手绘风 2D）
**提示词：** 作者没有公开，只说是 opus 5.5 直出。
**成片效果：** 中间是戴耳机的“orchestrator”角色，身后白板上是“Claude's plan”待办清单。它把任务分给一排不同形状、颜色的小 agent（Scout·research、Quill·writing、Byte·code、Spark·ideas、Tidy·organize、Tick·check…），每个 agent 头顶都有一张任务卡，卡片进度逐个填满，并弹出“TESTS PASS”。最后清单全部打勾，标题变成“all done ✓”，撒彩纸收尾。
**要点：** 把抽象的系统概念（多智能体编排）拟人化成角色和道具，用清单打勾的进度作为叙事主线。

### 3. Opus 5.5 rainbow · 40 秒循环（像素风）
**提示词：** 未公开。
**成片效果：** 深蓝星空背景加扫描线，像素风方块角色拖着彩虹尾巴原地“飞行”，星星向左流动，眨眼、表情有小变化，右下角是像素字“OPUS 5.5”，尾段出现一只小号的同款角色。
**要点：** 做无缝循环（背景视差滚动加角色上下浮动），像素网格要对齐整数坐标。
⚠️ 这是在致敬一个知名网络梗形象，做同类作品时只借用“彩虹拖尾 + 星空循环”这种通用手法，角色必须用自己的，不要还原那个梗形象本身。

### 4. 逐镜复刻 72 秒搞笑打斗片段（three.js 3D）
**原始提示词（交互式，多轮）：**
```
<参考视频链接> 你可以复刻这个么？
（纠正）<正确的参考视频链接> 这个 刚才的弄错了
```
模型先下载视频、逐段抽帧，看懂内容以后**主动反问三个关键设定**：
- 角色怎么对应？→ 用户：Codex 当枪手疯狂开火，Opus 刀枪不入挡子弹
- 时长和保真度？→ 用户：完整 72 秒逐镜复刻（推荐项）
- 音轨用什么？→ 用户：用原片音乐
然后把原片拆成**精确的镜头表**（每个切点的时间、景别、机位、动作），再逐镜对位制作。
**成片效果：** 暖色调木地板室内，体素风的蓝色云朵机器人举枪扫射，橙色方块角色中弹后火花四溅却毫发无伤。有低机位、特写（方块的怒脸）、过肩镜头、枪口火光、景深、辉光、胶片颗粒。片尾字幕“Made with Opus 5.5 / inspired by Kotte Animation”。
**要点：** 复刻类任务一定要先抽帧、做镜头表、确认角色映射，再动手；片尾写明灵感来源。

### 5. 电影感“发布会交接” · 20 秒（three.js 3D，写实外景）
**原始提示词（多轮）：**
```
[参考图] 想制作一个类似于这样的视频 <B站参考视频链接>，然后 opus 是作为交接的主角，声音就用原生就可以，然后这个 codex 的形象作为第一幕
（纠正）反啦 神秘人物是 opus，开场角色是 codex
（迭代）[参考图A] 我主要对第二幕的景观不满意 [参考图B]
```
**模型的做法：** 把 21 秒的参考片拆成分镜，替换角色，音轨沿用原片。用 three.js 做“暗色玻璃办公室 + 逆光剪影 + 明亮露台”的 3D 电影感。Opus 做成带描边的橙色方块，Codex 做成体素蓝云朵机器人加发光屏幕脸。
第二幕景观太秃，模型给出的**新方案**是：
- 景观背板：调用 Gemini 生图，生成一张写实全景（加州金色草坡、蜿蜒小路、橡树林、远山、蓝天，不出现建筑和人物），放在玻璃外当背景。
- 场景重建：改成高层弧形玻璃幕墙内侧视角，深灰抛光地面加窗框投影，角色站在玻璃旁边。
- 修细节：补接触阴影（角色脚下原本悬浮）、把偏蓝偏亮的地面改成中性灰、调窗框、微调走位和机位。
**成片效果：** 镜头跟随神秘剪影穿过暗色办公室 →“直到我们的主角露出真身……”→ 屏幕脸显示“>”“NOT ME” → 转向身后那个家伙 → 橙色方块拿着披萨登场 → 大落地窗前说“大家好，欢迎来到 Apple Park”。全程中英双语字幕。
**要点：** 写实环境交给生图贴背板，角色和光影用 3D 代码。**纯程序化做写实远景很容易显得“游戏感”，这时直接换方案。**

### 6. “Reset card” 用量重置 · 30 秒（手绘风 2D）
**提示词：** 作者说稍后公开，目前还没发。
**成片效果：** 前半段是灰暗低饱和：用量电池只剩 2%→1%，角色垂头丧气，“USAGE REACHED”，保险箱里翻出一张“EMERGENCY RESET”卡。后半段插卡后一下子变彩色：“FULL RESET!” 大字爆出，电池 100% 冒泡，系统面板的 tokens/context/brain/ambition 全部变成 FULL，便签墙写满任务，出现“BUILD THE ENTIRE THING”，出货箱计数 ✓19→✓37→✓61，结尾手写字“saved it for exactly this”。
**要点：** 情绪反转用**色彩反转**（灰→彩）来承载，数字计数器和对勾负责制造爽感。

### 7. 中秋拼贴风 · 40 秒（@ring_hyacinth，2026-09，拼贴纸艺 2D）★ 质感标杆
**分工（作者原话要点）：** 脚本和音乐由人提供；动画由 Opus 5.5 用 JS 逐帧画出；手绘纹理用 p5.js + p5.brush；背景底稿和纸张材质用 Nano Banana Pro 生成。
**成片效果：** 深蓝夜空由一层层**撕纸条**叠成（撕口露出白色纸芯、带投影）；月亮是缺了一块的“月饼月亮”，带暖色光晕；祥云、星星、桂花都像剪纸贴上去的。橘猫是**贴纸**：白色模切边 + 彩铅质感填充 + 深棕描边。约 15 个镜头：大远景城市天际线 → 近景猫 → 特写（背景虚化成散景光斑）→ 镜头推进建筑、一路钻进螺旋楼梯的转场 → 老虎机桥段（月饼/螃蟹/柚子滚动）→ 猫看月亮的背影收尾，竖排书法“祝你中秋”。
**要点（它比案例 1–6 好看在哪）：**
- **材质叠层**：每个元素 = 纯色 + 纸纹 + 笔触纹理 + 撕边/模切边 + 投影。没有一块是“平涂色块”。
- **限定色板**：深蓝/藏青 + 暖金/橘，外加少量点缀色（绿叶、红灯笼）；整片统一调色和暗角。
- **镜头语言**：景别频繁变化（远 / 中 / 特），特写时开大景深和散景；用“推进到物体内部”做转场，而不是硬切 UI。
- **信息少、情绪多**：几乎没有字，靠表情、动作、构图讲故事；结尾留白。
- **分工明确**：写实或复杂的纹理交给生图，动画和节奏交给代码。

### 8. Motion Reel 动态图形 · 15 秒（@aiehon_aya，2026-09，动态图形 / 动态文字）★ 节奏与“设计感”标杆
**做法（作者让 Opus 自己讲的原理）：** `index.html` 逐帧画 → `render.py` 用无头 Chrome 取 900 帧（60fps）直接管道给 ffmpeg → `make_audio.py` 用算法合成音乐 → 合成 MP4，约 6 分钟。
1. **一切按拍号写**：128BPM 下 32 拍正好 15 秒。“第 4 拍出 MOVE”“第 28 拍爆炸”；音乐用同一套拍号，所以不用手动对时间。
2. **缓动就是动作本身**：expo（快进慢停，MOVE 滑入）、back（过冲回弹，SHAPE 弹出）、bounce（落地弹跳，RHYTHM）。还专门做了一场“图形编辑器”，把缓动曲线本身拿出来演：拖 cubic-bezier 的手柄，播放头走一遍，进度 000→100%。
3. **全都是计算**：圆→方→三角→星，统一用 240 个点做点对点形变；隧道和线框立方体是手写透视投影；结尾 CLAUDE 是先在离屏画布上写字、取约 5000 个像素点，再让粒子飞过去。
4. **后期质感**：每帧在时间上错开画 10 次再取平均，当作运动模糊（5 次会看出一格一格的残影）；RGB 三色分离加横向切片错位做故障效果；每帧换位置的颗粒加暗角；四角 HUD 用“差值（difference）”混合画，任何底色上都看得清。
5. **声音**：底鼓 = 音高快速下扫的正弦；hat、snare、whoosh = 塑形过的噪声；和弦 = 7 根失谐锯齿波（supersaw）；底鼓一响，其他声音被瞬间压低（侧链，产生律动的起伏感）；最后爆点前留约 0.1 秒完全静音，放大落差。

**成片结构：** 点→线→刻度 → MOTION 标题 → 橙色斜切转场 + MOVE 速度线 → SHAPE 描边字堆叠 → TIME 表盘 → RHYTHM 弹跳 → 白闪匹配剪辑进形变 → DEPTH 隧道 → 图形编辑器 → 四宫格（挤压拉伸 / 融球 metaballs / 波形 / LOOP 跑马灯）→ 半拍一切的快剪 → 粒子爆炸聚成 CLAUDE。全程贴着 HUD（章节名、时间码、拍号计数）。
**要点：** 色板极少（米白 / 黑 / 橙红 / 电光蓝 / 荧光绿），靠满版色块切换制造节奏；每个镜头只放一个大字或一个图形；字体用粗宽体 + 窄体 + 等宽体三种。
**复刻：** `references/mograph-reel/` 是我逐镜复刻的完整工程，可直接改文案、换色板复用。它和原片逐秒对照过，15 秒、60fps、10 次子帧运动模糊，渲染约 2.5 分钟。

---

## 二、这组作品共有的风格规律

1. **主角固定**：用户提供参考图，模型照着还原。形象是简单几何体（方块身体、豆豆眼、短腿），好画、好动、表情全靠眼睛和眉毛。没有参考图时，**原创**一个同样简单的几何角色，不要画知名 IP 或吉祥物。
2. **三套美术路线**：
   - 手绘 2D（Canvas2D）：米白纸纹底色，深色粗描边带轻微抖动（boil），UI 化道具（卡片、面板、清单、进度条），贴纸字弹出。
   - 电影 3D（three.js）：暖或冷的主光加逆光剪影，景深、辉光、颗粒、暗角，体素或倒角方块角色。
   - **拼贴纸艺 2D（Canvas2D + 质感层，见案例 7）**：撕纸分层、贴纸化角色、彩铅纹理、光晕、景深、统一调色。**好看程度明显高于纯手绘 UI 风，讲故事、有角色时优先选它。**
   - **动态图形 / 动态文字（Canvas2D，见案例 8）**：满版色块、粗体大字、几何形变、HUD、故障效果、粒子。**做产品发布、品牌片头、概念展示、没有角色时优先选它。**
3. **叙事 = 一个可视化的“进度”**：剪辑时间线、任务清单、电量、计数器。观众靠进度条感受到“事情在发生”。
4. **卡点**：所有冲击动作（弹字、切镜、抖屏、火花）落在拍点上。
5. **收尾署名**：“made by / Made with Opus 5.5”，加上角色的得意小动作。
6. **多镜头优于单一布局**：20 秒以上的片子，每 2–4 秒要有一次景别或机位变化（推、拉、切特写、转场）。一个固定 UI 版面从头放到尾会像 PPT。
7. **标准规格**：1920×1080（X 横屏）或 1080×1920（竖屏），20–72 秒，30fps，H.264 + AAC。

---

## 三、工作流程

### Step 0 · 确认（不清楚时问一次就够）
- 主角是谁、有没有参考图，多个角色时谁演什么（案例 4、5 都曾把角色弄反）
- 时长、画幅、发布平台
- 原创还是复刻（复刻要有参考视频）
- 音乐来源：用户提供的音轨、原片音轨、AI 作曲 API（例如 Gemini Lyria，需要 key），或者用 WebAudio/代码合成一段原创配乐作为兜底

### Step 1 · 复刻类：先拆片
```bash
yt-dlp -o ref.mp4 "<url>"            # 下载（B站/X/YouTube）
ffprobe ref.mp4                       # 时长/分辨率
ffmpeg -i ref.mp4 -vf "select='gt(scene,0.3)',showinfo" -vsync vfr shots/%03d.jpg 2>&1 | grep pts_time   # 切点
ffmpeg -i ref.mp4 -vf fps=2,scale=480:-1,tile=4x4 sheet_%02d.jpg   # 抽帧拼图，逐张看
ffmpeg -i ref.mp4 -vn -c:a aac ref_audio.m4a                        # 用原片音轨时
```
产出**镜头表**：`# | 起止时间 | 景别 | 机位/运动 | 画面动作 | 字幕 | 音效/拍点`。

### Step 2 · 原创类：写节拍表（beat sheet）
按秒写好“开场钩子 → 2–4 个展开桥段（含 1–2 个幽默反转）→ 高潮 → 署名收尾”。
先定 BPM（活泼剪辑常用 110–128），把每个关键动作对齐到拍点：`beat(n) = n * 60 / BPM`。
**时间表直接用拍号写，不用秒**（案例 8）：场景表写成 `[起拍, 止拍, 绘制函数]`，音乐脚本读同一套拍号。反推时长时先选“整数小节”：128BPM × 32 拍 = 15 秒，120BPM × 40 拍 = 20 秒。
原创类也要写**镜头表**（格式同 Step 1），节拍表管“什么时候发生”，镜头表管“怎么拍”：
- 景别轮换：远景交代环境 → 中景看动作 → 特写看表情，特写时背景虚化。
- 每个镜头只讲一件事，字越少越好；信息靠道具和表情传达。
- 至少设计 1 个“有想法的转场”：推进到物体内部、形状匹配剪辑（圆 → 月亮 → 按钮）、纸片翻页。
- 用户能给脚本或音乐时优先用用户的（案例 7 就是人给脚本和音乐、模型做动画）。

### Step 3 · 选技术路线
| 需求 | 选 |
|---|---|
| 手绘、UI、贴纸、信息图 | Canvas2D（或 SVG） |
| 写实光影、机位运动、体素/3D 角色 | three.js（EffectComposer：UnrealBloom、Bokeh、FilmPass） |
| 写实远景、天空、环境 | 生图背板贴在平面或天空球上，加轻微视差 |
| 像素风 | Canvas2D，关闭 imageSmoothing，坐标取整 |
| 动态图形、动态文字、品牌片头 | Canvas2D + `references/mograph-reel/`（lib.js 工具库 + 场景模板 + 音频 + 渲染管线），用 60fps |
| 拼贴、剪纸、绘本质感 | Canvas2D + `references/collage-kit.js`；纸张材质和背景底稿可用生图（如 Nano Banana）；更强的手绘笔触可用 p5.js + p5.brush |

### Step 3.5 · 质感层（必做，决定“好不好看”）
工具包：`references/collage-kit.js`（纯 Canvas2D，已验证可逐帧导出）。示例：`references/collage-demo.html`，内容是远景缓推后硬切特写，特写开景深和散景。

| 层 | 做法 | kit 函数 |
|---|---|---|
| 纸张材质 | 纸纤维、颗粒、色斑的平铺纹理，用 overlay 叠到每个色块上 | `paperTexture` + `texturize` |
| 撕纸分层 | 背景拆成 4–8 条撕纸，顶边分形噪声，白色纸芯边，投影 | `tornStrip` |
| 笔触填充 | 色块内叠几千条半透明短笔触（彩铅、蜡笔感） | `crayonFill` |
| 贴纸化 | 角色和道具加白色模切边和柔和投影 | `stickerize` |
| 光 | 月亮、灯、屏幕加 `lighter` 径向光晕 | `glow` |
| 景深 | 每层画到离屏 canvas，按与焦平面的距离 `ctx.filter = blur()` | `drawLayerDOF` |
| 散景 | 特写时背景加虚化光斑 | `bokeh` |
| 相机 | 关键帧插值的推、拉、摇，各层按深度做视差 | `camera` + `applyCamera` |
| 收尾 | soft-light 暖色调色、暗部偏冷、暗角、按帧轮换的胶片颗粒 | `finish` |

要点：
- **贵的东西只做一次**：纹理、撕纸、贴纸在启动时预渲染成离屏 canvas，每帧只 drawImage（示例每帧约 60ms）。
- **色板先定死**：1 个主色 + 1 个对比色 + 1–2 个点缀色，所有元素从色板里取。
- **远景要清晰、特写才虚化**：主角所在层永远在焦平面上；远景的 maxBlur 取 2–4，特写取 12–16。
- **层序按真实纵深排**：天空 → 最远的纸条 → 月亮/远景 → 近处纸条 → 地面 → 角色 → 前景遮挡物（树叶、草）。前景加一层虚化的遮挡物，纵深感立刻出来。

### Step 3.6 · 动态图形工具箱（`references/mograph-reel/lib.js`，已验证）
| 技法 | 函数 / 做法 | 注意 |
|---|---|---|
| 缓动库 | `E.expoOut / backOut / bounceOut / expoInOut`，`cubicBezier(x1,y1,x2,y2)`（牛顿迭代反解） | 每种缓动配一种“性格”：滑入用 expo，弹出用 back，落地用 bounce |
| 形状形变 | `SHAPES` 统一 240 点，从正上方顺时针采样，`morph(A,B,k)` | 起点和方向一致才不会拧麻花；形变时加 90° 旋转更有劲 |
| 手写 3D | `rotX/Y/Z` + `project([x,y,z])` | 远近用线宽 ×k、透明度随 z 衰减；按 z 从远到近排序后再画 |
| 文字→粒子 | `textPoints(str, font, size, cx, cy, 5000)` | 爆开范围控制在画面内（半径 ≤ 650），聚拢时从左到右错开 0.7 拍；粒子基本到位后再淡入实心字 |
| 运动模糊 | index.html 的 `renderFrame`：180° 快门内渲 10 个子帧，用 `globalAlpha = 1/(i+1)` 递推求平均 | **子帧不能跨过剪辑点**（clamp 到本镜头结束），否则切点处会糊成一帧叠化 |
| 故障 | `glitch(ctx, amt, seed)`：RGB 分离 + 横向切片错位 | 只在转场前后 0.1–0.4 拍用 |
| HUD | `hud()`：四角框、时间码、拍号、章节进度，`difference` 混合 | 场景内部的小标签要避开 HUD 区域（上下各留约 80px） |
| 颗粒 + 暗角 | `grainVignette(ctx, frame)`：6 张噪声图轮换 + 每帧随机偏移 | 颗粒在运动模糊之后叠加，保持颗粒清晰 |
| 融球 | 低分辨率（320×180）标量场 + 阈值软边，放大贴图 | 按像素算，每帧成本固定，别用高分辨率 |

### Step 4 · 写场景：一个 HTML，按时间确定性渲染
**铁律：画面只由 t（秒）决定**，不依赖 requestAnimationFrame 的累计量或 Math.random()。这样逐帧导出才稳定，也能随时跳到任意时间点预览。随机数用带种子的 PRNG（如 mulberry32）。

```html
<canvas id="c" width="1920" height="1080"></canvas>
<script>
const DURATION = 30, FPS = 30, BPM = 120;
const beat = n => n * 60 / BPM;
const clamp01 = v => Math.max(0, Math.min(1, v));
const prog = (t, a, b) => clamp01((t - a) / (b - a));          // 区间进度
const easeOutBack = x => 1 + 2.7*Math.pow(x-1,3) + 1.7*Math.pow(x-1,2);
const pulse = (t, at, len=0.15) => Math.max(0, 1 - Math.abs(t-at)/len); // 拍点冲击

function renderFrame(t) {
  // 1. 背景  2. 按镜头表/节拍表分段绘制  3. 字幕  4. 后期（颗粒、暗角、抖屏）
}
window.__scene = { duration: DURATION, fps: FPS, renderFrame };
// 预览模式：实时播放；?capture 时由导出脚本驱动
if (!new URLSearchParams(location.search).has('capture')) {
  const s = performance.now();
  (function loop(){ renderFrame(((performance.now()-s)/1000) % DURATION); requestAnimationFrame(loop); })();
}
</script>
```

手绘风常用技巧：
- **线条抖动 boil**：每 3 帧换一次种子（`Math.floor(t*8)`），给路径顶点加 ±1.5px 偏移。
- **挤压拉伸**：落地时 `scaleY = 1 - 0.2*pulse`，`scaleX = 1 + 0.15*pulse`。
- **贴纸字弹出**：easeOutBack 放大，带 ±8° 旋转，白描边加投影，0.6 秒后缩小消失。
- **表情**：眼睛眨动（每 3–4 秒闭眼 0.12 秒），开心时眼睛变成 `^ ^`，生气时加两道斜眉。
- **纸张质感**：底色 #f4efe6，叠一层低透明度噪点，再加暗角。

3D 常用技巧：
- `renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true, antialias: true })`
- 相机路径用关键帧加 CatmullRom 插值，在 `renderFrame(t)` 里按 t 取位置；切镜就直接换一组参数。
- 必须有**接触阴影**（角色脚下放一张半透明径向渐变贴片），否则角色像在飘。
- 地面避免偏蓝过亮，用中性灰，粗糙度 0.3–0.5。
- 体素角色：InstancedMesh 堆立方体，边缘加噪声让轮廓更“蓬”。
- 屏幕脸：用 CanvasTexture 画发光文字或像素表情，配合 emissive 和 bloom。

### Step 5 · 音乐
优先级：用户给的音轨或原片 > 用户明确要求的 AI 作曲 API > 代码合成。
代码合成兜底：用 Node 写 WAV（鼓 kick/snare/hat + 贝斯 + 简单琶音），BPM 和节拍表一致，这样天然卡点。
进阶（`references/mograph-reel/make_audio.cjs`）：底鼓用正弦加快速下扫的音高；hat、snare、whoosh 用高通或低通塑形的噪声；和弦用 7 根失谐锯齿波（supersaw）加一阶低通；和弦和贝斯走“被压”总线，每次底鼓时增益掉到 0.15 再在约 90ms 内恢复（侧链）；每个转场前放 whoosh，章节开头放一记低频冲击；最后爆点前 0.1 秒全静音。**所有音效用画面的同一套拍号触发。**
拿到外部音轨时，先检测节拍（例如 `aubio beat` 或 librosa），再**反过来**把节拍表对齐到真实拍点。

### Step 6 · 逐帧导出 MP4（已验证可用）
```js
// capture.cjs   运行：NODE_PATH=$(npm root -g) node capture.cjs scene.html out.mp4 [audio]
(async () => {
const { chromium } = require('playwright');
const { mkdirSync } = require('fs'); const { execSync } = require('child_process'); const path = require('path');
const [,, html='scene.html', out='out.mp4', audio=''] = process.argv;
mkdirSync('frames', { recursive: true });
const b = await chromium.launch({ args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('file://' + path.resolve(html) + '?capture');
await p.waitForFunction(() => window.__scene);
const { duration, fps } = await p.evaluate(() => ({ duration: __scene.duration, fps: __scene.fps }));
const N = Math.round(duration * fps);
for (let i = 0; i < N; i++) {
  await p.evaluate(async t => { await __scene.renderFrame(t); }, i / fps);
  await p.screenshot({ path: `frames/f${String(i).padStart(5,'0')}.png` });
}
await b.close();
const a = audio ? `-i ${audio} -c:a aac -b:a 192k -shortest` : '';
execSync(`ffmpeg -y -framerate ${fps} -i frames/f%05d.png ${a} -c:v libx264 -pix_fmt yuv420p -crf 18 -movflags +faststart ${out}`, { stdio: 'inherit' });
})();
```
- ESM 的 `import` 不认 NODE_PATH，所以用 `.cjs`。
- 竖屏时把 viewport 和 canvas 改成 1080×1920。
- 3D 场景很重时，可以改用 `canvas.toDataURL` 取帧，或者分段并行导出再 concat。
- 帧数多（60fps）时用 `references/mograph-reel/render.cjs`：截图用 JPEG q95，经 `image2pipe` 直接喂给 ffmpeg，不落盘；900 帧 × 10 子帧约 2.5 分钟。
- 预览加 `?mb=1` 关掉运动模糊，`?t=秒数` 可以停在指定时间。
- 导出前先渲 10 秒低分辨率草稿，确认节奏再出全片。

### Step 7 · 质检（必须亲眼看）
```bash
ffmpeg -i out.mp4 -vf fps=1,scale=480:-1,tile=4x3 check_%02d.jpg
```
逐张查看：**先对照参考或标杆（案例 7）问一句“哪里比它丑”**，常见答案是平涂、没材质、单一布局、字太多、没有景深；再查角色是否穿模或悬浮；字幕是否出界、是否和镜头同步；有没有黑帧或空镜；结尾署名是否完整；冲击点是否在拍点上（可以抽 `pulse` 前后几帧看）。
发现问题就按镜头号定点修改，不要整片推倒重来。

---

## 四、提示词模板（给用户参考或直接套用）

**原创短片（照案例 1 的结构写）：**
```
<角色> is the character. Make a <N>-second animation. The theme is <主题>.
<角色> is <在做什么具体的事，列 3–5 个动作>.
Make it feel <3–4 个情绪词>, with a few humorous moments.
This should be <a single continuous shot / N scenes>. It will be posted on <平台>.
Soundtrack: <来源与风格>, instrumental, synced to the beat.
End with <角色> <收尾动作> and signing off as <署名>.
[角色参考图]
```

**复刻：**
```
<参考视频链接> 帮我复刻这个。<角色A> 演 <原片角色1>，<角色B> 演 <原片角色2>，完整时长逐镜复刻，音轨用 <原片/新配乐>。
```

**迭代：** 截图加一句话指出不满意的那一幕，比如“第二幕景观太秃，要像这张参考图”。让模型自己提出新方案（换视角、贴背板、补阴影）。

---

## 五、踩过的坑
- 角色对应关系弄反 → 动手前先复述一遍“谁演谁”。
- 程序化写实景观“秃”、有“游戏感” → 改成生图背板，前景留给 3D。
- 角色悬浮 → 补接触阴影，脚底对齐地面 y。
- 地面偏蓝偏亮 → 改中性灰，降低环境光。
- 大段代码拼接时漏括号 → 每改一段就在浏览器里跑一次，看控制台报错。
- 用 Math.random 或累计时间 → 逐帧导出会闪烁、跳帧；只用 t 和带种子的随机数。
- 本地字体的 CSS 里，`url()` 相对的是 **CSS 文件所在目录**，不是 HTML 所在目录 → 字体 404，`document.fonts.load` 报错，页面一直不就绪。
- 粒子爆开太远（大部分飞出画面）→ 中间一大段空画面，然后突然聚拢。爆开半径要控制在画面内，聚拢时错开。
- 实心字比粒子先出现 → 看起来像“字自己淡入”，粒子白飞了。实心字要等粒子基本到位后再显示。
- 中文单字（動）不要用网络字体的 latin 子集 → 缺字；用系统的 Hiragino Sans / PingFang。
- **（2026-09 自查）功能讲清楚了但不好看**：一个 UI 面板一镜到底、平涂色块、满屏说明文字 → 像信息图而不是动画。改法：走拼贴纸艺路线，套上 Step 3.5 的质感层，拆成多镜头，删掉一半的字。
- 景深把远景里的主角也糊了 → 焦平面对准主角层，远景 maxBlur 设小。
- 月亮、太阳被近处纸条挡住 → 按纵深重排图层，发光体放在“最远纸条”和“次远纸条”之间。
- 质感纹理每帧重新生成 → 很慢，而且颗粒会闪；一律预渲染，颗粒用固定的几张噪声图按帧轮换。
- 在片尾写明灵感来源（复刻类必须写），不要冒用原作者的名字、商标或角色。