# Chroma RAG & Semantic Search Implementation Guide

## Installation & Setup

### 1. Install Dependencies
```bash
# Core dependencies
pip install chromadb
pip install sentence-transformers
pip install openai  # or anthropic for Claude
pip install tiktoken  # for token counting

# Optional: Enhanced embeddings
pip install transformers torch
```

### 2. Initialize Chroma Client
```python
import chromadb
from chromadb.config import Settings
import os
from sentence_transformers import SentenceTransformer

# Initialize client with persistent storage
client = chromadb.PersistentClient(path="./chroma_db")

# Initialize embedding model
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
```

## Document Processing & Ingestion

### 3. Document Chunking Strategy
```python
import tiktoken
from typing import List, Dict

def smart_chunk_text(text: str, max_tokens: int = 500, overlap: int = 50) -> List[str]:
    """
    Chunk text intelligently preserving semantic boundaries
    """
    encoding = tiktoken.get_encoding("cl100k_base")
    
    # Split by paragraphs first
    paragraphs = text.split('\n\n')
    chunks = []
    current_chunk = ""
    
    for paragraph in paragraphs:
        paragraph_tokens = len(encoding.encode(paragraph))
        current_tokens = len(encoding.encode(current_chunk))
        
        if current_tokens + paragraph_tokens > max_tokens and current_chunk:
            chunks.append(current_chunk.strip())
            # Add overlap from previous chunk
            overlap_text = current_chunk.split()[-overlap:]
            current_chunk = ' '.join(overlap_text) + ' ' + paragraph
        else:
            current_chunk += '\n\n' + paragraph if current_chunk else paragraph
    
    if current_chunk:
        chunks.append(current_chunk.strip())
    
    return chunks

def create_document_metadata(file_path: str, chunk_index: int, total_chunks: int) -> Dict:
    """
    Create comprehensive metadata for each chunk
    """
    return {
        "source": file_path,
        "chunk_index": chunk_index,
        "total_chunks": total_chunks,
        "timestamp": os.path.getmtime(file_path),
        "file_type": os.path.splitext(file_path)[1],
        "chunk_id": f"{os.path.basename(file_path)}_{chunk_index}"
    }
```

### 4. Collection Setup & Data Ingestion
```python
def setup_knowledge_base(collection_name: str = "knowledge_base"):
    """
    Setup Chroma collection with proper configuration
    """
    # Create or get collection
    try:
        collection = client.get_collection(name=collection_name)
        print(f"Loaded existing collection: {collection_name}")
    except:
        collection = client.create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"}  # Use cosine similarity
        )
        print(f"Created new collection: {collection_name}")
    
    return collection

def ingest_documents(collection, documents_path: str):
    """
    Ingest documents into Chroma collection
    """
    all_chunks = []
    all_metadatas = []
    all_ids = []
    
    for file_path in os.listdir(documents_path):
        if file_path.endswith(('.txt', '.md', '.py', '.json')):
            full_path = os.path.join(documents_path, file_path)
            
            with open(full_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            chunks = smart_chunk_text(content)
            
            for i, chunk in enumerate(chunks):
                all_chunks.append(chunk)
                all_metadatas.append(create_document_metadata(full_path, i, len(chunks)))
                all_ids.append(f"{file_path}_{i}")
    
    # Add to collection
    collection.add(
        documents=all_chunks,
        metadatas=all_metadatas,
        ids=all_ids
    )
    
    print(f"Ingested {len(all_chunks)} chunks from {len(os.listdir(documents_path))} documents")
```

## Advanced Semantic Search

### 5. Semantic Search with Filtering
```python
class AdvancedSemanticSearch:
    def __init__(self, collection):
        self.collection = collection
        self.embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
    
    def search(self, 
               query: str, 
               n_results: int = 5,
               source_filter: str = None,
               file_type_filter: str = None,
               similarity_threshold: float = 0.7) -> List[Dict]:
        """
        Advanced semantic search with filtering and thresholding
        """
        # Build where clause for filtering
        where_clause = {}
        if source_filter:
            where_clause["source"] = {"$contains": source_filter}
        if file_type_filter:
            where_clause["file_type"] = file_type_filter
        
        # Perform search
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results * 2,  # Get more results for filtering
            where=where_clause if where_clause else None,
            include=["documents", "metadatas", "distances"]
        )
        
        # Filter by similarity threshold
        filtered_results = []
        for i, distance in enumerate(results['distances'][0]):
            similarity = 1 - distance  # Convert distance to similarity
            if similarity >= similarity_threshold:
                filtered_results.append({
                    "content": results['documents'][0][i],
                    "metadata": results['metadatas'][0][i],
                    "similarity": similarity
                })
        
        return filtered_results[:n_results]
    
    def multi_query_search(self, queries: List[str], n_results: int = 3) -> List[Dict]:
        """
        Search using multiple query variations for better recall
        """
        all_results = []
        seen_ids = set()
        
        for query in queries:
            results = self.search(query, n_results)
            for result in results:
                chunk_id = result['metadata']['chunk_id']
                if chunk_id not in seen_ids:
                    all_results.append(result)
                    seen_ids.add(chunk_id)
        
        # Sort by similarity and return top results
        all_results.sort(key=lambda x: x['similarity'], reverse=True)
        return all_results[:n_results]
```

## RAG Implementation

### 6. Context-Aware RAG System
```python
class RAGSystem:
    def __init__(self, collection, llm_client, max_context_tokens: int = 4000):
        self.searcher = AdvancedSemanticSearch(collection)
        self.llm_client = llm_client
        self.max_context_tokens = max_context_tokens
        self.encoding = tiktoken.get_encoding("cl100k_base")
    
    def format_context(self, search_results: List[Dict]) -> str:
        """
        Format search results into structured context
        """
        context_parts = []
        total_tokens = 0
        
        for i, result in enumerate(search_results, 1):
            chunk_tokens = len(self.encoding.encode(result['content']))
            
            if total_tokens + chunk_tokens > self.max_context_tokens:
                break
            
            formatted_chunk = f"""
<document_chunk id="{result['metadata']['chunk_id']}" 
                 source="{result['metadata']['source']}"
                 similarity="{result['similarity']:.3f}">
{result['content']}
</document_chunk>
"""
            context_parts.append(formatted_chunk)
            total_tokens += chunk_tokens
        
        return "\n".join(context_parts)
    
    def generate_response(self, 
                         user_query: str, 
                         search_queries: List[str] = None,
                         system_context: str = None) -> Dict:
        """
        Generate RAG response with full context tracking
        """
        # Use user query if no specific search queries provided
        if not search_queries:
            search_queries = [user_query]
        
        # Retrieve relevant context
        search_results = self.searcher.multi_query_search(search_queries)
        context = self.format_context(search_results)
        
        # Build system prompt with context markup
        system_prompt = f"""
<role>
You are an intelligent assistant with access to a knowledge base. Use the provided context to answer questions accurately and comprehensively.
</role>

<instructions>
1. **Primary Sources**: Base your response primarily on the provided document chunks
2. **Citation**: Reference specific document chunks when making claims
3. **Confidence**: Indicate when information is uncertain or missing from context
4. **Completeness**: If context doesn't fully answer the question, state what's missing
5. **Accuracy**: Never make up information not present in the provided context
</instructions>

<context_guidelines>
- Each document chunk has an ID, source, and similarity score
- Higher similarity scores indicate more relevant content
- Consider the source and context when weighing information
- Multiple chunks may contain complementary or conflicting information
</context_guidelines>

{system_context if system_context else ""}

<knowledge_base_context>
{context}
</knowledge_base_context>
"""

        user_prompt = f"""
<user_query>
{user_query}
</user_query>

<response_format>
Please provide a comprehensive answer based on the knowledge base context. Include:
1. **Direct Answer**: Clear response to the user's question
2. **Supporting Evidence**: Reference relevant document chunks
3. **Source Attribution**: Mention sources when appropriate
4. **Confidence Level**: Indicate certainty of your response
5. **Additional Context**: Any relevant background information
</response_format>
"""

        # Generate response using your preferred LLM
        response = self.llm_client.chat.completions.create(
            model="gpt-4",  # or claude-3-sonnet-20240229
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.1
        )
        
        return {
            "response": response.choices[0].message.content,
            "context_used": search_results,
            "search_queries": search_queries,
            "total_chunks": len(search_results)
        }
```

## Prompt Templates for Different Use Cases

### 7. Specialized RAG Prompts
```python
class RAGPromptTemplates:
    
    @staticmethod
    def research_analysis_prompt(topic: str) -> Dict:
        """
        Template for research analysis queries
        """
        return {
            "search_queries": [
                f"research findings on {topic}",
                f"studies about {topic}",
                f"analysis of {topic}",
                f"data on {topic}",
                f"conclusions about {topic}"
            ],
            "system_context": f"""
<research_context>
You are conducting a research analysis on: {topic}

Focus on:
- Empirical findings and data
- Methodological approaches
- Key conclusions and insights
- Gaps in current knowledge
- Conflicting viewpoints or results
</research_context>
"""
        }
    
    @staticmethod
    def code_assistance_prompt(programming_language: str, task: str) -> Dict:
        """
        Template for programming assistance
        """
        return {
            "search_queries": [
                f"{programming_language} {task}",
                f"how to {task} in {programming_language}",
                f"{programming_language} best practices {task}",
                f"{task} implementation {programming_language}",
                f"examples {task} {programming_language}"
            ],
            "system_context": f"""
<coding_context>
Programming Language: {programming_language}
Task: {task}

Provide:
- Code examples with explanations
- Best practices and conventions
- Common pitfalls to avoid
- Alternative approaches
- Performance considerations
</coding_context>
"""
        }
    
    @staticmethod
    def comparative_analysis_prompt(entities: List[str]) -> Dict:
        """
        Template for comparing multiple entities
        """
        entity_str = " vs ".join(entities)
        return {
            "search_queries": [
                f"comparison {entity_str}",
                f"differences between {entity_str}",
                f"pros and cons {entity_str}",
                *[f"advantages of {entity}" for entity in entities],
                *[f"disadvantages of {entity}" for entity in entities]
            ],
            "system_context": f"""
<comparison_context>
Entities to Compare: {entities}

Structure your response as:
1. **Overview**: Brief description of each entity
2. **Key Differences**: Main distinguishing factors
3. **Advantages/Disadvantages**: Pros and cons of each
4. **Use Cases**: When to choose each option
5. **Conclusion**: Summary recommendation
</comparison_context>
"""
        }

    @staticmethod
    def troubleshooting_prompt(problem: str, context: str) -> Dict:
        """
        Template for technical troubleshooting
        """
        return {
            "search_queries": [
                f"solve {problem}",
                f"fix {problem}",
                f"troubleshoot {problem}",
                f"error {problem}",
                f"{problem} solution",
                f"debugging {problem}"
            ],
            "system_context": f"""
<troubleshooting_context>
Problem: {problem}
Context: {context}

Provide:
1. **Problem Diagnosis**: Identify likely causes
2. **Step-by-Step Solution**: Clear resolution steps
3. **Prevention**: How to avoid this issue
4. **Alternative Solutions**: Multiple approaches if available
5. **Verification**: How to confirm the fix worked
</troubleshooting_context>
"""
        }
```

## Usage Examples

### 8. Complete Implementation Example
```python
# Setup
collection = setup_knowledge_base()
# ingest_documents(collection, "./documents")  # Run once to populate

# Initialize RAG system
rag = RAGSystem(collection, openai_client)  # Your OpenAI client
templates = RAGPromptTemplates()

# Research query example
research_config = templates.research_analysis_prompt("machine learning interpretability")
response = rag.generate_response(
    user_query="What are the latest developments in machine learning interpretability?",
    search_queries=research_config["search_queries"],
    system_context=research_config["system_context"]
)

print("Response:", response["response"])
print(f"Used {response['total_chunks']} context chunks")

# Code assistance example
code_config = templates.code_assistance_prompt("Python", "async programming")
response = rag.generate_response(
    user_query="How do I implement async/await patterns in Python effectively?",
    search_queries=code_config["search_queries"],
    system_context=code_config["system_context"]
)

# Comparative analysis example
comparison_config = templates.comparative_analysis_prompt(["PostgreSQL", "MongoDB", "Redis"])
response = rag.generate_response(
    user_query="Which database should I choose for my web application?",
    search_queries=comparison_config["search_queries"],
    system_context=comparison_config["system_context"]
)
```

## Advanced Features

### 9. Query Expansion & Refinement
```python
def expand_query(original_query: str, llm_client) -> List[str]:
    """
    Use LLM to generate query variations for better retrieval
    """
    expansion_prompt = f"""
Generate 3-5 alternative phrasings of this query to improve semantic search:

Original Query: "{original_query}"

Requirements:
- Maintain the same intent
- Use different terminology/synonyms
- Include technical and conversational variations
- Return only the alternative queries, one per line
"""
    
    response = llm_client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": expansion_prompt}],
        temperature=0.3
    )
    
    expanded_queries = [original_query]  # Include original
    expanded_queries.extend(response.choices[0].message.content.strip().split('\n'))
    
    return expanded_queries

### 10. Context Window Management
def optimize_context_window(search_results: List[Dict], max_tokens: int = 4000) -> List[Dict]:
    """
    Optimize context selection for maximum relevance within token limits
    """
    encoding = tiktoken.get_encoding("cl100k_base")
    
    # Sort by similarity score
    sorted_results = sorted(search_results, key=lambda x: x['similarity'], reverse=True)
    
    selected_results = []
    total_tokens = 0
    
    for result in sorted_results:
        chunk_tokens = len(encoding.encode(result['content']))
        
        if total_tokens + chunk_tokens <= max_tokens:
            selected_results.append(result)
            total_tokens += chunk_tokens
        else:
            # Try to fit a truncated version
            remaining_tokens = max_tokens - total_tokens - 100  # Buffer
            if remaining_tokens > 200:  # Minimum viable chunk
                truncated_content = result['content'][:remaining_tokens*4]  # Rough estimate
                result['content'] = truncated_content + "... [truncated]"
                selected_results.append(result)
            break
    
    return selected_results
```

## Best Practices Summary

### Context Markup Guidelines
- Use XML-style tags for clear structure: `<role>`, `<instructions>`, `<context>`
- Include metadata with each document chunk: source, similarity, ID
- Separate system context from user queries clearly
- Use structured response formats for consistency

### RAG Optimization
- Implement smart chunking with semantic boundaries
- Use multiple query variations for better recall
- Filter results by similarity threshold and metadata
- Optimize context window usage with token counting
- Include confidence indicators in responses

### Semantic Search Enhancement
- Use domain-specific embedding models when available
- Implement query expansion for better coverage
- Add metadata filtering for targeted searches
- Monitor and log search performance metrics

This implementation provides a production-ready RAG system with Chroma, optimized for semantic search and context-aware response generation.
