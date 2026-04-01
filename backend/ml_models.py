import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score, learning_curve
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, roc_curve, auc
)
from sklearn.preprocessing import label_binarize
import logging

logger = logging.getLogger(__name__)

CAREERS = ["Data Scientist", "Developer", "Manager", "Designer"]
INTERESTS = ["data", "coding", "management", "design"]
FEATURES = ["math_score", "programming_skill", "communication_skill", "logical_reasoning", "interest_encoded"]
FEATURE_DISPLAY = ["Math Score", "Programming Skill", "Communication Skill", "Logical Reasoning", "Interest"]

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

MODEL_CONFIGS = {
    "random_forest": {
        "name": "Random Forest",
        "description": "Ensemble of decision trees using bagging",
        "default_params": {"n_estimators": 100, "max_depth": 10, "random_state": 42}
    },
    "knn": {
        "name": "K-Nearest Neighbors",
        "description": "Classifies based on closest training examples",
        "default_params": {"n_neighbors": 5}
    },
    "svm": {
        "name": "Support Vector Machine",
        "description": "Finds optimal hyperplane for classification",
        "default_params": {"kernel": "rbf", "probability": True, "random_state": 42}
    },
    "gradient_boosting": {
        "name": "Gradient Boosting",
        "description": "Sequential ensemble using boosting technique",
        "default_params": {"n_estimators": 100, "max_depth": 5, "random_state": 42}
    },
    "mlp": {
        "name": "Neural Network (MLP)",
        "description": "Multi-layer perceptron with backpropagation",
        "default_params": {"hidden_layer_sizes": (64, 32), "max_iter": 500, "random_state": 42}
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
        else:
            math = np.clip(np.random.normal(50, 15), 20, 100)
            prog = np.clip(np.random.normal(55, 18), 20, 100)
            comm = np.clip(np.random.normal(75, 12), 20, 100)
            logic = np.clip(np.random.normal(60, 14), 20, 100)
            interest = np.random.choice(["design", "management"], p=[0.8, 0.2])
        data.append({
            "math_score": round(math), "programming_skill": round(prog),
            "communication_skill": round(comm), "logical_reasoning": round(logic),
            "interest": interest, "career": career
        })
    return pd.DataFrame(data)


class MultiModelPredictor:
    def __init__(self):
        self.models = {}
        self.metrics = {}
        self.label_encoder = LabelEncoder()
        self.interest_encoder = LabelEncoder()
        self.X_train = None
        self.X_test = None
        self.y_train = None
        self.y_test = None
        self.df = None
        self.is_trained = False

    def _create_model(self, model_key, params=None):
        cfg = MODEL_CONFIGS[model_key]
        p = params or cfg["default_params"]
        if model_key == "random_forest":
            return RandomForestClassifier(**p, n_jobs=-1)
        elif model_key == "knn":
            return KNeighborsClassifier(**p)
        elif model_key == "svm":
            return SVC(**p)
        elif model_key == "gradient_boosting":
            return GradientBoostingClassifier(**p)
        elif model_key == "mlp":
            return MLPClassifier(**p)

    def train_all(self):
        self.df = generate_dataset()
        self.df["interest_encoded"] = self.interest_encoder.fit_transform(self.df["interest"])
        X = self.df[FEATURES].values
        y = self.label_encoder.fit_transform(self.df["career"])
        self.X_train, self.X_test, self.y_train, self.y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        for key in MODEL_CONFIGS:
            model = self._create_model(key)
            model.fit(self.X_train, self.y_train)
            y_pred = model.predict(self.X_test)
            self.models[key] = model
            self.metrics[key] = {
                "accuracy": round(float(accuracy_score(self.y_test, y_pred)), 4),
                "precision": round(float(precision_score(self.y_test, y_pred, average="weighted")), 4),
                "recall": round(float(recall_score(self.y_test, y_pred, average="weighted")), 4),
                "f1_score": round(float(f1_score(self.y_test, y_pred, average="weighted")), 4),
            }
            logger.info(f"{MODEL_CONFIGS[key]['name']}: accuracy={self.metrics[key]['accuracy']}")

        self.is_trained = True
        return self.metrics

    def train_custom(self, model_key, params):
        model = self._create_model(model_key, params)
        model.fit(self.X_train, self.y_train)
        y_pred = model.predict(self.X_test)
        self.models[model_key] = model
        self.metrics[model_key] = {
            "accuracy": round(float(accuracy_score(self.y_test, y_pred)), 4),
            "precision": round(float(precision_score(self.y_test, y_pred, average="weighted")), 4),
            "recall": round(float(recall_score(self.y_test, y_pred, average="weighted")), 4),
            "f1_score": round(float(f1_score(self.y_test, y_pred, average="weighted")), 4),
        }
        return self.metrics[model_key]

    def predict(self, math_score, programming_skill, communication_skill, logical_reasoning, interest, model_key="random_forest"):
        interest_encoded = self.interest_encoder.transform([interest])[0]
        features = np.array([[math_score, programming_skill, communication_skill, logical_reasoning, interest_encoded]])
        model = self.models[model_key]

        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(features)[0]
        else:
            probabilities = np.zeros(len(CAREERS))
            pred = model.predict(features)[0]
            probabilities[pred] = 1.0

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
            "math_score": math_score, "programming_skill": programming_skill,
            "communication_skill": communication_skill, "logical_reasoning": logical_reasoning
        }
        skill_gaps = {s: max(0, target.get(s, 0) - user_skills.get(s, 0)) for s in target}

        # Feature importance (only for tree-based models)
        feature_importance = {}
        if hasattr(model, "feature_importances_"):
            feature_importance = dict(zip(FEATURE_DISPLAY, [round(float(x), 4) for x in model.feature_importances_]))

        return {
            "predicted_career": predicted_career, "confidence": confidence,
            "all_probabilities": career_probs, "feature_importance": feature_importance,
            "model_used": MODEL_CONFIGS[model_key]["name"],
            "recommendations": {
                "skills_to_improve": recommendations.get("skills_to_improve", []),
                "resources": recommendations.get("resources", []),
            },
            "skill_gaps": skill_gaps, "user_skills": user_skills, "target_skills": target,
        }

    def predict_all_models(self, math_score, programming_skill, communication_skill, logical_reasoning, interest):
        results = {}
        for key in self.models:
            results[key] = self.predict(math_score, programming_skill, communication_skill, logical_reasoning, interest, key)
        return results

    def get_model_comparison(self):
        comparison = []
        for key, cfg in MODEL_CONFIGS.items():
            m = self.metrics.get(key, {})
            comparison.append({
                "model_key": key, "name": cfg["name"], "description": cfg["description"],
                **m
            })
        return comparison

    def get_confusion_matrix(self, model_key="random_forest"):
        model = self.models[model_key]
        y_pred = model.predict(self.X_test)
        cm = confusion_matrix(self.y_test, y_pred)
        labels = self.label_encoder.classes_.tolist()
        return {"matrix": cm.tolist(), "labels": labels}

    def get_roc_curve_data(self, model_key="random_forest"):
        model = self.models[model_key]
        n_classes = len(CAREERS)
        y_test_bin = label_binarize(self.y_test, classes=list(range(n_classes)))

        if hasattr(model, "predict_proba"):
            y_score = model.predict_proba(self.X_test)
        else:
            return {"curves": [], "labels": self.label_encoder.classes_.tolist()}

        curves = []
        for i in range(n_classes):
            fpr, tpr, _ = roc_curve(y_test_bin[:, i], y_score[:, i])
            roc_auc = auc(fpr, tpr)
            curves.append({
                "class": self.label_encoder.classes_[i],
                "fpr": [round(float(x), 4) for x in fpr[::max(1, len(fpr)//50)]],
                "tpr": [round(float(x), 4) for x in tpr[::max(1, len(tpr)//50)]],
                "auc": round(float(roc_auc), 4)
            })
        return {"curves": curves, "labels": self.label_encoder.classes_.tolist()}

    def get_learning_curve_data(self, model_key="random_forest"):
        model = self._create_model(model_key)
        train_sizes = np.linspace(0.1, 1.0, 8)
        train_sizes_abs, train_scores, val_scores = learning_curve(
            model, self.X_train, self.y_train,
            train_sizes=train_sizes, cv=5, scoring="accuracy", n_jobs=-1
        )
        return {
            "train_sizes": [int(x) for x in train_sizes_abs],
            "train_mean": [round(float(x), 4) for x in train_scores.mean(axis=1)],
            "train_std": [round(float(x), 4) for x in train_scores.std(axis=1)],
            "val_mean": [round(float(x), 4) for x in val_scores.mean(axis=1)],
            "val_std": [round(float(x), 4) for x in val_scores.std(axis=1)],
        }

    def get_cross_validation(self, model_key="random_forest", cv=5):
        model = self._create_model(model_key)
        scores = cross_val_score(model, self.X_train, self.y_train, cv=cv, scoring="accuracy")
        return {
            "scores": [round(float(s), 4) for s in scores],
            "mean": round(float(scores.mean()), 4),
            "std": round(float(scores.std()), 4),
            "folds": cv,
        }

    def get_dataset_summary(self, page=1, page_size=50):
        if self.df is None:
            return {}
        total = len(self.df)
        start = (page - 1) * page_size
        end = min(start + page_size, total)
        subset = self.df.iloc[start:end]
        records = subset[["math_score", "programming_skill", "communication_skill", "logical_reasoning", "interest", "career"]].to_dict(orient="records")
        stats = {
            "total_samples": total,
            "career_distribution": self.df["career"].value_counts().to_dict(),
            "interest_distribution": self.df["interest"].value_counts().to_dict(),
            "feature_stats": {}
        }
        for col in ["math_score", "programming_skill", "communication_skill", "logical_reasoning"]:
            stats["feature_stats"][col] = {
                "mean": round(float(self.df[col].mean()), 1),
                "std": round(float(self.df[col].std()), 1),
                "min": int(self.df[col].min()),
                "max": int(self.df[col].max()),
            }
        return {"data": records, "stats": stats, "page": page, "page_size": page_size, "total": total}

    def get_feature_importance(self, model_key="random_forest"):
        model = self.models.get(model_key)
        if model and hasattr(model, "feature_importances_"):
            return dict(zip(FEATURE_DISPLAY, [round(float(x), 4) for x in model.feature_importances_]))
        return {}


predictor = MultiModelPredictor()
