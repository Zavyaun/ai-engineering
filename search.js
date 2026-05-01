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

const meetingNotes = [
  "Met with the VP of Engineering at a fintech startup about their API infrastructure",
  "Sales call with the CTO of a healthcare company discussing data security",
  "Introduction meeting with Tesla's Head of Sales about CRM software",
  "Caught up with a marketing director about social media strategy",
  "Meeting with the CEO of an AI startup about potential partnership",
];

async function semanticSearch(query, notes) {
  console.log(`\nSearching for: "${query}"\n`);

  const queryEmbedding = await getEmbedding(query);

  const results = await Promise.all(
    notes.map(async (note) => {
      const noteEmbedding = await getEmbedding(note);
      const score = cosineSimilarity(queryEmbedding, noteEmbedding);
      return { note, score };
    })
  );

  results.sort((a, b) => b.score - a.score);

  console.log("Results ranked by relevance:");
  results.forEach((result, index) => {
    console.log(`${index + 1}. Score: ${result.score.toFixed(4)}`);
    console.log(`   ${result.note}\n`);
  });
}

await semanticSearch("data security concerns", meetingNotes);