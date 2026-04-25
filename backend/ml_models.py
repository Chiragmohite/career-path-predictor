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

CAREERS = [
    "Data Scientist", "Developer", "Manager", "Designer",
    "DevOps Engineer", "ML Engineer", "Cybersecurity Analyst",
    "Product Manager", "UX Designer", "Business Analyst",
    "Cloud Architect", "Game Developer"
]

INTERESTS = [
    "data", "coding", "management", "design",
    "infrastructure", "ai_ml", "security", "product"
]

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
    },
    "DevOps Engineer": {
        "skills_to_improve": ["CI/CD Pipelines", "Docker & Kubernetes", "Infrastructure as Code (Terraform)", "Linux Administration"],
        "resources": ["Linux Foundation Courses", "Docker Mastery (Udemy)", "Terraform Documentation"],
        "target_profile": {"math_score": 65, "programming_skill": 85, "communication_skill": 60, "logical_reasoning": 80}
    },
    "ML Engineer": {
        "skills_to_improve": ["Deep Learning (PyTorch/TensorFlow)", "MLOps & Model Deployment", "Feature Engineering", "Distributed Computing"],
        "resources": ["fast.ai Courses", "MLflow Documentation", "Papers With Code"],
        "target_profile": {"math_score": 88, "programming_skill": 90, "communication_skill": 55, "logical_reasoning": 88}
    },
    "Cybersecurity Analyst": {
        "skills_to_improve": ["Network Security", "Penetration Testing", "SIEM Tools", "Threat Intelligence"],
        "resources": ["TryHackMe", "CompTIA Security+", "OWASP Top 10"],
        "target_profile": {"math_score": 70, "programming_skill": 75, "communication_skill": 65, "logical_reasoning": 85}
    },
    "Product Manager": {
        "skills_to_improve": ["Product Roadmapping", "A/B Testing & Analytics", "Stakeholder Management", "User Story Writing"],
        "resources": ["Lenny's Newsletter", "ProductPlan Blog", "Reforge Programs"],
        "target_profile": {"math_score": 65, "programming_skill": 55, "communication_skill": 90, "logical_reasoning": 80}
    },
    "UX Designer": {
        "skills_to_improve": ["User Research & Interviews", "Wireframing & Prototyping", "Accessibility (WCAG)", "Usability Testing"],
        "resources": ["Nielsen Norman Group", "Figma Academy", "UX Collective"],
        "target_profile": {"math_score": 45, "programming_skill": 55, "communication_skill": 85, "logical_reasoning": 70}
    },
    "Business Analyst": {
        "skills_to_improve": ["Requirements Gathering", "SQL & Excel", "Business Process Modeling", "Data Visualization"],
        "resources": ["CBAP Certification", "Tableau Public", "BABOK Guide"],
        "target_profile": {"math_score": 72, "programming_skill": 55, "communication_skill": 85, "logical_reasoning": 78}
    },
    "Cloud Architect": {
        "skills_to_improve": ["AWS/Azure/GCP Architecture", "Microservices Design", "Cost Optimization", "Security & Compliance"],
        "resources": ["AWS Solutions Architect Cert", "Google Cloud Skills Boost", "Azure Architecture Center"],
        "target_profile": {"math_score": 75, "programming_skill": 88, "communication_skill": 70, "logical_reasoning": 85}
    },
    "Game Developer": {
        "skills_to_improve": ["Game Engine (Unity/Unreal)", "3D Math & Physics", "Shader Programming", "Game Design Patterns"],
        "resources": ["Unity Learn Platform", "Game Programming Patterns Book", "Brackeys YouTube"],
        "target_profile": {"math_score": 80, "programming_skill": 88, "communication_skill": 50, "logical_reasoning": 82}
    }
}

CAREER_ROADMAPS = {
    "Data Scientist": [
        {"phase": "Foundation (0-3 months)", "tasks": ["Learn Python & pandas", "Master statistics fundamentals", "Complete SQL basics"], "milestone": "First data analysis project"},
        {"phase": "Intermediate (4-6 months)", "tasks": ["Build ML models with scikit-learn", "Practice on Kaggle", "Learn data visualization"], "milestone": "Kaggle Bronze medal"},
        {"phase": "Advanced (7-12 months)", "tasks": ["Deep learning with PyTorch", "Build end-to-end ML pipeline", "Contribute to open source"], "milestone": "Junior DS role application"}
    ],
    "Developer": [
        {"phase": "Foundation (0-3 months)", "tasks": ["Master core language (Python/JS)", "Learn Git & version control", "Build 3 small projects"], "milestone": "First GitHub portfolio"},
        {"phase": "Intermediate (4-6 months)", "tasks": ["Learn a framework (React/Django)", "Practice DSA on LeetCode", "Contribute to open source"], "milestone": "50 LeetCode problems solved"},
        {"phase": "Advanced (7-12 months)", "tasks": ["System design study", "Build full-stack app", "Prepare for technical interviews"], "milestone": "First developer job offer"}
    ],
    "ML Engineer": [
        {"phase": "Foundation (0-3 months)", "tasks": ["Strong Python + math fundamentals", "Learn core ML algorithms", "Docker basics"], "milestone": "First trained model deployed locally"},
        {"phase": "Intermediate (4-6 months)", "tasks": ["Deep learning with PyTorch/TF", "MLflow for experiment tracking", "REST API for model serving"], "milestone": "Model served as API"},
        {"phase": "Advanced (7-12 months)", "tasks": ["Kubernetes for ML workloads", "Feature store setup", "A/B testing models in production"], "milestone": "Production ML system built"}
    ],
    "DevOps Engineer": [
        {"phase": "Foundation (0-3 months)", "tasks": ["Linux mastery", "Git & CI/CD basics (GitHub Actions)", "Docker fundamentals"], "milestone": "First automated pipeline"},
        {"phase": "Intermediate (4-6 months)", "tasks": ["Kubernetes orchestration", "Terraform IaC", "Monitoring with Prometheus/Grafana"], "milestone": "K8s cluster deployed"},
        {"phase": "Advanced (7-12 months)", "tasks": ["Multi-cloud strategy", "Security hardening", "SRE practices"], "milestone": "AWS/GCP certification"}
    ],
    "Product Manager": [
        {"phase": "Foundation (0-3 months)", "tasks": ["Learn product frameworks (Jobs-to-be-Done)", "Study competitor products", "Shadow engineering & design teams"], "milestone": "First PRD written"},
        {"phase": "Intermediate (4-6 months)", "tasks": ["Run user interviews", "A/B test a feature", "Define KPIs & metrics"], "milestone": "Feature shipped to production"},
        {"phase": "Advanced (7-12 months)", "tasks": ["Own product roadmap", "Stakeholder presentations", "Data-driven prioritization"], "milestone": "PM role at target company"}
    ],
    "Cybersecurity Analyst": [
        {"phase": "Foundation (0-3 months)", "tasks": ["CompTIA Security+ study", "TryHackMe beginner paths", "Networking fundamentals"], "milestone": "Security+ certification"},
        {"phase": "Intermediate (4-6 months)", "tasks": ["Penetration testing basics", "SIEM tools (Splunk)", "CTF competitions"], "milestone": "First CTF flag captured"},
        {"phase": "Advanced (7-12 months)", "tasks": ["Bug bounty programs", "Incident response drills", "OSCP preparation"], "milestone": "Bug bounty first payout"}
    ],
    "UX Designer": [
        {"phase": "Foundation (0-3 months)", "tasks": ["Learn Figma", "Study design principles", "Redesign 3 existing apps"], "milestone": "First design portfolio piece"},
        {"phase": "Intermediate (4-6 months)", "tasks": ["Conduct user interviews", "Build interactive prototypes", "Accessibility audits"], "milestone": "Complete case study published"},
        {"phase": "Advanced (7-12 months)", "tasks": ["Design system creation", "Usability testing", "Collaborate with devs on handoff"], "milestone": "UX role at product company"}
    ],
    "Business Analyst": [
        {"phase": "Foundation (0-3 months)", "tasks": ["Excel & SQL mastery", "Learn BPMN notation", "Study Agile basics"], "milestone": "First business process mapped"},
        {"phase": "Intermediate (4-6 months)", "tasks": ["Requirements elicitation practice", "Tableau/Power BI dashboards", "Stakeholder workshops"], "milestone": "Dashboard built for real data"},
        {"phase": "Advanced (7-12 months)", "tasks": ["CBAP certification study", "End-to-end project BA role", "Presentation to C-suite"], "milestone": "BA certification earned"}
    ],
    "Cloud Architect": [
        {"phase": "Foundation (0-3 months)", "tasks": ["AWS/Azure/GCP fundamentals", "Core networking concepts", "IAM & security basics"], "milestone": "Cloud practitioner cert"},
        {"phase": "Intermediate (4-6 months)", "tasks": ["Solutions architect cert", "Design multi-tier architectures", "Cost optimization projects"], "milestone": "Solutions architect certification"},
        {"phase": "Advanced (7-12 months)", "tasks": ["Multi-cloud strategies", "Microservices architecture", "Enterprise migration planning"], "milestone": "Lead first cloud migration"}
    ],
    "Game Developer": [
        {"phase": "Foundation (0-3 months)", "tasks": ["Pick Unity or Unreal", "Complete beginner tutorials", "Build a Pong/Snake clone"], "milestone": "First playable game"},
        {"phase": "Intermediate (4-6 months)", "tasks": ["3D math & physics", "Shader basics", "Game jam participation"], "milestone": "Game jam submission"},
        {"phase": "Advanced (7-12 months)", "tasks": ["Multiplayer networking", "Asset optimization", "Publish on itch.io"], "milestone": "First published game"}
    ],
    "Manager": [
        {"phase": "Foundation (0-3 months)", "tasks": ["Agile/Scrum fundamentals", "1-on-1 meeting skills", "Conflict resolution basics"], "milestone": "Lead first sprint"},
        {"phase": "Intermediate (4-6 months)", "tasks": ["PMP certification study", "OKR goal setting", "Performance review training"], "milestone": "PMP certification"},
        {"phase": "Advanced (7-12 months)", "tasks": ["Cross-functional leadership", "Budget management", "Hiring & onboarding"], "milestone": "Manage team of 5+"}
    ],
    "Designer": [
        {"phase": "Foundation (0-3 months)", "tasks": ["Adobe Creative Suite basics", "Color theory & typography", "Build first portfolio"], "milestone": "5-piece portfolio"},
        {"phase": "Intermediate (4-6 months)", "tasks": ["Brand identity projects", "Motion design basics", "Client freelance work"], "milestone": "First paid design project"},
        {"phase": "Advanced (7-12 months)", "tasks": ["Design system creation", "Art direction", "Agency or in-house application"], "milestone": "Full-time designer role"}
    ]
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

CAREER_PROFILES = {
    "Data Scientist":        (82, 10, 75, 12, 55, 15, 80, 10, {"data": 0.75, "ai_ml": 0.20, "coding": 0.05}),
    "Developer":             (68, 12, 88,  8, 50, 15, 75, 12, {"coding": 0.80, "data": 0.10, "infrastructure": 0.10}),
    "Manager":               (55, 15, 45, 18, 88,  8, 65, 12, {"management": 0.80, "product": 0.20}),
    "Designer":              (50, 15, 55, 18, 75, 12, 60, 14, {"design": 0.75, "management": 0.15, "product": 0.10}),
    "DevOps Engineer":       (65, 12, 85, 10, 60, 14, 80, 10, {"infrastructure": 0.75, "coding": 0.15, "security": 0.10}),
    "ML Engineer":           (88,  8, 90,  8, 52, 14, 88,  8, {"ai_ml": 0.70, "coding": 0.20, "data": 0.10}),
    "Cybersecurity Analyst": (70, 12, 75, 12, 65, 14, 85,  9, {"security": 0.80, "infrastructure": 0.15, "coding": 0.05}),
    "Product Manager":       (65, 12, 55, 15, 90,  8, 80, 10, {"product": 0.75, "management": 0.20, "data": 0.05}),
    "UX Designer":           (45, 14, 55, 16, 85, 10, 70, 12, {"design": 0.80, "product": 0.15, "management": 0.05}),
    "Business Analyst":      (72, 12, 55, 15, 85,  9, 78, 10, {"data": 0.50, "management": 0.30, "product": 0.20}),
    "Cloud Architect":       (75, 10, 88,  9, 70, 12, 85,  9, {"infrastructure": 0.70, "coding": 0.20, "security": 0.10}),
    "Game Developer":        (80, 10, 88,  9, 50, 15, 82, 10, {"coding": 0.60, "design": 0.30, "ai_ml": 0.10}),
}


def generate_dataset(n_samples=5000):
    np.random.seed(42)
    data = []
    careers_list = list(CAREER_PROFILES.keys())
    for _ in range(n_samples):
        career = np.random.choice(careers_list)
        mm, ms, pm, ps, cm, cs, lm, ls, int_w = CAREER_PROFILES[career]
        math  = np.clip(np.random.normal(mm, ms), 10, 100)
        prog  = np.clip(np.random.normal(pm, ps), 10, 100)
        comm  = np.clip(np.random.normal(cm, cs), 10, 100)
        logic = np.clip(np.random.normal(lm, ls), 10, 100)
        interest = np.random.choice(list(int_w.keys()), p=list(int_w.values()))
        data.append({
            "math_score": round(math),
            "programming_skill": round(prog),
            "communication_skill": round(comm),
            "logical_reasoning": round(logic),
            "interest": interest,
            "career": career
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
        self.interest_encoder.fit(INTERESTS)
        self.df["interest_encoded"] = self.interest_encoder.transform(self.df["interest"])
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
                "accuracy":  round(float(accuracy_score(self.y_test, y_pred)), 4),
                "precision": round(float(precision_score(self.y_test, y_pred, average="weighted")), 4),
                "recall":    round(float(recall_score(self.y_test, y_pred, average="weighted")), 4),
                "f1_score":  round(float(f1_score(self.y_test, y_pred, average="weighted")), 4),
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
            "accuracy":  round(float(accuracy_score(self.y_test, y_pred)), 4),
            "precision": round(float(precision_score(self.y_test, y_pred, average="weighted")), 4),
            "recall":    round(float(recall_score(self.y_test, y_pred, average="weighted")), 4),
            "f1_score":  round(float(f1_score(self.y_test, y_pred, average="weighted")), 4),
        }
        return self.metrics[model_key]

    def predict(self, math_score, programming_skill, communication_skill, logical_reasoning, interest, model_key="random_forest"):
        interest_encoded = self.interest_encoder.transform([interest])[0]
        features = np.array([[math_score, programming_skill, communication_skill, logical_reasoning, interest_encoded]])
        model = self.models[model_key]

        if hasattr(model, "predict_proba"):
            probabilities = model.predict_proba(features)[0]
        else:
            probabilities = np.zeros(len(self.label_encoder.classes_))
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

        feature_importance = {}
        if hasattr(model, "feature_importances_"):
            feature_importance = dict(zip(FEATURE_DISPLAY, [round(float(x), 4) for x in model.feature_importances_]))

        roadmap = CAREER_ROADMAPS.get(predicted_career, [])

        return {
            "predicted_career": predicted_career, "confidence": confidence,
            "all_probabilities": career_probs, "feature_importance": feature_importance,
            "model_used": MODEL_CONFIGS[model_key]["name"],
            "recommendations": {
                "skills_to_improve": recommendations.get("skills_to_improve", []),
                "resources": recommendations.get("resources", []),
            },
            "skill_gaps": skill_gaps, "user_skills": user_skills, "target_skills": target,
            "roadmap": roadmap,
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
        n_classes = len(self.label_encoder.classes_)
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
            "train_mean":  [round(float(x), 4) for x in train_scores.mean(axis=1)],
            "train_std":   [round(float(x), 4) for x in train_scores.std(axis=1)],
            "val_mean":    [round(float(x), 4) for x in val_scores.mean(axis=1)],
            "val_std":     [round(float(x), 4) for x in val_scores.std(axis=1)],
        }

    def get_cross_validation(self, model_key="random_forest", cv=5):
        model = self._create_model(model_key)
        scores = cross_val_score(model, self.X_train, self.y_train, cv=cv, scoring="accuracy")
        return {
            "scores": [round(float(s), 4) for s in scores],
            "mean": round(float(scores.mean()), 4),
            "std":  round(float(scores.std()), 4),
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
                "std":  round(float(self.df[col].std()), 1),
                "min":  int(self.df[col].min()),
                "max":  int(self.df[col].max()),
            }
        return {"data": records, "stats": stats, "page": page, "page_size": page_size, "total": total}

    def get_feature_importance(self, model_key="random_forest"):
        model = self.models.get(model_key)
        if model and hasattr(model, "feature_importances_"):
            return dict(zip(FEATURE_DISPLAY, [round(float(x), 4) for x in model.feature_importances_]))
        return {}

    def get_career_comparison(self, career_a, career_b):
        rec_a = SKILL_RECOMMENDATIONS.get(career_a, {})
        rec_b = SKILL_RECOMMENDATIONS.get(career_b, {})
        return {
            "career_a": {"name": career_a, "target_profile": rec_a.get("target_profile", {}), "skills": rec_a.get("skills_to_improve", [])},
            "career_b": {"name": career_b, "target_profile": rec_b.get("target_profile", {}), "skills": rec_b.get("skills_to_improve", [])},
        }


predictor = MultiModelPredictor()


# ─── SHAP Explainability ─────────────────────────────────────
def get_shap_explanation(self, math_score, programming_skill, communication_skill, logical_reasoning, interest, model_key="random_forest"):
    import shap
    interest_encoded = self.interest_encoder.transform([interest])[0]
    features = np.array([[math_score, programming_skill, communication_skill, logical_reasoning, interest_encoded]], dtype=float)
    model = self.models[model_key]
    predicted_idx = int(model.predict(features)[0])

    try:
        if model_key in ("random_forest", "gradient_boosting"):
            explainer = shap.TreeExplainer(model)
            shap_values = explainer.shap_values(features)
            # Handle both (n_classes, n_samples, n_features) and (n_samples, n_features, n_classes)
            if isinstance(shap_values, list):
                sv = np.array(shap_values[predicted_idx][0])
            elif hasattr(shap_values, 'ndim') and shap_values.ndim == 3:
                sv = shap_values[0, :, predicted_idx]
            else:
                sv = np.array(shap_values[0])
        else:
            # Use LinearExplainer fallback for MLP/SVM - faster than KernelExplainer
            bg = self.X_train[:200]
            explainer = shap.KernelExplainer(model.predict_proba, bg)
            shap_values = explainer.shap_values(features, nsamples=100)
            if isinstance(shap_values, list):
                sv = np.array(shap_values[predicted_idx][0])
            else:
                sv = np.array(shap_values[0])
    except Exception as e:
        # Fallback: use feature importances if available, else zeros
        logger.warning(f"SHAP failed: {e}, using fallback")
        if hasattr(model, "feature_importances_"):
            sv = model.feature_importances_
        else:
            sv = np.zeros(len(FEATURE_DISPLAY))

    result = []
    for fname, sval in zip(FEATURE_DISPLAY, sv):
        result.append({
            "feature": fname,
            "shap_value": round(float(sval), 4),
            "direction": "positive" if sval >= 0 else "negative",
            "magnitude": round(abs(float(sval)), 4),
        })
    result.sort(key=lambda x: x["magnitude"], reverse=True)
    return result


# ─── What-If simulation ──────────────────────────────────────
def what_if_simulate(self, base_profile: dict, model_key="random_forest"):
    """For each skill, simulate +10 and -10 and see if career changes."""
    skill_keys = ["math_score", "programming_skill", "communication_skill", "logical_reasoning"]
    base_pred = self.predict(**base_profile, model_key=model_key)
    base_career = base_pred["predicted_career"]
    base_conf = base_pred["confidence"]
    results = []

    for sk in skill_keys:
        for delta in [+10, -10]:
            modified = dict(base_profile)
            modified[sk] = max(0, min(100, modified[sk] + delta))
            pred = self.predict(**modified, model_key=model_key)
            results.append({
                "skill": sk,
                "delta": delta,
                "new_value": modified[sk],
                "new_career": pred["predicted_career"],
                "new_confidence": pred["confidence"],
                "career_changed": pred["predicted_career"] != base_career,
                "confidence_change": round(pred["confidence"] - base_conf, 1),
            })
    return {"base_career": base_career, "base_confidence": base_conf, "simulations": results}


MultiModelPredictor.get_shap_explanation = get_shap_explanation
MultiModelPredictor.what_if_simulate = what_if_simulate
