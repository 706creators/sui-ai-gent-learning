# Week 1 Interactive with LLM API

主流集成 LLM 的方式，是通过发送 HTTP 请求，调用 LLM 服务商 API。

## 发送请求

最早的 LLM 服务商是 OpenAI，它的这套请求 Schema 约定，后来被很多 LLM 服务商采纳，成为事实上的标准。

具体可以参考 https://platform.openai.com/docs/guides/text-generation?lang=curl 与 https://platform.openai.com/docs/api-reference/chat/object

```bash
curl "https://api.openai.com/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-4o",
        "messages": [
            {
                "role": "system",
                "content": "You are a helpful assistant."
            },
            {
                "role": "user",
                "content": "Write a haiku about recursion in programming."
            }
        ]
    }'
```

其中，
- OPENAI_API_KEY 是需要到对应服务商申请的
- 如果你采用其他服务商，需要更换请求 host，如 Google Gemini 是 https://generativelanguage.googleapis.com/v1beta/openai/
- model 需要按照服务商的模型列表来选择
- messages 是请求的上下文，其中 role 是角色，content 是内容
  - role 常见有三个值：system, user, assistant
  - system 是系统角色，通常用于设置模型的一些行为，如扮演角色，回复语气等
  - user 是用户角色，通常用于设置用户的输入
  - assistant 是助手角色，通常用于设置模型的输出
- temperature 用于设置模型输出的随机性，值越大，输出越随机
- stream 是否采用流式输出
- response_format 是否采用 JSON 格式输出

## API Keys 注册

OpenAI 与 Anthropic 风控较严，有可能被封号。

- Open Router: https://openrouter.ai/ 聚合器，可以调用几乎所有模型，包括开源与闭源，支持加密货币充值
- OpenAI: https://platform.openai.com/settings/organization/api-keys 注意这与 chatgpt 账号是分开的
- Anthropic: https://console.anthropic.com/settings/keys 注意这与 chatgpt 账号是分开的
- Google: https://aistudio.google.com/apikey 暂时有一定免费额度
- DeepSeek: https://platform.deepseek.com/api_keys 国产之光

或者，使用 AWS， Google Cloud 等云服务商的 LLM 服务。

如果使用非常便宜的聚合 API，尽量仅在本地使用，生产环境可能造成不稳定。

## 第一梯队模型列表

各家参数与能力不同，需要根据具体场景选择。

- OpenAI 的 GPT 系列: https://platform.openai.com/docs/models
- Anthropic 的 Claude 系列: https://docs.anthropic.com/en/docs/about-claude/models
- Google Gemini: https://ai.google.dev/gemini-api/docs/models/gemini

## 使用 SDK

基本上各家都有自己的 SDK，大部分都兼容 OpenAI 的 Schema，可以都用 [openai-node](https://github.com/openai/openai-node)，但可能存在差异造成不兼容。

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'], // This is the default and can be omitted
});

async function main() {
  const chatCompletion = await client.chat.completions.create({
    messages: [{ role: 'user', content: 'Say this is a test' }],
    model: 'gpt-4o',
  });
}

main();
```

也可以采用全兼容的 Vercel AI SDK: https://github.com/vercel/ai 。

## 本地小模型

可以使用 ollama 或者 LM Studio 等使用本地模型进行调试开发，使用的门槛是有显卡或者使用 Apple Silicon 芯片的 Mac 电脑。

硬件要求是，7B 模型需要有 4G 显存，14B 模型需要有 9G 显存，才能具备正常的推理速度。

同时，Ollama 以及 LM Studio 都支持使用 OpenAI 的 Schema 进行调用，甚至添加了 function calling 和 JSON 模式的支持。

- ollama: https://ollama.ai/ 最流行的本地模型管理和运行工具
- LM Studio: https://lmstudio.ai/ 支持苹果自家的 MLX 框架效率更高
