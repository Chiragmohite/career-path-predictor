import os
from dotenv import load_dotenv
from pathlib import Path
import logging
from groq import AsyncGroq

load_dotenv(Path(__file__).parent / '.env')
logger = logging.getLogger(__name__)

GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")

async def generate_career_insights(prediction_result):
    try:
        if not GROQ_API_KEY:
            return {"insights": None, "status": "error", "error": "No API key configured"}

        client = AsyncGroq(api_key=GROQ_API_KEY)

        career = prediction_result.get("predicted_career", "Unknown")
        confidence = prediction_result.get("confidence", 0)
        probs = prediction_result.get("all_probabilities", {})
        skills = prediction_result.get("user_skills", {})
        gaps = prediction_result.get("skill_gaps", {})
        model_name = prediction_result.get("model_used", "Random Forest")

        prompt = f"""Analyze this career prediction and provide personalized advice:

Predicted Career: {career} (Confidence: {confidence}%)
Model Used: {model_name}

Career Probabilities:
{chr(10).join(f'- {k}: {v}%' for k, v in sorted(probs.items(), key=lambda x: -x[1]))}

User Skill Scores (0-100):
- Math: {skills.get('math_score', 0)}
- Programming: {skills.get('programming_skill', 0)}
- Communication: {skills.get('communication_skill', 0)}
- Logical Reasoning: {skills.get('logical_reasoning', 0)}

Skill Gaps:
{chr(10).join(f'- {k}: +{v} needed' for k, v in gaps.items() if v > 0)}

Provide:
1. Why this career fits their profile
2. A 90-day action plan to bridge skill gaps
3. Alternative career paths to consider
4. One surprising insight from their data
Keep it under 300 words."""

        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are an expert career counselor. Be specific and concise (under 300 words)."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500
        )
        return {"insights": response.choices[0].message.content, "status": "success"}

    except Exception as e:
        logger.error(f"AI insights error: {e}")
        return {"insights": None, "status": "error", "error": str(e)}
