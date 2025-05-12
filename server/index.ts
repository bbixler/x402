import { config } from "dotenv";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { paymentMiddleware, Network, Resource } from "x402-hono";
import { InferenceClient } from "@huggingface/inference";

config();

const facilitatorUrl = process.env.FACILITATOR_URL as Resource;
const payTo = process.env.ADDRESS as `0x${string}`;
const network = process.env.NETWORK as Network;
const huggingFaceAPIToken = process.env.HF_API_TOKEN;

if (!facilitatorUrl || !payTo || !network || !huggingFaceAPIToken) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const app = new Hono();

console.log("Server is running");

app.use(
  paymentMiddleware(
    payTo,
    {
      "/weather": {
        price: "$0.0001",
        network,
      },
    },
    {
      url: facilitatorUrl,
    },
  ),
);

app.get("/weather", c => {
  return c.json({
    report: {
      weather: "rainy",
      temperature: 56,
    },
  });
});

app.get("/agent", async c => {
  const client = new InferenceClient(huggingFaceAPIToken);
  const question: string = "Is it better to smoke brisket fat side up or down?";


  const chat = await client.chatCompletion({
    provider: "fireworks-ai",
    model: "Qwen/Qwen3-30B-A3B",
    messages: [
      {
        role: "user",
        content: question,
      },
    ],
  });

  return c.json({
    return: {
      question: question,
      answer: chat.choices[0].message,
    },
  });
});

serve({
  fetch: app.fetch,
  port: 3000,
});