import "dotenv/config";
import OpenAI from "openai";
import readline from "readline";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const messages = [
  {
    role: "system",
    content: `You are a meeting prep assistant for sales reps and recruiters. 
    When given information about a person and a meeting context you will generate:
    1. Five tailored talking points specific to that person
    2. Three background facts about them
    3. Two ice breakers based on their interests
    Always format your response cleanly and professionally.
    Never make up facts you are not given.
    If information is missing, tell the user what additional context would make the prep stronger.`,
  },
];

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

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
    });

    const reply = response.choices[0].message.content;

    messages.push({
      role: "assistant",
      content: reply,
    });

    console.log(`\nAssistant: ${reply}\n`);
    chat();
  });
}

console.log('Chatbot ready! Type "exit" to quit.\n');
chat();