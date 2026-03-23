# 🐍 Python Backend Generation Prompt

Use this prompt with any AI to generate a complete Python backend for KrishiSahay:

---

## PROMPT FOR PYTHON BACKEND

```
Create a FastAPI Python backend for KrishiSahay agricultural intelligence platform with the following specifications:

## PROJECT STRUCTURE
krishisahay-backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry
│   ├── config.py               # Environment config
│   ├── models/
│   │   ├── schemas.py          # Pydantic models
│   │   └── database.py         # DB models if needed
│   ├── routers/
│   │   ├── weather.py          # Weather API endpoints
│   │   ├── market.py           # Market prices endpoints
│   │   ├── soil.py             # Soil data endpoints
│   │   ├── schemes.py          # Government schemes endpoints
│   │   ├── diagnosis.py        # Disease detection endpoints
│   │   ├── advisory.py         # RAG/AI advisory endpoints
│   │   └── health.py           # System health endpoints
│   ├── services/
│   │   ├── weather_service.py  # Weather API integration
│   │   ├── market_service.py   # Agmarknet scraper/API
│   │   ├── vector_store.py     # FAISS vector database
│   │   ├── rag_agent.py        # RAG router logic
│   │   ├── vision_engine.py    # Image disease detection
│   │   └── notifier.py         # WhatsApp notifications
│   └── utils/
│       ├── csv_loader.py       # CSV file loaders
│       └── mock_data.py        # Demo mode generators
├── data/
│   ├── mandi_prices_3yr.csv    # Historical price data
│   ├── diseases_kb.json        # Disease treatment database
│   ├── schemes_kb.json         # Government schemes
│   └── knowledge_base.jsonl    # FAISS source data
├── models/
│   ├── faiss_index.bin         # Vector index
│   └── meta.pkl                # Index metadata
├── .env.example
├── requirements.txt
└── Dockerfile

## API ENDPOINTS REQUIRED

### Weather API
GET /api/weather
- Returns: { temperature, humidity, rainProbability, condition, location, lastUpdated }
- Source: OpenWeatherMap API or IMD API
- Fallback: Mock data if API unavailable

### Market Prices API  
GET /api/market/prices
- Returns: Array of { commodity, currentPrice, avgPrice, deltaPercent, signal, market, lastUpdated }
- Source: Load from mandi_prices_3yr.csv, calculate 3-year averages
- Logic: Compare current vs avg, generate BUY/SELL/HOLD signals
- Signal rules:
  - SELL if deltaPercent > +15%
  - BUY if deltaPercent < -10%
  - HOLD otherwise

GET /api/market/marquee
- Returns: Array of { commodity, price, change, market }
- For live ticker display

### Soil Data API
GET /api/soil
- Returns: { nitrogen, phosphorus, potassium, ph, moisture, lastUpdated }
- Source: Mock IoT sensor data or CSV

### System Health API
GET /api/health
- Returns: { databaseReady, vectorStoreReady, apiStatus, lastSync, recordCount }
- Check FAISS index, DB connections, API availability

### Government Schemes API
GET /api/schemes
- Returns: Array of schemes from schemes_kb.json
- Schema: { id, name, description, eligibility, benefit, deadline?, applyUrl, category }

### Advisory/RAG API
POST /api/advisory/query
- Body: { query: string, language: "en"|"hi"|"te"|"ta" }
- Returns: { offlineAnswer, expertAdvice?, source, confidence, relatedTopics }
- Logic:
  1. Search FAISS vector store for grounded answer
  2. If query about prices → call market_service
  3. If query about schemes → search schemes_kb
  4. Optionally call IBM Watsonx for expert advice
  5. Always respond in user's language

### Disease Diagnosis API
POST /api/diagnosis/analyze
- Body: multipart/form-data with image file
- Returns: { disease, confidence, severity, treatment, prevention }
- Logic:
  1. Use vision model (IBM Watsonx Granite Vision or local model)
  2. Identify disease
  3. Lookup treatment in diseases_kb.json
  4. Return VERIFIED treatment only - no hallucinations

## FAISS VECTOR STORE SETUP
- Embedding model: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Must understand Hindi, Telugu, Tamil, Hinglish queries
- Build from knowledge_base.jsonl containing:
  - KCC (Kisan Call Center) Q&A data
  - Crop cultivation guides
  - Pest management protocols
  - Government scheme details

## ENVIRONMENT VARIABLES (.env)
```env
# Weather
OPENWEATHER_API_KEY=your_key
IMD_API_KEY=optional

# IBM Watsonx
IBM_API_KEY=your_key
IBM_PROJECT_ID=your_project
IBM_URL=https://us-south.ml.cloud.ibm.com

# Twilio (WhatsApp)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Database (optional)
DATABASE_URL=sqlite:///./data/krishisahay.db

# Demo Mode
DEMO_MODE=false
```

## REQUIREMENTS.TXT
```
fastapi>=0.104.0
uvicorn>=0.24.0
python-dotenv>=1.0.0
pydantic>=2.5.0
pandas>=2.1.0
numpy>=1.25.0
sentence-transformers>=2.2.0
faiss-cpu>=1.7.4
httpx>=0.25.0
python-multipart>=0.0.6
Pillow>=10.0.0
twilio>=8.10.0
ibm-watsonx-ai>=0.2.0
```

## CORS CONFIGURATION
Enable CORS for frontend:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://your-frontend.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## OFFLINE-FIRST REQUIREMENT (CRITICAL)
The backend MUST work even if:
- Internet is unavailable
- IBM API key is missing
- External APIs fail

Fallback chain:
1. Try live API
2. Fall back to local CSV/JSON
3. Fall back to mock generators
4. NEVER return empty or error to frontend

## DEMO MODE
When DEMO_MODE=true or APIs unavailable:
- Generate realistic mock data
- Tag response with isDemo: true
- UI remains fully functional

## NOTIFICATION LOGIC
Trigger WhatsApp alert when:
- Live price > 1.15 × 3-year average (15%+ profit opportunity)
- Send in user's language
- Include commodity, price, and action recommendation
```

---

## HOW TO USE THIS PROMPT

1. Copy the prompt above
2. Paste into Claude, ChatGPT, or any AI
3. Ask it to generate the complete backend
4. Create the project structure
5. Install dependencies: `pip install -r requirements.txt`
6. Set up your `.env` file
7. Run: `uvicorn app.main:app --reload`

## CONNECTING TO FRONTEND

After your backend is running, update the frontend hooks in `src/hooks/useDataSources.tsx`:

```typescript
// Example: Replace mock with real API
export const useWeatherData = () => {
  const [state, setState] = useState<DataState<WeatherData>>({
    data: null,
    loading: true,
    error: null,
    isDemo: false, // Will be set by API response
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/weather');
        const data = await response.json();
        setState({
          data: data,
          loading: false,
          error: null,
          isDemo: data.isDemo || false,
        });
      } catch (err) {
        // Fallback to demo mode
        setState({
          data: generateWeatherData(), // from mockData.ts
          loading: false,
          error: null,
          isDemo: true,
        });
      }
    };
    fetchData();
  }, []);
  
  return state;
};
```

## DATA FILE FORMATS

### mandi_prices_3yr.csv
```csv
date,commodity,market,price,state
2024-01-15,Wheat,Azadpur Mandi,2450,Delhi
2024-01-15,Rice,Guntur Market,3200,Andhra Pradesh
...
```

### diseases_kb.json
```json
{
  "diseases": [
    {
      "id": "late-blight",
      "name": "Late Blight",
      "symptoms": ["Brown spots on leaves", "White fuzzy growth"],
      "affectedCrops": ["Tomato", "Potato"],
      "treatment": "Apply Metalaxyl + Mancozeb @ 2.5g/L",
      "prevention": "Use resistant varieties, proper spacing",
      "severity": "high"
    }
  ]
}
```

### schemes_kb.json
```json
{
  "schemes": [
    {
      "id": "pm-kisan",
      "name": "PM-KISAN",
      "description": "Direct income support of ₹6,000 per year",
      "eligibility": "All landholding farmer families",
      "benefit": "₹6,000/year in 3 installments",
      "deadline": "2024-03-31",
      "applyUrl": "https://pmkisan.gov.in",
      "category": "Income Support"
    }
  ]
}
```
