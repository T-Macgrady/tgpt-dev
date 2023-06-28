# Smol-Dev-JS

You own personal AI dev, which you can direct development in a collebrative back and forth experience.
Think of it as pair-programming, via the command line.

# Commands & Setup

## Update to node 18

```bash
sudo npm install -g n
sudo n 18
```

## smol-dev-js setup 

**Reminder: Do check on your openAI dashboard if you have GPT4 access**

Install via NPM

```bash
npm install -g smol-dev-js
```
or local dev, Customize the code:
```bash
npm link smol-dev-js
```

Either start a new JS project, or go to an existing nodejs project, run the setup function, and follow the process

```bash
cd my-js-project
smol-dev-js setup
```

![smol-dev-setup](https://raw.githubusercontent.com/PicoCreator/smol-dev-js/main/docs/smol-dev-setup.gif)

This will ask for your API keys, and setup the `.smol-dev-js` folder which it will use internally for you

## smol-dev-js prompt

Run the following command to start the smol-dev-js process, in your new or existing JS project

```bash
smol-dev-js prompt
```

![smol-dev-run](https://raw.githubusercontent.com/PicoCreator/smol-dev-js/main/docs/smol-dev-run.gif)

Once everything is generated, review the code and begin a loop where you ...

> engineering with prompts, rather than prompt engineering

Found an error? paste it in and let the AI suggest a fix for you. Or tell it what to do to fix it.

Loop until happiness is attained. Or that you find the AI being unhelpful, and take back control.

## smol-dev-js spec2code

Got all your project specifications file ready? Run th spec2code, and let the smol-dev AI generate it for you.

The general format of the spec folder should be
- `README.md` (high level spec)
- `NOTES.md` (any more point form feedback/instruction to pass to the AI globally, which may might not make sense in the spec)
- `<folder>/<filename>.<type>.md` (spec for a specific file)

> You will need the spec folder to be configured

## smol-dev-js code2spec

Lazy to write specs to an existing codebase from scratch, let the smol-dev AI generate a draft for you.

> You will need the spec folder to be configured

## Want to customize the settings further?

After generating the config, you can look into `.smol-dev-js/config` folder for various settings, including
- local cache settings
- caching with mongoDB (you can use the free tier)
- rate limits
