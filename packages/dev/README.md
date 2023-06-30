# @tgpt/dev

AI 编程工具正在从 copilot 的函数级上下文代码生成慢慢往项目级代码生成发展。

可以进行反复对话交互开发，将其想象为通过命令行进行结对编程的助手。

显然，这会消耗巨多的 token，不过我已经预设了默认免费的 openai_key！开箱即用

# [EN](./README_EN.md)

## Feature

- [根据提示生成代码](#根据提示生成代码)
- [根据代码生成文档](#根据代码生成文档)
- [根据文档生成代码](#根据文档生成代码)

## Setup

在新目录或者已有项目中执行 setup，按照提示配置项目信息

> 如果你没啥想法，可以一直回车，因为我已经预设了默认值，包括 openai_key。之后可以在`mol-devc-js/config`中再次修改

```bash
cd my-js-project
npx @tgpt/dev setup
```

![tgpt-setup](https://github.com/T-Macgrady/tgpt-dev/blob/main/demos/tgpt-setup.gif?raw=true)

npx 可能会比较慢，可以 clone 到本地，可以定制化修改

```bash
git clone git@github.com:T-Macgrady/tgpt-dev.git
cd tgpt-dev
pnpm i
tgpt-dev setup / npm link
```

## 根据提示生成代码

适合根据提示需求生成基础样板代码（草稿），再逐步优化，更加精细的需求可以使用 spec2code

```bash
cd my-js-project
npx @tgpt/dev prompt
```

告诉它你想做什么，如果你没啥头绪，可以直接回车让它给你一些建议。

![tgpt-prompt](https://github.com/T-Macgrady/tgpt-dev/blob/main/demos/tgpt-prompt-express_1.gif?raw=true)

完成任务后，你 review 代码，可能会发现了错误？将其粘贴进来，让 AI 为你建议一个修复方案。或者告诉它如何修复。

如此反复，直到满意为止。

可能结果不尽如人意？土豪可以配置自己的 api kye 更加稳定可靠，或者在迭代优化之前先考虑成为更优秀的 prompt 工程师...

## 根据代码生成文档

你可以

- 批量生成 md

对于简单反复的文档编写感到乏味？可以让 AI 为你批量生成。

![tgpt-prompt](https://github.com/T-Macgrady/tgpt-dev/blob/main/demos/tgpt-code2spec.gif?raw=true)

## 根据文档生成代码

md 详细描述你的需求，最好是列出每个需要的文件并描述功能（[Example](./packages/dev/example/pokedex/spec/README.md)），这样才能构建更大型的项目同时保证准确度

准备好你所有的项目规格文件了吗？运行 spec2code，让 AI 为你生成。

新增 spec 文件夹，通用格式应该是：

- `README.md`（主要有它就行）
- `NOTES.md`（全局传递给 AI 的更多反馈/指令，可能在 spec 中没有意义）
- `<folder>/<filename>.<type>.md`（特定文件的 spec）

## END

根据实践，目前它更适合帮助做一些基础重复工作，更精细的工作可以结合使用 copilot。
