# Personalized Career Path Predictor - PRD

## Problem Statement
Build a full-stack ML project "Personalized Career Path Predictor" with multiple ML models, advanced visualizations, AI-powered insights, and a futuristic UI.

## Architecture
- **Backend**: FastAPI + scikit-learn (5 ML models) + MongoDB + Groq (AI insights)
- **Frontend**: React + Recharts + Shadcn/UI + Tailwind CSS
- **Database**: MongoDB (users, prediction history)
- **Auth**: JWT-based (register/login)

## User Personas
- Students exploring career paths
- Professionals evaluating career transitions
- ML enthusiasts studying model comparison

## Core Requirements
- 5 ML models: Random Forest, KNN, SVM, Gradient Boosting, MLP Neural Network
- Model comparison dashboard with accuracy, precision, recall, F1
- Confusion matrix, ROC curves, learning curves, cross-validation
- Dataset explorer with 2000 synthetic samples
- Custom model training with hyperparameter tuning
- AI-powered career insights via Groq
- Prediction history saved to MongoDB

## What's Been Implemented (March 27, 2026)
- [x] Full authentication system (JWT register/login)
- [x] 5 ML models trained on synthetic dataset (RF:88.25%, GB:86.25%, MLP:83.5%, SVM:79.25%, KNN:77.75%)
- [x] Prediction form with skill sliders + interest/model selectors
- [x] Prediction results with confidence scores, probability bars
- [x] Skill gap radar chart + feature importance bar chart
- [x] Skill recommendations panel
- [x] Model Lab: comparison table, confusion matrix, ROC curves, learning curves, cross-validation
- [x] Custom training with hyperparameter sliders
- [x] Dataset explorer with stats, distributions, paginated table
- [x] Prediction history (save/view/delete)
- [x] AI-powered career insights via Groq
- [x] Futuristic neon dark UI theme

## Prioritized Backlog
### P0 (Done)
- All core ML features implemented
- All 5 pages functional

### P1 (Next)
- PDF report generation
- Decision boundary visualization
- Model export/download

### P2 (Future)
- Real-time model performance monitoring
- User-uploaded datasets for custom training
- Multi-user team features
- Email notifications for career advice

## Next Tasks
1. PDF report generation with charts
2. Decision boundary visualization
3. More diverse dataset options
4. Deploy to production
