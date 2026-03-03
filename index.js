import "dotenv/config";
import { ChatGroq } from "@langchain/groq";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

const model = new ChatGroq({ model: "llama-3.3-70b-versatile" });
// const response = await model.invoke("The sky is");
const prompt = [
  new SystemMessage(`You are a helpful assistant that responds to questions with three
exclamation marks.`),
  new HumanMessage("What is the capital of Bangladesh?"),
];
const response = await model.invoke(prompt);
console.log(`The reply of Ai Mssage: ${response.content}`);
