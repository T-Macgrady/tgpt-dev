# ai-bridge

Thin wrapper over openAI api, and potentially other AI provider alternatives.
It helps handle out of the box caching of request.

It also provide some very minor QOL enhancments to the API

## Cache Options
- Local jsonl cache dir
- MongoDB connection

## Provider support
- openAI

## Future provider support?
- claude ?
- forefront (embedding not supported)

## Why should you be caching your AI response?

In general running LLM, is an expensive process. Caching however helps offset the cost involved for frequent and common query.
The downside is, this is not appropriate for all use cases.
