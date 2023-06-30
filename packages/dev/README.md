# @tgpt/dev

属于你自己的个人AI开发助手，可以进行反复对话交互开发，将其想象为通过命令行进行结对编程的助手。

显然，这会消耗很多的token，不过我已经预设了默认免费的API key！！！开箱即用


# [EN](./README_EN.md)

## Feature

- [根据提示生成代码](#prompt)
- [根据代码生成文档](#spec2code)
- [根据文档生成代码](#code2spec)

## Setup

在新目录或者已有项目中执行setup，按照提示配置项目信息

> 如果你没啥想法，可以一直回车，因为我已经预设了默认值，包括openai_key。之后可以在`mol-devc-js/config`中再次修改

```bash
cd my-js-project
npx @tgpt/dev setup
```

![tgpt-setup](./demos/tgpt-setup.gif)

你也可以选择clone到本地定制化修改后然后`npm link`

## 根据提示生成文档

适合根据提示需求生成基础样板代码（草稿），再逐步优化，更加精细的需求可以使用spec2code

```bash
cd my-js-project
npx @tgpt/dev prompt
```

告诉它你想做什么，如果你没啥头绪，可以直接回车让它给你一些建议。

![tgpt-prompt](./demos/tgpt-prompt-express.gif)

完成任务后，你review代码，可能会发现了错误？将其粘贴进来，让AI为你建议一个修复方案。或者告诉它如何修复。

如此反复，直到满意为止。

## 根据代码生成文档

你可以

- 批量生成md

对于简单反复的文档编写感到乏味？可以让  AI 为你批量生成。

![tgpt-prompt](./demos/tgpt-code2spec.gif)


## 根据代码生成文档

md详细描述你的需求，最好是列出每个需要的文件并描述功能（[Example](./example/)），这样才能构建更大型的项目同时保证准确度

准备好你所有的项目规格文件了吗？运行spec2code，让AI为你生成。

新增spec文件夹，通用格式应该是：

- `README.md`（主要有它就行）
- `NOTES.md`（全局传递给AI的更多反馈/指令，可能在spec中没有意义）
- `<folder>/<filename>.<type>.md`（特定文件的spec）

## END

根据实践，目前它更适合帮助做一些基础重复工作，更精细的工作可以结合使用copilot。

或许结果不尽如人意，在迭代优化之前先考虑成为更优秀的prompt工程师...