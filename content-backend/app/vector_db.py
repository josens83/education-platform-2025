import chromadb
from chromadb.config import Settings
import openai
from typing import List, Dict
import json

# ChromaDB 임베디드 클라이언트
client = chromadb.Client(Settings(
    chroma_db_impl="duckdb+parquet",
    persist_directory="./chroma_data"
))

# 컬렉션 생성
def get_or_create_collection(name: str):
    try:
        return client.get_collection(name)
    except:
        return client.create_collection(
            name=name,
            metadata={"hnsw:space": "cosine"}
        )

# 텍스트 임베딩 생성
def create_embedding(text: str) -> List[float]:
    response = openai.Embedding.create(
        model="text-embedding-ada-002",
        input=text
    )
    return response['data'][0]['embedding']

# 카피 저장
def add_creative_to_vector(creative_id: int, text: str, metadata: Dict):
    collection = get_or_create_collection("copy_texts")

    embedding = create_embedding(text)

    collection.add(
        ids=[f"creative_{creative_id}"],
        embeddings=[embedding],
        documents=[text],
        metadatas=[metadata]
    )

# 유사 카피 검색
def search_similar_copies(query: str, top_k: int = 5) -> List[Dict]:
    collection = get_or_create_collection("copy_texts")

    query_embedding = create_embedding(query)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        include=["documents", "metadatas", "distances"]
    )

    return [
        {
            "id": results['ids'][0][i],
            "text": results['documents'][0][i],
            "metadata": results['metadatas'][0][i],
            "similarity": 1 - results['distances'][0][i]
        }
        for i in range(len(results['ids'][0]))
    ]
