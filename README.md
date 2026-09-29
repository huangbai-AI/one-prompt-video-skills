# 一句话成片 · Skills

视频《一句话生成完整视频》里用到的三个 Skill。把 AI 当成剪辑团队：写稿、生成口播数字人、做 B-roll、合成、抽帧检查，一条流程做完。

| Skill | 做什么 |
|---|---|
| [`one-prompt-video`](one-prompt-video) | **一句话成片**：把整条流程串起来——写稿 → 口播数字人（本人照片 + 本人声音）→ B-roll → HyperFrames 合成 → 分段渲染 → 抽帧检查 → 按平台出版本。附检查卡帧 / 停顿、哔声、分段渲染三个脚本 |
| [`huangbai-script`](huangbai-script) | **写稿**：从往期视频提炼的口播结构、固定句式和幽默节奏，输出「阶段｜口播｜画面」三列分镜表 |
| [`opus-code-animation`](opus-code-animation) | **代码动画**：时间轴、档案卡、流程图这类说明动画，用代码逐帧画出来，导出 MP4 |

## 安装

把需要的文件夹复制到 `~/.claude/skills/`，在 Claude Code 里直接说「帮我做一条口播视频」即可。

```bash
git clone https://github.com/huangbai-AI/one-prompt-video-skills.git
cp -R one-prompt-video-skills/one-prompt-video one-prompt-video-skills/huangbai-script one-prompt-video-skills/opus-code-animation ~/.claude/skills/
```

## 需要的工具

- ffmpeg、Python 3（numpy）
- whisper.cpp（`whisper-cli`，用于逐字核对台词）
- 即梦 CLI（生成口播数字人，会消耗积分）
- HyperFrames（`npx hyperframes`，合成与渲染）

文字版教程：https://hcnbsg6ttb3t.feishu.cn/docx/HHcgdohb4owLxjxssR2cOHiXnUh
