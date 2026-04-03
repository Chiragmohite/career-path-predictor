# 🎯 Career Path Predictor

An ML-powered web application that predicts career paths based on your skills and interests, with AI-generated personalized career advice.

🔗 **Live Demo**: [career-path-frontend-dguj.onrender.com](https://career-path-frontend-dguj.onrender.com)

---

## ✨ Features

- 🤖 **5 ML Models** — Random Forest, KNN, SVM, Gradient Boosting, Neural Network (MLP)
- 📊 **Model Lab** — Confusion Matrix, ROC Curves, Learning Curves, Cross-Validation
- 🧠 **AI Career Advisor** — Personalized career advice powered by Groq (LLaMA 3.3 70B)
- 📈 **Skill Gap Analysis** — Visual radar charts showing your skill gaps vs target profile
- 📋 **Prediction History** — Save and track your predictions over time
- 🗂️ **Dataset Explorer** — Browse the training dataset with pagination
- 🔐 **JWT Authentication** — Secure login and registration
- 🎨 **Animated UI** — Real-time career graph with data packet animations

---

## 🛠️ Tech Stack

**Frontend**
- React.js + Tailwind CSS
- Recharts (data visualization)
- Shadcn/UI components
- Axios

**Backend**
- FastAPI (Python)
- Scikit-learn (ML models)
- MongoDB (via Motor async driver)
- JWT authentication
- Groq API (LLaMA 3.3 70B)

**Deployment**
- Frontend → Render (Static Site)
- Backend → Render (Web Service)
- Database → Railway (MongoDB)

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB

### 1. Clone the repository
```bash
git clone https://github.com/Chiragmohite/career-path-predictor.git
cd career-path-predictor
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:
```env
MONGO_URL=mongodb://localhost:27017
JWT_SECRET=your-secret-key
CORS_ORIGINS=http://localhost:3000
GROQ_API_KEY=your-groq-api-key
```

Start the backend:
```bash
uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
REACT_APP_BACKEND_URL=http://localhost:8000
```

Start the frontend:
```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🤖 ML Models

| Model | Description |
|-------|-------------|
| Random Forest | Ensemble of decision trees |
| K-Nearest Neighbors | Distance-based classifier |
| Support Vector Machine | Hyperplane-based classifier |
| Gradient Boosting | Boosted ensemble method |
| Neural Network (MLP) | Multi-layer perceptron |

---

## 📁 Project Structure

```
career-path-predictor/
├── backend/
│   ├── server.py          # FastAPI routes
│   ├── auth.py            # JWT authentication
│   ├── ml_models.py       # ML model training & prediction
│   ├── ai_insights.py     # Groq AI career advice
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/         # LoginPage, Dashboard, ModelLab, Dataset, History
│   │   ├── components/    # Charts, forms, UI components
│   │   └── App.js         # Main app with auth context
│   └── package.json
└── README.md
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/predict` | Run career prediction |
| GET | `/api/models/compare` | Compare all models |
| GET | `/api/models/roc-curve` | Get ROC curve data |
| POST | `/api/ai-insights` | Get AI career advice |
| GET | `/api/predictions/history` | Get prediction history |

---

## 📸 Screenshots

### Login Page
![Login](https://via.placeholder.com/800x400/030305/00E5FF?text=Career+Path+Predictor)

---

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `MONGO_URL` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `CORS_ORIGINS` | Allowed frontend origins |
| `GROQ_API_KEY` | Groq API key for AI advice |
| `REACT_APP_BACKEND_URL` | Backend API URL |

---

## 📄 License

MIT License — feel free to use this project for learning and personal use.

---

## 👨‍💻 Author

**Chirag Mohite**  
[GitHub](https://github.com/Chiragmohite)

---

⭐ If you found this useful, please give it a star! Here are your Instructions
