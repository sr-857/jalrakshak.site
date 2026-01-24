import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib
from data_processor import DataProcessor

class FloodRiskModel:
    def __init__(self, csv_path):
        self.processor = DataProcessor(csv_path)
        self.model = None
        self.model_accuracy = None
        self.feature_columns = [
            'rainfall_ratio',
            'departure_pct',
            'actual_rainfall',
            'normal_rainfall',
            'excess_rainfall'
        ]
        self.label_to_risk = {
            'LOW': 0,
            'MEDIUM': 1,
            'HIGH': 2
        }
        self.risk_to_label = {v: k for k, v in self.label_to_risk.items()}
        
    def train(self):
        """Train the flood risk classification model"""
        print("Loading data...")
        self.processor.load_data()
        
        print("Creating features...")
        X, features_data = self.processor.get_feature_matrix()
        
        print("Creating labels...")
        y = self.processor.create_labels(self.processor.data)
        
        # Convert labels to numeric
        y_numeric = np.array([self.label_to_risk[label] for label in y])
        
        print(f"\nDataset shape: {X.shape}")
        print(f"Risk distribution:")
        unique, counts = np.unique(y_numeric, return_counts=True)
        for u, c in zip(unique, counts):
            print(f"  {self.risk_to_label[u]}: {c}")
        
        # Train-test split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y_numeric, test_size=0.2, random_state=42, stratify=y_numeric
        )
        
        # Train Random Forest model (more robust for small datasets)
        print("\nTraining Random Forest model...")
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=2,
            min_samples_leaf=1,
            random_state=42,
            n_jobs=-1
        )
        
        self.model.fit(X_train, y_train)
        
        # Evaluate model
        print("\nModel Evaluation:")
        
        y_pred_train = self.model.predict(X_train)
        train_accuracy = accuracy_score(y_train, y_pred_train)
        print(f"Training Accuracy: {train_accuracy:.4f}")
        
        y_pred_test = self.model.predict(X_test)
        test_accuracy = accuracy_score(y_test, y_pred_test)
        print(f"Testing Accuracy: {test_accuracy:.4f}")
        
        # Cross-validation
        cv_scores = cross_val_score(self.model, X, y_numeric, cv=5)
        print(f"Cross-validation Score: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
        
        # Detailed metrics
        print("\nDetailed Test Metrics:")
        for risk_level in range(3):
            risk_name = self.risk_to_label[risk_level]
            mask = y_test == risk_level
            if mask.sum() > 0:
                precision = precision_score(y_test, y_pred_test, labels=[risk_level], average=None, zero_division=0)
                recall = recall_score(y_test, y_pred_test, labels=[risk_level], average=None, zero_division=0)
                print(f"  {risk_name}: Precision={precision[0]:.4f}, Recall={recall[0]:.4f}")
        
        self.model_accuracy = test_accuracy
        return self.model, test_accuracy
    
    def predict(self, state, district):
        """Predict flood risk for a specific state and district"""
        if self.model is None:
            raise ValueError("Model not trained yet. Call train() first.")
        
        # Get district data
        district_data = self.processor.get_district_data(state, district)
        
        if district_data is None:
            return {
                'error': f'District {district} not found in {state}',
                'state': state,
                'district': district
            }
        
        # Create features for this district
        features_dict = {
            'Actual Rainfall (mm)': [district_data['Actual Rainfall (mm)']],
            'Normal Rainfall (mm)': [district_data['Normal Rainfall (mm)']],
            'Departure (%)': [district_data['Departure (%)']],
        }
        
        temp_df = pd.DataFrame(features_dict)
        
        # Calculate features
        rainfall_ratio = temp_df['Actual Rainfall (mm)'][0] / (temp_df['Normal Rainfall (mm)'][0] + 0.1)
        departure_pct = temp_df['Departure (%)'][0]
        actual_rainfall = temp_df['Actual Rainfall (mm)'][0]
        normal_rainfall = temp_df['Normal Rainfall (mm)'][0]
        excess_rainfall = actual_rainfall - normal_rainfall
        
        X = np.array([[
            rainfall_ratio,
            departure_pct,
            actual_rainfall,
            normal_rainfall,
            excess_rainfall
        ]])
        
        # Make prediction
        risk_numeric = self.model.predict(X)[0]
        risk_label = self.risk_to_label[risk_numeric]
        
        # Get prediction probabilities
        probabilities = self.model.predict_proba(X)[0]
        prob_dict = {
            self.risk_to_label[i]: float(probabilities[i]) * 100 
            for i in range(len(probabilities))
        }
        
        # Get feature importance (top 3)
        importances = self.model.feature_importances_
        feature_importance_dict = {
            self.feature_columns[i]: float(importances[i]) * 100
            for i in range(len(self.feature_columns))
        }
        
        return {
            'state': state,
            'district': district,
            'risk_level': risk_label,
            'confidence': prob_dict[risk_label],
            'all_probabilities': prob_dict,
            'rainfall_data': {
                'actual_rainfall_mm': float(district_data['Actual Rainfall (mm)']),
                'normal_rainfall_mm': float(district_data['Normal Rainfall (mm)']),
                'departure_percent': float(district_data['Departure (%)'])
            },
            'feature_importance': feature_importance_dict,
            'model_accuracy': float(self.model_accuracy) * 100
        }
    
    def save_model(self, model_path='flood_model.pkl'):
        """Save trained model to file"""
        joblib.dump(self.model, model_path)
        print(f"Model saved to {model_path}")
    
    def load_model(self, model_path='flood_model.pkl'):
        """Load trained model from file"""
        self.model = joblib.load(model_path)
        print(f"Model loaded from {model_path}")

if __name__ == "__main__":
    model = FloodRiskModel("../Downloads/rainfall_clean_districtwise_NE_India_Jan2026.csv")
    model.train()
    model.save_model()
