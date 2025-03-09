import express from "express";
import OpenAI from "openai";
import router from "./router";
import { env } from "./env";

const port = 8000;
const app = express();

app.use(router);

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

(async () => {
    const client = new OpenAI({
        apiKey: env.OPENAI_API_KEY
    })
    const stream = await client.chat.completions.create({
        messages: [{ role: 'user', content: 'Say this is a test' }],
        model: 'gpt-4o',
        stream: true
    });

    for await (const chunk of stream) {
        process.stdout.write(chunk.choices[0]?.delta?.content || '');
    }
})();