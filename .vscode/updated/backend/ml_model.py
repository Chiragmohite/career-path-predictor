import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import logging

logger = logging.getLogger(__name__)

CAREERS = ["Data Scientist", "Developer", "Manager", "Designer"]
INTERESTS = ["data", "coding", "management", "design"]
FEATURES = ["math_score", "programming_skill", "communication_skill", "logical_reasoning", "interest_encoded"]

SKILL_RECOMMENDATIONS = {
    "Data Scientist": {
        "skills_to_improve": ["Statistics & Probability", "Machine Learning Algorithms", "Data Visualization", "SQL & Database Management"],
        "resources": ["Kaggle Competitions", "Andrew Ng ML Course", "Python for Data Science"],
        "target_profile": {"math_score": 90, "programming_skill": 80, "communication_skill": 60, "logical_reasoning": 85}
    },
    "Developer": {
        "skills_to_improve": ["System Design", "Data Structures & Algorithms", "Version Control (Git)", "Cloud Platforms (AWS/GCP)"],
        "resources": ["LeetCode Practice", "System Design Primer", "Open Source Contributions"],
        "target_profile": {"math_score": 70, "programming_skill": 95, "communication_skill": 55, "logical_reasoning": 80}
    },
    "Manager": {
        "skills_to_improve": ["Project Management (Agile/Scrum)", "Leadership & Team Building", "Strategic Planning", "Stakeholder Communication"],
        "resources": ["PMP Certification", "Harvard Business Review", "Toastmasters"],
        "target_profile": {"math_score": 55, "programming_skill": 50, "communication_skill": 95, "logical_reasoning": 70}
    },
    "Designer": {
        "skills_to_improve": ["UI/UX Principles", "Figma & Design Tools", "Color Theory & Typography", "User Research Methods"],
        "resources": ["Dribbble Daily Challenges", "Google UX Design Certificate", "Design Thinking Workshops"],
        "target_profile": {"math_score": 50, "programming_skill": 60, "communication_skill": 80, "logical_reasoning": 65}
    }
}


def generate_dataset(n_samples=2000):
    np.random.seed(42)
    data = []

    for _ in range(n_samples):
        career = np.random.choice(CAREERS)

        if career == "Data Scientist":
            math = np.clip(np.random.normal(82, 10), 20, 100)
            prog = np.clip(np.random.normal(75, 12), 20, 100)
            comm = np.clip(np.random.normal(55, 15), 20, 100)
            logic = np.clip(np.random.normal(80, 10), 20, 100)
            interest = np.random.choice(["data", "coding"], p=[0.8, 0.2])
        elif career == "Developer":
            math = np.clip(np.random.normal(68, 12), 20, 100)
            prog = np.clip(np.random.normal(88, 8), 20, 100)
            comm = np.clip(np.random.normal(50, 15), 20, 100)
            logic = np.clip(np.random.normal(75, 12), 20, 100)
            interest = np.random.choice(["coding", "data"], p=[0.85, 0.15])
        elif career == "Manager":
            math = np.clip(np.random.normal(55, 15), 20, 100)
            prog = np.clip(np.random.normal(45, 18), 20, 100)
            comm = np.clip(np.random.normal(88, 8), 20, 100)
            logic = np.clip(np.random.normal(65, 12), 20, 100)
            interest = np.random.choice(["management", "design"], p=[0.85, 0.15])
        else:  # Designer
            math = np.clip(np.random.normal(50, 15), 20, 100)
            prog = np.clip(np.random.normal(55, 18), 20, 100)
            comm = np.clip(np.random.normal(75, 12), 20, 100)
            logic = np.clip(np.random.normal(60, 14), 20, 100)
            interest = np.random.choice(["design", "management"], p=[0.8, 0.2])

        data.append({
            "math_score": round(math),
            "programming_skill": round(prog),
            "communication_skill": round(comm),
            "logical_reasoning": round(logic),
            "interest": interest,
            "career": career
        })

    return pd.DataFrame(data)


class CareerPredictor:
    def __init__(self):
        self.model = None
        self.label_encoder = LabelEncoder()
        self.interest_encoder = LabelEncoder()
        self.feature_importances = None
        self.is_trained = False

    def train(self):
        df = generate_dataset()
        df["interest_encoded"] = self.interest_encoder.fit_transform(df["interest"])
        X = df[FEATURES].values
        y = self.label_encoder.fit_transform(df["career"])

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1
        )
        self.model.fit(X_train, y_train)

        accuracy = self.model.score(X_test, y_test)
        logger.info(f"Model trained with accuracy: {accuracy:.4f}")

        self.feature_importances = dict(zip(
            ["Math Score", "Programming Skill", "Communication Skill", "Logical Reasoning", "Interest"],
            [round(float(x), 4) for x in self.model.feature_importances_]
        ))
        self.is_trained = True
        return accuracy

    def predict(self, math_score, programming_skill, communication_skill, logical_reasoning, interest):
        interest_encoded = self.interest_encoder.transform([interest])[0]
        features = np.array([[math_score, programming_skill, communication_skill, logical_reasoning, interest_encoded]])

        probabilities = self.model.predict_proba(features)[0]
        career_probs = {}
        for idx, prob in enumerate(probabilities):
            career_name = self.label_encoder.inverse_transform([idx])[0]
            career_probs[career_name] = round(float(prob) * 100, 1)

        predicted_idx = np.argmax(probabilities)
        predicted_career = self.label_encoder.inverse_transform([predicted_idx])[0]
        confidence = round(float(probabilities[predicted_idx]) * 100, 1)

        recommendations = SKILL_RECOMMENDATIONS.get(predicted_career, {})
        target = recommendations.get("target_profile", {})
        user_skills = {
            "math_score": math_score,
            "programming_skill": programming_skill,
            "communication_skill": communication_skill,
            "logical_reasoning": logical_reasoning
        }
        skill_gaps = {}
        for skill, target_val in target.items():
            gap = target_val - user_skills.get(skill, 0)
            skill_gaps[skill] = max(0, gap)

        return {
            "predicted_career": predicted_career,
            "confidence": confidence,
            "all_probabilities": career_probs,
            "feature_importance": self.feature_importances,
            "recommendations": {
                "skills_to_improve": recommendations.get("skills_to_improve", []),
                "resources": recommendations.get("resources", []),
            },
            "skill_gaps": skill_gaps,
            "user_skills": user_skills,
            "target_skills": target
        }

    def get_feature_importance(self):
        return self.feature_importances


# Singleton instance
predictor = CareerPredictor()
