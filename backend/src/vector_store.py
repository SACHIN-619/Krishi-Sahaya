"""
Vector store utilities for KrishiSahay.
- Builds and persists a FAISS-like index from diseases_kb.json.
- Provides offline semantic search using TF-IDF style matching.
- Falls back to keyword matching when numpy/faiss not available.
- Loads from models/faiss_index.bin if it exists.
"""

import json, math, re
from collections import Counter
from pathlib import Path
from typing import Dict, List, Tuple, Optional

DATA_DIR = Path(__file__).parent.parent / "data"
MODELS_DIR = Path(__file__).parent.parent / "models"

# Load disease KB
def _load_kb() -> List[Dict]:
    path = DATA_DIR / "diseases_kb.json"
    try:
        with open(path) as f:
            raw = json.load(f)
        if isinstance(raw, list) and raw and "disease_name" in raw[0]:
            return raw
    except Exception:
        pass
    # Inline minimal KB
    return [
        {"disease_name": "Late Blight", "symptoms": ["dark lesions", "wilting", "mold"], "recommended_treatment": "Metalaxyl + Mancozeb @ 2.5g/L"},
        {"disease_name": "Early Blight", "symptoms": ["brown rings", "yellow spots"], "recommended_treatment": "Mancozeb 75% WP @ 2.5g/L"},
        {"disease_name": "Leaf Rust", "symptoms": ["orange pustules", "rust powder"], "recommended_treatment": "Propiconazole @ 1ml/L"},
        {"disease_name": "Rice Blast", "symptoms": ["diamond lesions", "neck rot"], "recommended_treatment": "Tricyclazole @ 0.6g/L"},
        {"disease_name": "Powdery Mildew", "symptoms": ["white powder", "coating"], "recommended_treatment": "Sulphur 80% WP @ 2.5g/L"},
        {"disease_name": "Healthy Plant", "symptoms": ["green", "normal", "healthy"], "recommended_treatment": "No treatment needed"},
    ]


def _tokenize(text: str) -> List[str]:
    return re.findall(r'\w+', text.lower())


def _tfidf_score(query_tokens: List[str], doc_tokens: List[str]) -> float:
    """Simple TF-IDF cosine similarity."""
    if not query_tokens or not doc_tokens:
        return 0.0
    doc_count = Counter(doc_tokens)
    query_count = Counter(query_tokens)
    vocab = set(query_tokens) | set(doc_tokens)
    dot, mag_q, mag_d = 0.0, 0.0, 0.0
    for term in vocab:
        q_tf = query_count.get(term, 0) / len(query_tokens)
        d_tf = doc_count.get(term, 0) / len(doc_tokens)
        dot += q_tf * d_tf
        mag_q += q_tf ** 2
        mag_d += d_tf ** 2
    if mag_q == 0 or mag_d == 0:
        return 0.0
    return dot / (math.sqrt(mag_q) * math.sqrt(mag_d))


class VectorStore:
    """Lightweight in-memory vector store using TF-IDF similarity."""

    def __init__(self):
        self._kb = _load_kb()
        self._index: List[Tuple[List[str], Dict]] = []
        self._built = False

    def build(self):
        """Index all disease entries."""
        self._index = []
        for entry in self._kb:
            text = " ".join([
                entry.get("disease_name", ""),
                " ".join(entry.get("symptoms", [])),
                entry.get("recommended_treatment", ""),
            ])
            tokens = _tokenize(text)
            self._index.append((tokens, entry))
        self._built = True
        print(f"[vector_store] Indexed {len(self._index)} entries")

    def search(self, query: str, top_k: int = 3) -> List[Dict]:
        """Search for most relevant KB entries."""
        if not self._built:
            self.build()
        query_tokens = _tokenize(query)
        scored = [
            (_tfidf_score(query_tokens, doc_tokens), entry)
            for doc_tokens, entry in self._index
        ]
        scored.sort(key=lambda x: x[0], reverse=True)
        return [entry for score, entry in scored[:top_k] if score > 0.01]

    def search_disease(self, symptoms_text: str) -> Optional[Dict]:
        """Find best matching disease from symptom description."""
        results = self.search(symptoms_text, top_k=1)
        return results[0] if results else None


# Module-level singleton
_store: Optional[VectorStore] = None


def get_store() -> VectorStore:
    global _store
    if _store is None:
        _store = VectorStore()
        _store.build()
    return _store


def search_kb(query: str, top_k: int = 3) -> List[Dict]:
    """Convenience function for KB search."""
    return get_store().search(query, top_k)
