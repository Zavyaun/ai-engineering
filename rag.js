import "dotenv/config";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// PHASE 1 - THE DOCUMENT
const document = `
TechCorp is a B2B software company founded in 2018 by CEO Sarah Johnson. 
The company specializes in CRM software for enterprise sales teams.
TechCorp has 250 employees and is headquartered in Austin, Texas.
Their flagship product is SalesFlow, used by over 500 enterprise clients.
TechCorp raised $50 million in Series B funding in 2023.
Sarah Johnson previously worked at Salesforce for 10 years before founding TechCorp.
The company's main competitors are Salesforce, HubSpot, and Pipedrive.
TechCorp's annual revenue is $30 million and growing 40% year over year.
Their engineering team uses Python, React, and AWS infrastructure.
TechCorp won the Austin Tech Startup of the Year award in 2022.
`;

// PHASE 1 - CHUNKING
function chunkDocument(text, chunkSize = 150) {
  const sentences = text.split(".").filter((s) => s.trim().length > 0);
  const chunks = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence + ".";
    }
  }

  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
}

// PHASE 1 - EMBEDDING EACH CHUNK
async function getEmbedding(text) {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

function cosineSimilarity(vectorA, vectorB) {
  const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

async function buildVectorStore(chunks) {
  console.log("Embedding document chunks...");
  const vectorStore = await Promise.all(
    chunks.map(async (chunk) => ({
      chunk,
      embedding: await getEmbedding(chunk),
    }))
  );
  console.log(`Embedded ${vectorStore.length} chunks\n`);
  return vectorStore;
}

// PHASE 2 - SEARCH
async function findRelevantChunks(query, vectorStore, topK = 3) {
  const queryEmbedding = await getEmbedding(query);
  const scored = vectorStore.map(({ chunk, embedding }) => ({
    chunk,
    score: cosineSimilarity(queryEmbedding, embedding),
  }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, topK).map((item) => item.chunk);
}

// PHASE 2 - GENERATION
async function askQuestion(question, vectorStore) {
  console.log(`Question: ${question}`);

  const relevantChunks = await findRelevantChunks(question, vectorStore);
  const context = relevantChunks.join("\n");

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: `You are a helpful assistant. Answer questions using ONLY the provided context. 
    If the answer is not in the context say "I don't have that information."`,
    messages: [
      {
        role: "user",
        content: `Context:\n${context}\n\nQuestion: ${question}`,
      },
    ],
  });

  console.log(`Answer: ${response.content[0].text}\n`);
}

// RUN IT
const chunks = chunkDocument(document);
const vectorStore = await buildVectorStore(chunks);

await askQuestion("Who is the CEO of TechCorp?", vectorStore);
await askQuestion("What is TechCorp's annual revenue?", vectorStore);
await askQuestion("What programming languages does TechCorp use?", vectorStore);
await askQuestion("When was TechCorp founded?", vectorStore);
await askQuestion("What is TechCorp's stock price?", vectorStore);