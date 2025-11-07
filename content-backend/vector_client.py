"""
ChromaDB Vector Database Client for Content Backend
Handles semantic search and similar content recommendations
"""
import chromadb
from chromadb.config import Settings as ChromaSettings
from typing import List, Dict, Any, Optional
import logging
from openai import OpenAI
import os
from datetime import datetime

logger = logging.getLogger(__name__)


class VectorDBClient:
    """ChromaDB client for semantic content search"""

    COLLECTION_TEXTS = "generated_texts"
    COLLECTION_IMAGES = "generated_images"

    def __init__(self, persist_dir: str = "./chroma_data"):
        """Initialize ChromaDB client"""
        try:
            # ChromaDB 클라이언트 초기화
            self.client = chromadb.PersistentClient(
                path=persist_dir,
                settings=ChromaSettings(
                    anonymized_telemetry=False,
                    allow_reset=True
                )
            )

            # OpenAI 클라이언트 초기화
            openai_api_key = os.getenv("OPENAI_API_KEY")
            if not openai_api_key:
                logger.warning("OpenAI API key not found. Embeddings will fail.")
                self.openai_client = None
            else:
                self.openai_client = OpenAI(api_key=openai_api_key)

            # 컬렉션 초기화
            self.text_collection = self.client.get_or_create_collection(
                name=self.COLLECTION_TEXTS,
                metadata={"description": "AI generated text content"}
            )

            self.image_collection = self.client.get_or_create_collection(
                name=self.COLLECTION_IMAGES,
                metadata={"description": "AI generated image metadata"}
            )

            logger.info("✅ ChromaDB client initialized successfully")

        except Exception as e:
            logger.error(f"❌ Failed to initialize ChromaDB: {e}")
            raise

    def _get_embedding(self, text: str) -> List[float]:
        """Generate embedding using OpenAI text-embedding-ada-002"""
        if not self.openai_client:
            raise ValueError("OpenAI client not initialized")

        try:
            response = self.openai_client.embeddings.create(
                model="text-embedding-ada-002",
                input=text
            )
            return response.data[0].embedding

        except Exception as e:
            logger.error(f"Error generating embedding: {e}")
            raise

    def add_text_content(
        self,
        content_id: int,
        text: str,
        prompt: str,
        model: str = "gpt-3.5-turbo",
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Add generated text content to vector database

        Args:
            content_id: Unique content ID
            text: Generated text content
            prompt: Original prompt
            model: Model used for generation
            metadata: Additional metadata (user_id, segment_id, etc.)

        Returns:
            True if successful
        """
        try:
            # 임베딩 생성
            embedding = self._get_embedding(text)

            # 메타데이터 구성
            doc_metadata = {
                "content_id": content_id,
                "prompt": prompt[:500],  # 프롬프트 길이 제한
                "model": model,
                "created_at": datetime.utcnow().isoformat(),
                "content_length": len(text),
                **(metadata or {})
            }

            # ChromaDB에 추가
            self.text_collection.add(
                ids=[f"text_{content_id}"],
                embeddings=[embedding],
                documents=[text],
                metadatas=[doc_metadata]
            )

            logger.info(f"✅ Added text content {content_id} to vector DB")
            return True

        except Exception as e:
            logger.error(f"❌ Failed to add text content {content_id}: {e}")
            return False

    def add_image_metadata(
        self,
        content_id: int,
        prompt: str,
        image_url: str,
        model: str = "dall-e-3",
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Add generated image metadata to vector database

        Args:
            content_id: Unique content ID
            prompt: Image generation prompt
            image_url: Generated image URL
            model: Model used for generation
            metadata: Additional metadata

        Returns:
            True if successful
        """
        try:
            # 프롬프트 임베딩 생성
            embedding = self._get_embedding(prompt)

            # 메타데이터 구성
            doc_metadata = {
                "content_id": content_id,
                "image_url": image_url,
                "model": model,
                "created_at": datetime.utcnow().isoformat(),
                "prompt_length": len(prompt),
                **(metadata or {})
            }

            # ChromaDB에 추가
            self.image_collection.add(
                ids=[f"image_{content_id}"],
                embeddings=[embedding],
                documents=[prompt],  # 이미지는 프롬프트를 문서로 저장
                metadatas=[doc_metadata]
            )

            logger.info(f"✅ Added image metadata {content_id} to vector DB")
            return True

        except Exception as e:
            logger.error(f"❌ Failed to add image metadata {content_id}: {e}")
            return False

    def search_similar_texts(
        self,
        query: str,
        n_results: int = 5,
        where: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for similar text content

        Args:
            query: Search query
            n_results: Number of results to return
            where: Metadata filters (e.g., {"model": "gpt-3.5-turbo"})

        Returns:
            List of similar content with metadata
        """
        try:
            # 쿼리 임베딩 생성
            query_embedding = self._get_embedding(query)

            # 유사도 검색
            results = self.text_collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                where=where,
                include=["documents", "metadatas", "distances"]
            )

            # 결과 포맷팅
            similar_contents = []
            if results['ids'][0]:
                for i in range(len(results['ids'][0])):
                    similar_contents.append({
                        "id": results['ids'][0][i],
                        "content": results['documents'][0][i],
                        "metadata": results['metadatas'][0][i],
                        "similarity": 1 - results['distances'][0][i],  # 코사인 유사도
                        "distance": results['distances'][0][i]
                    })

            logger.info(f"✅ Found {len(similar_contents)} similar texts")
            return similar_contents

        except Exception as e:
            logger.error(f"❌ Failed to search similar texts: {e}")
            return []

    def search_similar_images(
        self,
        query: str,
        n_results: int = 5,
        where: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Search for similar image prompts

        Args:
            query: Search query
            n_results: Number of results to return
            where: Metadata filters

        Returns:
            List of similar images with metadata
        """
        try:
            # 쿼리 임베딩 생성
            query_embedding = self._get_embedding(query)

            # 유사도 검색
            results = self.image_collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                where=where,
                include=["documents", "metadatas", "distances"]
            )

            # 결과 포맷팅
            similar_images = []
            if results['ids'][0]:
                for i in range(len(results['ids'][0])):
                    similar_images.append({
                        "id": results['ids'][0][i],
                        "prompt": results['documents'][0][i],
                        "image_url": results['metadatas'][0][i].get('image_url'),
                        "metadata": results['metadatas'][0][i],
                        "similarity": 1 - results['distances'][0][i],
                        "distance": results['distances'][0][i]
                    })

            logger.info(f"✅ Found {len(similar_images)} similar images")
            return similar_images

        except Exception as e:
            logger.error(f"❌ Failed to search similar images: {e}")
            return []

    def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about collections"""
        try:
            text_count = self.text_collection.count()
            image_count = self.image_collection.count()

            return {
                "texts": {
                    "count": text_count,
                    "collection": self.COLLECTION_TEXTS
                },
                "images": {
                    "count": image_count,
                    "collection": self.COLLECTION_IMAGES
                },
                "total": text_count + image_count
            }

        except Exception as e:
            logger.error(f"Error getting collection stats: {e}")
            return {"error": str(e)}


# 전역 클라이언트 인스턴스 (싱글톤 패턴)
_vector_client: Optional[VectorDBClient] = None


def get_vector_client() -> VectorDBClient:
    """Get or create VectorDB client instance"""
    global _vector_client
    if _vector_client is None:
        _vector_client = VectorDBClient()
    return _vector_client
