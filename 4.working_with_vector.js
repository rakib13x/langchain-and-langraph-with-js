import "dotenv/config";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { v4 as uuidv4 } from "uuid";

const loader = new TextLoader("./test.txt");
const raw_docs = await loader.load();
console.log("Loaded docs:", raw_docs.length);

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});
const docs = await splitter.splitDocuments(raw_docs);
console.log("Split into chunks:", docs.length);

const embeddings_model = new HuggingFaceInferenceEmbeddings({
  apiKey: process.env.HF_TOKEN,
  model: "sentence-transformers/all-MiniLM-L6-v2",
});

const db = await PGVectorStore.fromDocuments(docs, embeddings_model, {
  postgresConnectionOptions: {
    connectionString:
      "postgresql://langchain:langchain@localhost:6024/langchain",
  },
});

console.log(
  "✅ Done! Embedded and stored",
  docs.length,
  "chunks into PGVector.",
);

// await db.end();

const responseData = await db.similaritySearch("query", 4);
console.log("ResponseData:", responseData);

//add more documents to an existing documents
const ids = [uuidv4(), uuidv4()];
await db.addDocuments(
  [
    {
      pageContent: "there are cats in the pond",
      metadata: { location: "pond", topic: "animals" },
    },
    {
      pageContent: "ducks are also found in the pond",
      metadata: { location: "pond", topic: "animals" },
    },
  ],
  { ids },
);
console.log("Added documents with custom IDs:", ids);
