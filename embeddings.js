import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await client.embeddings.create({
  model: "text-embedding-3-small",
  input: "The stock market crashed today",
});

const vector = response.data[0].embedding;

console.log("Number of dimensions:", vector.length);
console.log("First 5 numbers:", vector.slice(0, 5));