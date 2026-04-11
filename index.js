import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import readline from "readline";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const messages = [];

function chat() {
  rl.question("You: ", async (userInput) => {
    if (userInput.toLowerCase() === "exit") {
      console.log("Goodbye!");
      rl.close();
      return;
    }

    messages.push({
      role: "user",
      content: userInput,
    });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: `You are a meeting prep assistant for sales reps and recruiters. 
      When given information about a person and a meeting context you will generate:
      1. Five tailored talking points specific to that person
      2. Three background facts about them
      3. Two ice breakers based on their interests
      Always format your response cleanly and professionally.
      Never make up facts you are not given.
      If information is missing tell the user what additional context would make the prep stronger.`,
      messages: messages,
    });

    const reply = response.content[0].text;

    messages.push({
      role: "assistant",
      content: reply,
    });

    console.log(`\nAssistant: ${reply}\n`);
    chat();
  });
}

console.log('Claude assistant ready! Type "exit" to quit.\n');
chat();