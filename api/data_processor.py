import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import os

class DataProcessor:
    def __init__(self, csv_path):
        self.csv_path = csv_path
        self.data = None
        self.scaler = StandardScaler()
        
    def load_data(self):
        """Load and process the rainfall data"""
        self.data = pd.read_csv(self.csv_path)
        print(f"Loaded data shape: {self.data.shape}")
        print(f"Columns: {self.data.columns.tolist()}")
        return self.data
    
    def create_features(self, data=None):
        """Create features from rainfall data for model training"""
        if data is None:
            data = self.data.copy()
        
        features_data = data.copy()
        
        # Feature 1: Rainfall Ratio (Actual / Normal)
        features_data['rainfall_ratio'] = features_data['Actual Rainfall (mm)'] / (
            features_data['Normal Rainfall (mm)'] + 0.1)  # Avoid division by zero
        
        # Feature 2: Departure percentage (already available)
        features_data['departure_pct'] = features_data['Departure (%)']
        
        # Feature 3: Absolute rainfall amount
        features_data['actual_rainfall'] = features_data['Actual Rainfall (mm)']
        
        # Feature 4: Normal rainfall (climate baseline)
        features_data['normal_rainfall'] = features_data['Normal Rainfall (mm)']
        
        # Feature 5: Excess rainfall indicator (positive departure)
        features_data['excess_rainfall'] = features_data['Actual Rainfall (mm)'] - features_data['Normal Rainfall (mm)']
        
        return features_data
    
    def create_labels(self, data=None):
        """Create risk labels based on rainfall patterns"""
        if data is None:
            data = self.data.copy()
        
        risk_labels = []
        
        for idx, row in data.iterrows():
            actual = row['Actual Rainfall (mm)']
            normal = row['Normal Rainfall (mm)']
            departure = row['Departure (%)']
            
            # Classification logic for flood risk
            if actual > normal * 1.5:  # Very high rainfall
                risk_labels.append('HIGH')
            elif actual > normal * 1.0 or departure > -20:  # Moderate rainfall
                risk_labels.append('MEDIUM')
            else:  # Low rainfall
                risk_labels.append('LOW')
        
        return np.array(risk_labels)
    
    def get_feature_matrix(self, data=None):
        """Get feature matrix for model training"""
        if data is None:
            data = self.data.copy()
        
        features_data = self.create_features(data)
        
        # Select features for the model
        feature_columns = [
            'rainfall_ratio',
            'departure_pct',
            'actual_rainfall',
            'normal_rainfall',
            'excess_rainfall'
        ]
        
        X = features_data[feature_columns].values
        return X, features_data
    
    def get_all_districts(self):
        """Get list of all states and districts"""
        if self.data is None:
            self.load_data()
        
        states = self.data['State'].unique().tolist()
        
        district_by_state = {}
        for state in states:
            districts = self.data[self.data['State'] == state]['District'].unique().tolist()
            district_by_state[state] = districts
        
        return states, district_by_state
    
    def get_district_data(self, state, district):
        """Get specific district data"""
        if self.data is None:
            self.load_data()
        
        result = self.data[(self.data['State'] == state) & (self.data['District'] == district)]
        
        if result.empty:
            return None
        
        return result.iloc[0].to_dict()

if __name__ == "__main__":
    processor = DataProcessor("../Downloads/rainfall_clean_districtwise_NE_India_Jan2026.csv")
    processor.load_data()
    states, districts = processor.get_all_districts()
    print("\nStates:", states)
    print("\nDistricts by State:", districts)
