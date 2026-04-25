from fastapi import FastAPI, APIRouter, Depends, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import uuid
from datetime import datetime, timezone

from ml_models import predictor, INTERESTS, CAREERS, MODEL_CONFIGS
from auth import hash_password, verify_password, create_token, get_current_user
from ai_insights import generate_career_insights

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get("MONGO_URL", "mongodb://127.0.0.1:27017")
client = AsyncIOMotorClient(mongo_url)
db = client["career_db"]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Pydantic Models
class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class PredictionRequest(BaseModel):
    math_score: int = Field(ge=0, le=100)
    programming_skill: int = Field(ge=0, le=100)
    communication_skill: int = Field(ge=0, le=100)
    logical_reasoning: int = Field(ge=0, le=100)
    interest: str
    model_key: str = "random_forest"

class CustomTrainRequest(BaseModel):
    model_key: str
    params: Dict[str, Any]

# Train all models on startup
@app.on_event("startup")
async def startup_event():
    logger.info("Training all ML models...")
    metrics = predictor.train_all()
    for key, m in metrics.items():
        logger.info(f"  {key}: accuracy={m['accuracy']}")
    logger.info("All models ready.")

# ── Auth ──
@api_router.post("/auth/register")
async def register(req: RegisterRequest):
    existing = await db.users.find_one({"email": req.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id, "name": req.name, "email": req.email,
        "password": hash_password(req.password),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_doc)
    token = create_token(user_id, req.email)
    return {"token": token, "user": {"id": user_id, "name": req.name, "email": req.email}}

@api_router.post("/auth/login")
async def login(req: LoginRequest):
    user = await db.users.find_one({"email": req.email}, {"_id": 0})
    if not user or not verify_password(req.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token(user["id"], user["email"])
    return {"token": token, "user": {"id": user["id"], "name": user["name"], "email": user["email"]}}

@api_router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["user_id"]}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ── ML Prediction ──
@api_router.post("/predict")
async def predict(req: PredictionRequest, current_user: dict = Depends(get_current_user)):
    if req.interest not in INTERESTS:
        raise HTTPException(status_code=400, detail=f"Interest must be one of: {INTERESTS}")
    if req.model_key not in MODEL_CONFIGS:
        raise HTTPException(status_code=400, detail=f"Model must be one of: {list(MODEL_CONFIGS.keys())}")
    result = predictor.predict(
        req.math_score, req.programming_skill, req.communication_skill,
        req.logical_reasoning, req.interest, req.model_key
    )
    return result

@api_router.post("/predict-all-models")
async def predict_all_models(req: PredictionRequest, current_user: dict = Depends(get_current_user)):
    if req.interest not in INTERESTS:
        raise HTTPException(status_code=400, detail=f"Interest must be one of: {INTERESTS}")
    results = predictor.predict_all_models(
        req.math_score, req.programming_skill, req.communication_skill,
        req.logical_reasoning, req.interest
    )
    return results

# ── Model Lab ──
@api_router.get("/models/compare")
async def model_comparison(current_user: dict = Depends(get_current_user)):
    return {"models": predictor.get_model_comparison()}

@api_router.get("/models/confusion-matrix")
async def confusion_matrix_endpoint(
    model_key: str = Query(default="random_forest"),
    current_user: dict = Depends(get_current_user)
):
    if model_key not in MODEL_CONFIGS:
        raise HTTPException(status_code=400, detail="Invalid model key")
    return predictor.get_confusion_matrix(model_key)

@api_router.get("/models/roc-curve")
async def roc_curve_endpoint(
    model_key: str = Query(default="random_forest"),
    current_user: dict = Depends(get_current_user)
):
    if model_key not in MODEL_CONFIGS:
        raise HTTPException(status_code=400, detail="Invalid model key")
    return predictor.get_roc_curve_data(model_key)

@api_router.get("/models/learning-curve")
async def learning_curve_endpoint(
    model_key: str = Query(default="random_forest"),
    current_user: dict = Depends(get_current_user)
):
    if model_key not in MODEL_CONFIGS:
        raise HTTPException(status_code=400, detail="Invalid model key")
    return predictor.get_learning_curve_data(model_key)

@api_router.get("/models/cross-validation")
async def cross_validation_endpoint(
    model_key: str = Query(default="random_forest"),
    cv: int = Query(default=5, ge=2, le=10),
    current_user: dict = Depends(get_current_user)
):
    if model_key not in MODEL_CONFIGS:
        raise HTTPException(status_code=400, detail="Invalid model key")
    return predictor.get_cross_validation(model_key, cv)

@api_router.post("/models/train-custom")
async def train_custom(req: CustomTrainRequest, current_user: dict = Depends(get_current_user)):
    if req.model_key not in MODEL_CONFIGS:
        raise HTTPException(status_code=400, detail="Invalid model key")
    try:
        metrics = predictor.train_custom(req.model_key, req.params)
        return {"model_key": req.model_key, "metrics": metrics}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/feature-importance")
async def get_feature_importance(
    model_key: str = Query(default="random_forest"),
    current_user: dict = Depends(get_current_user)
):
    importance = predictor.get_feature_importance(model_key)
    return {"feature_importance": importance, "model_key": model_key}

# ── Dataset ──
@api_router.get("/dataset")
async def get_dataset(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=10, le=200),
    current_user: dict = Depends(get_current_user)
):
    return predictor.get_dataset_summary(page, page_size)

# ── AI Insights ──
@api_router.post("/ai-insights")
async def get_ai_insights(req: PredictionRequest, current_user: dict = Depends(get_current_user)):
    if req.interest not in INTERESTS:
        raise HTTPException(status_code=400, detail=f"Interest must be one of: {INTERESTS}")
    prediction = predictor.predict(
        req.math_score, req.programming_skill, req.communication_skill,
        req.logical_reasoning, req.interest, req.model_key
    )
    insights = await generate_career_insights(prediction)
    return {**prediction, "ai_insights": insights}

# ── Prediction History ──
@api_router.post("/predictions/save")
async def save_prediction(req: PredictionRequest, current_user: dict = Depends(get_current_user)):
    result = predictor.predict(
        req.math_score, req.programming_skill, req.communication_skill,
        req.logical_reasoning, req.interest, req.model_key
    )
    history_doc = {
        "id": str(uuid.uuid4()),
        "user_id": current_user["user_id"],
        "input": {
            "math_score": req.math_score, "programming_skill": req.programming_skill,
            "communication_skill": req.communication_skill, "logical_reasoning": req.logical_reasoning,
            "interest": req.interest, "model_key": req.model_key
        },
        "result": result,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.prediction_history.insert_one(history_doc)
    return {"status": "saved", "id": history_doc["id"]}

@api_router.get("/predictions/history")
async def get_prediction_history(current_user: dict = Depends(get_current_user)):
    history = await db.prediction_history.find(
        {"user_id": current_user["user_id"]}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return {"history": history}

@api_router.delete("/predictions/history/{prediction_id}")
async def delete_prediction(prediction_id: str, current_user: dict = Depends(get_current_user)):
    result = await db.prediction_history.delete_one(
        {"id": prediction_id, "user_id": current_user["user_id"]}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return {"status": "deleted"}

@api_router.get("/careers")
async def get_careers():
    return {"careers": CAREERS, "interests": INTERESTS, "models": list(MODEL_CONFIGS.keys())}

@api_router.get("/career-comparison")
async def career_comparison(career_a: str, career_b: str, current_user: dict = Depends(get_current_user)):
    if career_a not in CAREERS or career_b not in CAREERS:
        raise HTTPException(status_code=400, detail=f"Careers must be from: {CAREERS}")
    return predictor.get_career_comparison(career_a, career_b)


# ─── SHAP Explainability ─────────────────────────────────────
class ShapRequest(BaseModel):
    math_score: float
    programming_skill: float
    communication_skill: float
    logical_reasoning: float
    interest: str
    model_key: str = "random_forest"

@api_router.post("/shap-explain")
async def shap_explain(req: ShapRequest, current_user: dict = Depends(get_current_user)):
    if not predictor.is_trained:
        raise HTTPException(status_code=503, detail="Models not trained yet")
    if req.interest not in INTERESTS:
        raise HTTPException(status_code=400, detail=f"Interest must be one of: {INTERESTS}")
    try:
        explanation = predictor.get_shap_explanation(
            req.math_score, req.programming_skill, req.communication_skill,
            req.logical_reasoning, req.interest, req.model_key
        )
        return {"explanation": explanation}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ─── What-If Simulator ────────────────────────────────────────
class WhatIfRequest(BaseModel):
    math_score: float
    programming_skill: float
    communication_skill: float
    logical_reasoning: float
    interest: str
    model_key: str = "random_forest"

@api_router.post("/what-if")
async def what_if(req: WhatIfRequest, current_user: dict = Depends(get_current_user)):
    if not predictor.is_trained:
        raise HTTPException(status_code=503, detail="Models not trained yet")
    if req.interest not in INTERESTS:
        raise HTTPException(status_code=400, detail=f"Interest must be one of: {INTERESTS}")
    profile = {
        "math_score": req.math_score, "programming_skill": req.programming_skill,
        "communication_skill": req.communication_skill, "logical_reasoning": req.logical_reasoning,
        "interest": req.interest,
    }
    return predictor.what_if_simulate(profile, req.model_key)


# ─── Resume Scanner ───────────────────────────────────────────
class ResumeRequest(BaseModel):
    resume_text: str
    predicted_career: str

@api_router.post("/resume-scan")
async def resume_scan(req: ResumeRequest, current_user: dict = Depends(get_current_user)):
    from ai_insights import get_groq_client
    client = get_groq_client()
    if not client:
        raise HTTPException(status_code=503, detail="AI service unavailable")

    prompt = f"""You are a career coach and resume expert. Analyze this resume for a person whose ML-predicted career is: {req.predicted_career}

RESUME:
{req.resume_text[:3000]}

Respond ONLY with valid JSON (no markdown, no explanation) in this exact format:
{{
  "match_score": <integer 0-100>,
  "strengths": ["strength1", "strength2", "strength3"],
  "missing_skills": ["skill1", "skill2", "skill3", "skill4"],
  "quick_wins": ["actionable tip 1", "actionable tip 2", "actionable tip 3"],
  "overall_verdict": "<2 sentence summary>"
}}"""

    try:
        response = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=600,
            temperature=0.3,
        )
        import json
        raw = response.choices[0].message.content.strip()
        data = json.loads(raw)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume scan failed: {str(e)}")

@api_router.get("/")
async def root():
    return {"message": "Career Path Predictor API", "status": "running"}

app.include_router(api_router)

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

