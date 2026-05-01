import "dotenv/config";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getEmbedding(text) {
  const response = await client.embeddings.create({
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

const sentenceA = "I love basketball";
const sentenceB = "I enjoy playing hoops";
const sentenceC = "The stock market crashed today";

const embeddingA = await getEmbedding(sentenceA);
const embeddingB = await getEmbedding(sentenceB);
const embeddingC = await getEmbedding(sentenceC);

const similarityAB = cosineSimilarity(embeddingA, embeddingB);
const similarityAC = cosineSimilarity(embeddingA, embeddingC);

console.log(`"${sentenceA}" vs "${sentenceB}"`);
console.log(`Similarity score: ${similarityAB.toFixed(4)}\n`);

console.log(`"${sentenceA}" vs "${sentenceC}"`);
console.log(`Similarity score: ${similarityAC.toFixed(4)}`);