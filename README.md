# 🦜🔗 LangChain & LangGraph with JavaScript

A hands-on collection of code examples exploring **LangChain** and **LangGraph** using JavaScript/Node.js — from basic chains to complex multi-agent workflows.

---

## 📌 What is LangChain?

[LangChain](https://js.langchain.com/) is a framework for building applications powered by large language models (LLMs). It provides tools for:

- Connecting LLMs to external data sources
- Building chains and pipelines
- Managing prompts and memory
- Integrating tools and APIs

## 📌 What is LangGraph?

[LangGraph](https://langchain-ai.github.io/langgraphjs/) is a library built on top of LangChain for building **stateful, multi-actor applications** with LLMs. It models workflows as graphs where:

- **Nodes** = agents or functions
- **Edges** = transitions between steps
- **State** = shared data flowing through the graph

---

## 🗂️ Project Structure

```
📦 langchain-and-langraph-with-js
├── 📁 langchain/
│   ├── 01-basic-llm-call/
│   ├── 02-prompt-templates/
│   ├── 03-chains/
│   ├── 04-rag/
│   ├── 05-memory/
│   └── 06-tools-and-agents/
├── 📁 langgraph/
│   ├── 01-simple-graph/
│   ├── 02-conditional-edges/
│   ├── 03-multi-agent/
│   └── 04-human-in-the-loop/
├── .env.example
├── .gitignore
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- A Groq API key — get one free at [console.groq.com](https://console.groq.com)

### Installation

```bash
# Clone the repository
git clone https://github.com/rakib13x/langchain-and-langraph-with-js.git

# Navigate into the project
cd langchain-and-langraph-with-js

# Install dependencies
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Add your API key to the `.env` file:

```env
GROQ_API_KEY=your_groq_api_key_here
```

---

## 🧪 Code Examples

### ⚡ LangChain — Basic LLM Call

```javascript
import { ChatGroq } from "@langchain/groq";

const llm = new ChatGroq({ model: "llama-3.3-70b-versatile" });

const response = await llm.invoke("What is LangChain?");
console.log(response.content);
```

---

### 📝 LangChain — Prompt Templates

```javascript
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq";

const prompt = ChatPromptTemplate.fromTemplate(
  "You are a helpful assistant. Answer this question: {question}"
);

const llm = new ChatGroq({ model: "llama-3.3-70b-versatile" });
const chain = prompt.pipe(llm);

const response = await chain.invoke({ question: "What is RAG?" });
console.log(response.content);
```

---

### 🔗 LangChain — LCEL Chain

```javascript
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const prompt = ChatPromptTemplate.fromTemplate("Tell me a joke about {topic}");
const llm = new ChatGroq({ model: "llama-3.3-70b-versatile" });
const parser = new StringOutputParser();

const chain = prompt.pipe(llm).pipe(parser);

const result = await chain.invoke({ topic: "JavaScript" });
console.log(result);
```

---

---

## 📚 Topics will be Covered

| Topic | LangChain | LangGraph |
|---|---|---|
| Basic LLM Calls | ✅ | |
| Prompt Templates | ✅ | |
| LCEL Chains | ✅ | |
| Memory & History | ✅ | |
| RAG (Retrieval Augmented Generation) | ✅ | |
| Tools & Function Calling | ✅ | |
| Simple Graphs | | ✅ |
| Conditional Edges | | ✅ |
| Multi-Agent Workflows | | ✅ |
| Human-in-the-Loop | | ✅ |

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **LLM Framework:** LangChain.js, LangGraph.js
- **LLM Provider:** Groq (Llama 3.3 70b) — Free & blazing fast ⚡
- **Language:** JavaScript (ESModules)

---

## 📖 Resources

- [LangChain.js Docs](https://js.langchain.com/docs/)
- [LangGraph.js Docs](https://langchain-ai.github.io/langgraphjs/)
- [OpenAI API Docs](https://platform.openai.com/docs/)

---

## 🙌 Author

**Rakib** — [@rakib13x](https://github.com/rakib13x)

> ⭐ If you find this helpful, give it a star and follow along as more examples are added!
