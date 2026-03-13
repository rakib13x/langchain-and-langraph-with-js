import "dotenv/config";
import * as uuid from "uuid";
import { MultiVectorRetriever } from "langchain/retrievers/multi_vector";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { InMemoryStore } from "@langchain/core/stores";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { Document } from "@langchain/core/documents";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { ChatGroq } from "@langchain/groq";
import { PromptTemplate, ChatPromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence, RunnableLambda } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

const connectionString =
  "postgresql://langchain:langchain@localhost:6024/langchain";
const collectionName = "summaries";

// ── Load & Split ──────────────────────────────────────────────────────────────
const textLoader = new TextLoader("./mvp.txt");
const parentDocuments = await textLoader.load();
console.log("Loaded docs:", parentDocuments.length);

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 10000,
  chunkOverlap: 20,
});
const docs = await splitter.splitDocuments(parentDocuments);
console.log("Split into chunks:", docs.length);

// ── LLM for summarization ─────────────────────────────────────────────────────
const summaryLlm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.3-70b-versatile",
});

// ── Summarization Chain ───────────────────────────────────────────────────────
const summaryPrompt = PromptTemplate.fromTemplate(
  `Summarize the following document:\n\n{doc}`,
);

const summaryChain = RunnableSequence.from([
  { doc: (doc) => doc.pageContent },
  summaryPrompt,
  summaryLlm,
  new StringOutputParser(),
]);

console.log("Summarizing chunks...");
const summaries = await summaryChain.batch(docs, { maxConcurrency: 5 });
console.log("Summaries generated:", summaries.length);

// ── Build Summary Documents with IDs ─────────────────────────────────────────
const idKey = "doc_id";
const docIds = docs.map((_) => uuid.v4());

const summaryDocs = summaries.map((summary, i) => {
  return new Document({
    pageContent: summary,
    metadata: { [idKey]: docIds[i] },
  });
});

// ── Embeddings + Vector Store ─────────────────────────────────────────────────
const embeddingsModel = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HF_TOKEN,
  model: "sentence-transformers/all-MiniLM-L6-v2",
});

const byteStore = new InMemoryStore();

console.log("Storing summaries in PGVector...");
const vectorStore = await PGVectorStore.fromDocuments(
  summaryDocs,
  embeddingsModel,
  {
    postgresConnectionOptions: { connectionString },
    collectionName,
    collectionTableName: "langchain_pg_collection",
    tableName: "langchain_pg_embedding",
  },
);
console.log(
  "✅ Done! Embedded and stored",
  summaryDocs.length,
  "summary chunks into PGVector.",
);

// ── MultiVector Retriever ─────────────────────────────────────────────────────
const retriever = new MultiVectorRetriever({
  vectorstore: vectorStore,
  byteStore,
  idKey,
});

const keyValuePairs = docs.map((originalDoc, i) => [docIds[i], originalDoc]);
await retriever.docstore.mset(keyValuePairs);

// ── Test 1: Raw vector store search (returns summaries) ───────────────────────
const vectorstoreResult = await retriever.vectorstore.similaritySearch(
  "chapter on philosophy",
  2,
);
console.log(`\nSummary retrieved:\n${vectorstoreResult[0].pageContent}`);
console.log(
  `Summary retrieved length: ${vectorstoreResult[0].pageContent.length}`,
);

// ── Test 2: MultiVector retriever (returns original large chunks) ─────────────
// const retrieverResult = await retriever.invoke("chapter on philosophy");
// console.log(
//   `\nMulti-vector retrieved chunk length: ${retrieverResult[0].pageContent.length}`,
// );

// ── Test 3: QA Chain using simple vector store retriever ──────────────────────
const qaRetriever = vectorStore.asRetriever();

const qaPrompt = ChatPromptTemplate.fromTemplate(`Answer the question
  based on the following context:
  {context}

  Question: {question}`);

const qaLlm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  temperature: 0,
  model: "llama-3.3-70b-versatile",
});

const qa = RunnableLambda.from(async (input) => {
  const retrievedDocs = await qaRetriever.invoke(input);
  const formatted = await qaPrompt.invoke({
    context: retrievedDocs,
    question: input,
  });
  const answer = await qaLlm.invoke(formatted);
  return answer;
});

const response =
  await qa.invoke(`Today I woke up and brushed my teeth, then I sat down to read
the news. But then I forgot the food on the cooker. Who are some key figures
in the ancient greek history of philosophy?`);
console.log(`\nAnswer: ${response.content}`);
