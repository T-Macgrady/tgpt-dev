You own personal AI dev, which you can direct development in a collebrative back and forth experience.
Think of it as pair-programming, via the command line.

Know that this job consumes a lot of tokons, luckily I have preset the default openai_key for you!!!

## Feature

- [Generate code based on the prompt](#prompt).
- [Generate documentation based on the code](#spec2code).
- [Generate code based on the documentation](#code2spec).

## setup

Either start a new JS project, or go to an existing nodejs project, run the setup function, and follow the process

```bash
cd my-js-project
npx @tgpt/dev setup
```
> You can also choose clone to local and customize it , then 'npm link'

This will ask for your API keys, and setup the `/dev` folder which it will use internally for you

![tgpt-setup](./demos/tgpt-setup.gif)


- If you don't have any special needs, you can always press enter in this step, because I have preset default values, especially openai key!!!

- You also can modify it in `mol-devc-js/config`

## Generate documentation based on the prompt

In your new or existing JS project

```bash
npx @tgpt/dev prompt
```

Tell it what you want to do, and if you don't have any ideas, ask it to give some suggestions

![tgpt-prompt](./demos/tgpt-prompt-express.gif)

Once everything is generated, review the code and begin a loop where you ...

Found an error? paste it in and let the AI suggest a fix for you. Or tell it what to do to fix it.

Loop until happiness is attained. Or that you find the AI being unhelpful, and take back control.

## Generate code based on the documentation#{code2spec}

Lazy to write specs to an existing codebase from scratch, let the smol-dev AI generate a draft for you.

![tgpt-prompt](./demos/tgpt-code2spec.gif)

> You will need the spec folder to be configured


## Generate documentation based on the code#{spec2code}

Got all your project specifications file ready? Run th spec2code, and let the smol-dev AI generate it for you.[Example](./example/)

The general format of the spec folder should be

- `README.md` (high level spec)
- `NOTES.md` (any more point form feedback/instruction to pass to the AI globally, which may might not make sense in the spec)
- `<folder>/<filename>.<type>.md` (spec for a specific file)


## End

According to current practice, it is more suitable for doing some project-level batch generation/conversion of files, and more refined work can be used with copilot. Still in iterative optimization, hope it will be better in the future
