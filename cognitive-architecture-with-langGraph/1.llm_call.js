import "dotenv/config";
import { HumanMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";
import {
  StateGraph,
  Annotation,
  messagesStateReducer,
  START,
  END,
} from "@langchain/langgraph";
const model = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  apiKey: process.env.GROQ_API_KEY,
});
const StateAnnotation = Annotation.Root({
  /**
   * The State defines three things:
   * 1. The structure of the graph's state (which "channels" are available to
   * read/write)
   * 2. The default values for the state's channels
   * 3. The reducers for the state's channels. Reducers are functions that
   * determine how to apply updates to the state. Below, new messages are
   * appended to the messages array.
   */
  messages: Annotation({
    reducer: messagesStateReducer,
    default: () => [],
  }),
});
async function chatbot(state) {
  const answer = await model.invoke(state.messages);
  return { messages: answer };
}
const builder = new StateGraph(StateAnnotation)
  .addNode("chatbot", chatbot)
  .addEdge(START, "chatbot")
  .addEdge("chatbot", END);
const graph = builder.compile();

const graphRepresentation = await graph.getGraph().drawMermaidPng();
console.log(graphRepresentation);

const input = { messages: [new HumanMessage("hi")] };

for await (const chunk of await graph.stream(input)) {
  console.log(chunk.chatbot.messages.content);
}
