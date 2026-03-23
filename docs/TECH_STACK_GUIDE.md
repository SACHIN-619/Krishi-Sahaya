# 🛠️ KrishiSahay Tech Stack Guide

## Frontend Stack (Current - Lovable)

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **React 18** | UI Framework | Component-based, large ecosystem, excellent for SPAs |
| **TypeScript** | Type Safety | Catches errors at compile time, better DX |
| **Vite** | Build Tool | Lightning fast HMR, optimized builds |
| **Tailwind CSS** | Styling | Utility-first, highly customizable, small bundle |
| **React Router v6** | Navigation | Client-side routing for SPA |
| **TanStack Query** | Data Fetching | Caching, background updates, optimistic updates |
| **Radix UI** | Accessible Components | Unstyled, accessible primitives |
| **Lucide React** | Icons | Consistent, customizable icon library |

### Alternative Frontend Options

| Alternative | Pros | Cons |
|-------------|------|------|
| **Next.js** | SSR/SSG, API routes built-in | Overkill for SPA, vendor lock-in |
| **Vue.js** | Simpler learning curve | Smaller ecosystem than React |
| **Angular** | Enterprise-ready, all-in-one | Heavy, steep learning curve |
| **Svelte** | Minimal bundle, no virtual DOM | Smaller community |

---

## Backend Stack (Planned - Python)

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **FastAPI** | API Framework | Async, automatic OpenAPI docs, type hints |
| **FAISS** | Vector Search | Offline-first, fast similarity search |
| **Sentence Transformers** | Embeddings | Multilingual support (Hindi, Telugu, Tamil) |
| **Pandas** | Data Processing | CSV/JSON handling for mandi prices |
| **IBM Watsonx** | LLM/Vision AI | Enterprise-grade, good multilingual support |
| **Twilio** | Notifications | WhatsApp Business API for alerts |

### Alternative Backend Options

| Alternative | Pros | Cons |
|-------------|------|------|
| **Node.js/Express** | Same language as frontend | Weaker ML ecosystem |
| **Django** | Batteries included | Heavier than FastAPI |
| **Go/Fiber** | Very fast, compiled | Harder to integrate ML models |
| **Supabase Edge Functions** | Serverless, built-in | Limited for heavy ML workloads |

---

## How Frontend & Backend Communicate

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ useWeatherData│  │ useMarketData│  │ useAdvisory (RAG)   │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                     │               │
│         └─────────────────┼─────────────────────┘               │
│                           │                                     │
│                    ┌──────▼──────┐                              │
│                    │  API Layer  │                              │
│                    │ fetch/axios │                              │
│                    └──────┬──────┘                              │
└───────────────────────────┼─────────────────────────────────────┘
                            │ HTTP/REST
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                      BACKEND (FastAPI)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ /api/weather │  │ /api/market  │  │ /api/advisory/query │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                     │               │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────────▼───────────┐  │
│  │ OpenWeather  │  │ CSV/Agmarknet│  │   FAISS + Watsonx    │  │
│  │    API       │  │    Data      │  │      RAG Agent       │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Endpoints (Current Demo → Real)

### Weather API
```typescript
// DEMO (current): src/hooks/useDataSources.tsx
const data = generateWeatherData(); // Mock generator

// REAL (target): 
fetch('http://localhost:8000/api/weather')
  .then(res => res.json())
  .then(data => setState({ data, isDemo: false }));
```

### Market Prices API
```typescript
// DEMO (current):
const data = generateMarketPrices(); // Mock generator

// REAL (target):
fetch('http://localhost:8000/api/market/prices')
  .then(res => res.json())
  .then(data => setState({ data: data.prices, isDemo: false }));
```

### Advisory RAG API
```typescript
// DEMO (current):
const response = getMockAIResponse(query, language);

// REAL (target):
fetch('http://localhost:8000/api/advisory/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, language })
})
  .then(res => res.json())
  .then(data => {
    // data.offlineAnswer - from FAISS
    // data.expertAdvice - from IBM Watsonx
  });
```

---

## Environment Variables

### Frontend (.env)
```env
# API Base URL (for production)
VITE_API_URL=http://localhost:8000

# Optional: Analytics, Feature Flags
VITE_ENABLE_ANALYTICS=false
```

### Backend (.env)
```env
# Weather
OPENWEATHER_API_KEY=your_key

# IBM Watsonx
IBM_API_KEY=your_key
IBM_PROJECT_ID=your_project

# WhatsApp Notifications
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token

# Demo Mode (fallback when APIs fail)
DEMO_MODE=false
```

---

## Data Flow Architecture

### Offline-First Design
```
1. User Query
       │
       ▼
2. Check Internet Connectivity
       │
       ├── ONLINE ──────────────────────────────────────┐
       │                                                 │
       ▼                                                 ▼
3. Try Real API                               4. Get Response
       │                                                 │
       ├── SUCCESS ──────────────────────────────────────┤
       │                                                 │
       ├── FAIL ─────────────────────────────────┐       │
       │                                         │       │
       ▼                                         ▼       │
5. Check Local Cache                    6. Use Local FAISS│
       │                                         │       │
       ├── HIT ──────────────────────────────────┤       │
       │                                         │       │
       ├── MISS ─────────────────────────────────┤       │
       │                                         │       │
       ▼                                         ▼       │
7. Use Mock Generator               8. Return with isDemo: true
       │                                         │       │
       └─────────────────────────────────────────┴───────┘
                                                 │
                                                 ▼
                                        9. Render UI
```

---

## Key Files for Data Replacement

| File | Purpose | Replace With |
|------|---------|--------------|
| `src/hooks/useDataSources.tsx` | All data hooks | Real API calls |
| `src/data/mockData.ts` | Demo generators | Keep as fallback |
| `src/components/panels/*Panel.tsx` | Chat mock responses | Real RAG responses |

---

## Quick Start Commands

### Frontend (Lovable)
```bash
# Development
npm run dev

# Build for production
npm run build
```

### Backend (Python - after generation)
```bash
# Install dependencies
pip install -r requirements.txt

# Build FAISS index
python -m src.vector_store build

# Run server
uvicorn app.main:app --reload --port 8000
```

---

## Testing the Integration

1. Start Python backend on port 8000
2. Set `VITE_API_URL=http://localhost:8000` in frontend
3. Restart frontend dev server
4. Open DevTools Network tab
5. Verify API calls go to backend, not mock generators
6. Check `isDemo: false` in responses

---

## Next Steps

1. **Generate Backend**: Use `docs/PYTHON_BACKEND_PROMPT.md` with Claude/ChatGPT
2. **Set Up Data**: Place CSVs in `data/` folder
3. **Build FAISS**: Run vector store builder script
4. **Connect APIs**: Update `src/hooks/useDataSources.tsx`
5. **Test E2E**: Verify all features work with real data
