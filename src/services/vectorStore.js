import { OpenAIEmbeddings } from "@langchain/openai";
import { Pinecone } from "@pinecone-database/pinecone";

const embeddings = new OpenAIEmbeddings({ model: "text-embedding-3-small" });

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

function getIndex(namespace) {
  const indexName = process.env.PINECONE_INDEX || "git-wiki";
  return pc.index({ name: indexName }).namespace(namespace);
}

export async function saveChunks(repo, documents) {
  const chunks = normalizeDocuments(documents);

  if (!chunks.length) {
    return { saved: false, chunkCount: 0 };
  }

  const namespace = repoToNamespace(repo);
  const index = getIndex(namespace);
  const texts = chunks.map((doc) => doc.pageContent);
  const vectors = await embeddings.embedDocuments(texts);

  const records = chunks.map((doc, i) => ({
    id: buildRecordId(repo, doc.metadata, doc.pageContent),
    values: vectors[i],
    metadata: {
      text: doc.pageContent,
      path: doc.metadata.path,
      repo: doc.metadata.repo ?? repo,
    },
  }));

  for (let i = 0; i < records.length; i += UPSERT_BATCH_SIZE) {
    await index.upsert({
      records: records.slice(i, i + UPSERT_BATCH_SIZE),
    });
  }

  return { saved: true, chunkCount: chunks.length };
}
