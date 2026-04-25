#!/usr/bin/env python3
"""
ML Career Path Predictor - Backend API Testing Suite
Tests all 5 ML models, authentication, predictions, model lab features, dataset, and AI insights
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any

class CareerPredictorAPITester:
    def __init__(self, base_url="https://career-predictor-6.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        self.failed_tests = []
        
        # Test data
        self.test_user = {
            "name": "Test Agent",
            "email": "test@career.ai", 
            "password": "test123"
        }
        
        self.test_prediction = {
            "math_score": 85,
            "programming_skill": 75,
            "communication_skill": 60,
            "logical_reasoning": 80,
            "interest": "data",
            "model_key": "random_forest"
        }
        
        self.ml_models = ["random_forest", "knn", "svm", "gradient_boosting", "mlp"]

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} | {name}")
        if details:
            print(f"     └─ {details}")
        
        if success:
            self.tests_passed += 1
        else:
            self.failed_tests.append({"test": name, "details": details})

    def make_request(self, method: str, endpoint: str, data: Dict = None, params: Dict = None) -> tuple:
        """Make HTTP request with proper headers"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                return False, {"error": f"Unsupported method: {method}"}
            
            return response.status_code, response.json() if response.content else {}
        except requests.exceptions.Timeout:
            return 408, {"error": "Request timeout"}
        except requests.exceptions.RequestException as e:
            return 500, {"error": str(e)}
        except json.JSONDecodeError:
            return response.status_code, {"error": "Invalid JSON response"}

    def test_health_check(self):
        """Test basic API health"""
        status, data = self.make_request('GET', '')
        success = status == 200 and "Career Path Predictor API" in str(data)
        self.log_test("API Health Check", success, f"Status: {status}")
        return success

    def test_auth_register(self):
        """Test user registration"""
        status, data = self.make_request('POST', 'auth/register', self.test_user)
        success = status == 200 and 'token' in data and 'user' in data
        if success:
            self.token = data['token']
            self.user_id = data['user']['id']
        self.log_test("User Registration", success, f"Status: {status}")
        return success

    def test_auth_login(self):
        """Test user login"""
        login_data = {"email": self.test_user["email"], "password": self.test_user["password"]}
        status, data = self.make_request('POST', 'auth/login', login_data)
        success = status == 200 and 'token' in data
        if success:
            self.token = data['token']
        self.log_test("User Login", success, f"Status: {status}")
        return success

    def test_auth_me(self):
        """Test get current user"""
        status, data = self.make_request('GET', 'auth/me')
        success = status == 200 and 'email' in data
        self.log_test("Get Current User", success, f"Status: {status}")
        return success

    def test_careers_endpoint(self):
        """Test careers/interests/models endpoint"""
        status, data = self.make_request('GET', 'careers')
        success = (status == 200 and 
                  'careers' in data and 
                  'interests' in data and 
                  'models' in data and
                  len(data['models']) == 5)
        details = f"Status: {status}, Models: {len(data.get('models', []))}"
        self.log_test("Careers/Models Endpoint", success, details)
        return success

    def test_single_prediction(self, model_key: str):
        """Test prediction with specific model"""
        test_data = {**self.test_prediction, "model_key": model_key}
        status, data = self.make_request('POST', 'predict', test_data)
        success = (status == 200 and 
                  'predicted_career' in data and 
                  'confidence' in data and
                  'all_probabilities' in data and
                  'model_used' in data)
        details = f"Status: {status}, Model: {model_key}"
        if success:
            details += f", Career: {data.get('predicted_career')}, Confidence: {data.get('confidence')}%"
        self.log_test(f"Prediction - {model_key}", success, details)
        return success

    def test_all_models_prediction(self):
        """Test prediction with all models"""
        status, data = self.make_request('POST', 'predict-all-models', self.test_prediction)
        success = (status == 200 and 
                  all(model in data for model in self.ml_models))
        details = f"Status: {status}, Models returned: {len(data) if isinstance(data, dict) else 0}"
        self.log_test("All Models Prediction", success, details)
        return success

    def test_model_comparison(self):
        """Test model comparison endpoint"""
        status, data = self.make_request('GET', 'models/compare')
        success = (status == 200 and 
                  'models' in data and 
                  len(data['models']) == 5)
        details = f"Status: {status}, Models: {len(data.get('models', []))}"
        if success:
            # Check if all models have required metrics
            models = data['models']
            has_metrics = all('accuracy' in m and 'precision' in m for m in models)
            success = success and has_metrics
            details += f", Has metrics: {has_metrics}"
        self.log_test("Model Comparison", success, details)
        return success

    def test_confusion_matrix(self, model_key: str = "random_forest"):
        """Test confusion matrix endpoint"""
        status, data = self.make_request('GET', 'models/confusion-matrix', params={'model_key': model_key})
        success = (status == 200 and 
                  'matrix' in data and 
                  'labels' in data)
        details = f"Status: {status}, Model: {model_key}"
        self.log_test(f"Confusion Matrix - {model_key}", success, details)
        return success

    def test_roc_curve(self, model_key: str = "random_forest"):
        """Test ROC curve endpoint"""
        status, data = self.make_request('GET', 'models/roc-curve', params={'model_key': model_key})
        success = (status == 200 and 
                  'curves' in data and 
                  'labels' in data)
        details = f"Status: {status}, Model: {model_key}"
        self.log_test(f"ROC Curve - {model_key}", success, details)
        return success

    def test_learning_curve(self, model_key: str = "random_forest"):
        """Test learning curve endpoint"""
        status, data = self.make_request('GET', 'models/learning-curve', params={'model_key': model_key})
        success = (status == 200 and 
                  'train_sizes' in data and 
                  'train_mean' in data and
                  'val_mean' in data)
        details = f"Status: {status}, Model: {model_key}"
        self.log_test(f"Learning Curve - {model_key}", success, details)
        return success

    def test_cross_validation(self, model_key: str = "random_forest"):
        """Test cross-validation endpoint"""
        status, data = self.make_request('GET', 'models/cross-validation', params={'model_key': model_key, 'cv': 5})
        success = (status == 200 and 
                  'scores' in data and 
                  'mean' in data and
                  'std' in data and
                  'folds' in data)
        details = f"Status: {status}, Model: {model_key}, Mean: {data.get('mean', 'N/A')}"
        self.log_test(f"Cross Validation - {model_key}", success, details)
        return success

    def test_custom_training(self):
        """Test custom model training"""
        custom_params = {"n_estimators": 50, "max_depth": 8, "random_state": 42}
        train_data = {"model_key": "random_forest", "params": custom_params}
        status, data = self.make_request('POST', 'models/train-custom', train_data)
        success = (status == 200 and 
                  'model_key' in data and 
                  'metrics' in data)
        details = f"Status: {status}"
        if success:
            metrics = data.get('metrics', {})
            details += f", Accuracy: {metrics.get('accuracy', 'N/A')}"
        self.log_test("Custom Model Training", success, details)
        return success

    def test_feature_importance(self, model_key: str = "random_forest"):
        """Test feature importance endpoint"""
        status, data = self.make_request('GET', 'feature-importance', params={'model_key': model_key})
        success = (status == 200 and 
                  'feature_importance' in data and 
                  'model_key' in data)
        details = f"Status: {status}, Model: {model_key}"
        self.log_test(f"Feature Importance - {model_key}", success, details)
        return success

    def test_dataset_endpoint(self):
        """Test dataset endpoint"""
        status, data = self.make_request('GET', 'dataset', params={'page': 1, 'page_size': 50})
        success = (status == 200 and 
                  'data' in data and 
                  'stats' in data and
                  'total' in data)
        details = f"Status: {status}, Records: {len(data.get('data', []))}, Total: {data.get('total', 0)}"
        self.log_test("Dataset Endpoint", success, details)
        return success

    def test_ai_insights(self):
        """Test AI insights endpoint"""
        status, data = self.make_request('POST', 'ai-insights', self.test_prediction)
        success = (status == 200 and 
                  'ai_insights' in data and
                  'predicted_career' in data)
        details = f"Status: {status}"
        if success:
            insights = data.get('ai_insights', {})
            details += f", AI Status: {insights.get('status', 'unknown')}"
        self.log_test("AI Insights", success, details)
        return success

    def test_prediction_history_save(self):
        """Test saving prediction to history"""
        status, data = self.make_request('POST', 'predictions/save', self.test_prediction)
        success = (status == 200 and 
                  'status' in data and 
                  'id' in data)
        details = f"Status: {status}"
        if success:
            self.saved_prediction_id = data['id']
        self.log_test("Save Prediction History", success, details)
        return success

    def test_prediction_history_get(self):
        """Test getting prediction history"""
        status, data = self.make_request('GET', 'predictions/history')
        success = (status == 200 and 
                  'history' in data)
        details = f"Status: {status}, History count: {len(data.get('history', []))}"
        self.log_test("Get Prediction History", success, details)
        return success

    def test_prediction_history_delete(self):
        """Test deleting prediction from history"""
        if not hasattr(self, 'saved_prediction_id'):
            self.log_test("Delete Prediction History", False, "No saved prediction ID")
            return False
        
        status, data = self.make_request('DELETE', f'predictions/history/{self.saved_prediction_id}')
        success = (status == 200 and 
                  data.get('status') == 'deleted')
        details = f"Status: {status}"
        self.log_test("Delete Prediction History", success, details)
        return success

    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚀 Starting ML Career Path Predictor API Tests")
        print("=" * 60)
        
        # Basic health and auth tests
        if not self.test_health_check():
            print("❌ API health check failed - stopping tests")
            return False
            
        if not self.test_auth_register():
            # Try login if register fails (user might exist)
            if not self.test_auth_login():
                print("❌ Authentication failed - stopping tests")
                return False
        
        self.test_auth_me()
        self.test_careers_endpoint()
        
        # ML Model tests
        print("\n🤖 Testing ML Models...")
        for model in self.ml_models:
            self.test_single_prediction(model)
        
        self.test_all_models_prediction()
        
        # Model Lab tests
        print("\n🔬 Testing Model Lab Features...")
        self.test_model_comparison()
        
        # Test model analysis features for key models
        key_models = ["random_forest", "gradient_boosting", "mlp"]
        for model in key_models:
            self.test_confusion_matrix(model)
            self.test_roc_curve(model)
            self.test_learning_curve(model)
            self.test_cross_validation(model)
            self.test_feature_importance(model)
        
        self.test_custom_training()
        
        # Dataset and insights tests
        print("\n📊 Testing Dataset & AI Features...")
        self.test_dataset_endpoint()
        self.test_ai_insights()
        
        # History tests
        print("\n📝 Testing Prediction History...")
        self.test_prediction_history_save()
        self.test_prediction_history_get()
        self.test_prediction_history_delete()
        
        # Final results
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.failed_tests:
            print("\n❌ Failed Tests:")
            for test in self.failed_tests:
                print(f"   • {test['test']}: {test['details']}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"\n🎯 Success Rate: {success_rate:.1f}%")
        
        return success_rate >= 80

def main():
    """Main test execution"""
    tester = CareerPredictorAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())