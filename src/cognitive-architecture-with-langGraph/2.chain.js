import "dotenv/config";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import {
  StateGraph,
  Annotation,
  messagesStateReducer,
  START,
  END,
} from "@langchain/langgraph";
import { ChatGroq } from "@langchain/groq";
// useful to generate SQL query
const modelLowTemp = new ChatGroq({
  temperature: 0.1,
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
});
// useful to generate natural language outputs
const modelHighTemp = new ChatGroq({
  temperature: 0.7,
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
});
const annotation = Annotation.Root({
  messages: Annotation({ reducer: messagesStateReducer, default: () => [] }),
  user_query: Annotation(),
  sql_query: Annotation(),
  sql_explanation: Annotation(),
});
const generatePrompt = new SystemMessage(
  `You are a helpful data analyst who generates SQL queries for users based on
their questions.`,
);
async function generateSql(state) {
  const userMessage = new HumanMessage(state.user_query);
  const messages = [generatePrompt, ...state.messages, userMessage];
  const res = await modelLowTemp.invoke(messages);
  return {
    sql_query: res.content,
    // update conversation history
    messages: [userMessage, res],
  };
}
const explainPrompt = new SystemMessage(
  "You are a helpful data analyst who explains SQL queries to users.",
);
async function explainSql(state) {
  // Explicitly tell the model what to explain
  const explainRequest = new HumanMessage(
    `Please provide a detailed natural language explanation for this SQL query: ${state.sql_query}`,
  );

  const messages = [explainPrompt, explainRequest];
  const res = await modelHighTemp.invoke(messages);

  return {
    sql_explanation: res.content,
    // Add this explanation to the message history
    messages: [explainRequest, res],
  };
}
const builder = new StateGraph(annotation)
  .addNode("generate_sql", generateSql)
  .addNode("explain_sql", explainSql)
  .addEdge(START, "generate_sql")
  .addEdge("generate_sql", "explain_sql")
  .addEdge("explain_sql", END);
const graph = builder.compile();

const result = await graph.invoke({
  user_query: "What is the total sales for each product?",
});

// console.log("Generated SQL Query:", result);
console.log("SQL Query:", result.sql_query);
console.log("SQL Explanation:", result.sql_explanation);
// To get the first message (the HumanMessage)
console.log("Human Message:", result.messages[0].content);

// To get the second message (the first AI Response)
console.log("AI Message:", result.messages[1].content);
