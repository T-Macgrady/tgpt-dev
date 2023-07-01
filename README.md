# @tgpt/dev

AI 编程工具正在从 copilot 的对话、补全往项目级代码生成发展。

你可以和 TA 进行反复对话交互开发，将其想象为通过命令行进行结对编程的助手。

显然，这会消耗大量的 token，不过我已经预设了默认免费的 openai_key，开箱即用，快来试试吧~

[EN](./README_EN.md)

---

## Feature

- [根据提示生成代码](#根据提示生成代码)
- [根据代码生成文档](#根据代码生成文档)
- [根据文档生成代码](#根据文档生成代码)

## 初始化

在新目录或者已有项目中执行 setup，按照提示配置基础信息。

```bash
cd my-js-project
npx @tgpt/dev setup
```

如果你没特殊需求，可以一直回车，因为我已经预设了默认值，包括`openai_key`， 可以在 `config` 中再次修改，比如 gpt4 效果更佳。

![tgpt-setup.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/19af62fb4406498b9affad51a8ec591e~tplv-k3u1fbpfcp-watermark.image?)

你也可以不用 npx，clone [@tgpt/dev](https://github.com/T-Macgrady/tgpt-dev) 到本地，开发调试。

```bash
git clone git@github.com:T-Macgrady/tgpt-dev.git
cd tgpt-dev
pnpm i
tgpt-dev setup / npm link
```

## 根据提示生成代码

适合根据简短提示需求（中英文都可以）生成基础样板代码/草稿，再逐步优化。

```bash
cd my-js-project
npx @tgpt/dev prompt
```

告诉它你想做什么，如果你没啥头绪，可以直接回车，它会读取当前代码并提供建议。这个过程需要反复请求，稍等片刻~

![tgpt-prompt-express_1.gif](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/dec91cfb19924320af5da2b1067c53ab~tplv-k3u1fbpfcp-watermark.image?)

AI 完成任务后，可能会发现错误？执行 prompt 让 AI 为你提供修复方案，或者告诉它如何修复，如此反复，直到满意。

响应效果受模型和提示词影响，gpt4 效果更佳，感兴趣可以 clone [@tgpt/dev](https://github.com/T-Macgrady/tgpt-dev) 到本地调优 prompt。

## 根据代码生成文档

对于简单繁复的文档编写感到乏味？可以让 AI 为你批量生成，协助你理解代码。

可以配置 `config.src_include` 过滤需要的文件

![tgpt-code2spec.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/3664e2adf77c499199f3f2e13462002c~tplv-k3u1fbpfcp-watermark.image?)

在 spec 文件夹可以查看生成的所有文档

## 根据文档生成代码

新增 `spec/README.md` 详细描述你的需求，最好是列出每个需要的文件并描述功能，这样在构建更大型项目时才能准确满足你的需求，参考示例：[Example](https://github.com/T-Macgrady/tgpt-dev/tree/main/packages/dev/example)

spec 格式：

- `README.md` 必要
- `NOTES.md` 可选，全局传递给 AI 的更多反馈/指令，可能在 spec 中没有意义
- `<folder>/<filename>.<type>.md` 特定文件的 spec

![tgpt-spec2code.jpg](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/57d887a424f8424b83a77c945361d802~tplv-k3u1fbpfcp-watermark.image?)

## End

根据实践，目前它更适合帮助做一些批量转换 / 样板代码生成的工作，结合 `copilot` 完善细节，还在迭代优化，可以 [@tgpt/dev](https://github.com/T-Macgrady/tgpt-dev) star 一下~
