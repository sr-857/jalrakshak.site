"""
Test script to verify the flood risk model works correctly
Run this before starting the web app to ensure everything is set up
"""

import os
import sys
from flood_model import FloodRiskModel

def print_section(title):
    """Print a formatted section header"""
    print("\n" + "="*60)
    print(f"  {title}")
    print("="*60)

def test_model():
    print_section("FLOOD RISK MODEL - TEST SUITE")
    
    # Check if CSV exists
    csv_path = os.path.join(
        os.path.expanduser('~'),
        'Downloads',
        'rainfall_clean_districtwise_NE_India_Jan2026.csv'
    )
    
    print(f"\n📁 CSV File Path: {csv_path}")
    
    if not os.path.exists(csv_path):
        print(f"❌ ERROR: CSV file not found!")
        print(f"   Please ensure the file exists at the above path")
        return False
    
    print(f"✅ CSV file found!")
    
    try:
        # Initialize and train model
        print_section("INITIALIZING MODEL")
        model = FloodRiskModel(csv_path)
        
        print("\n📊 Training model (this may take 30 seconds)...")
        trained_model, accuracy = model.train()
        
        print(f"\n✅ Model training complete!")
        print(f"   Test Accuracy: {accuracy*100:.2f}%")
        
        # Save model
        print_section("SAVING MODEL")
        model.save_model('flood_model.pkl')
        print("✅ Model saved to flood_model.pkl")
        
        # Get available states and districts
        print_section("AVAILABLE DATA")
        states, districts = model.processor.get_all_districts()
        print(f"\n📍 States: {len(states)}")
        for state in states:
            count = len(districts[state])
            print(f"   • {state}: {count} districts")
            for dist in districts[state][:2]:  # Show first 2
                print(f"     - {dist}")
            if len(districts[state]) > 2:
                print(f"     ... and {len(districts[state]) - 2} more")
        
        # Test predictions
        print_section("TESTING PREDICTIONS")
        
        test_cases = [
            ("Assam", "Kamrup Metro (Guwahati)"),
            ("Assam", "Dibrugarh"),
            ("Meghalaya", "East Khasi Hills"),
        ]
        
        for state, district in test_cases:
            print(f"\n🔍 Testing: {state} - {district}")
            
            try:
                result = model.predict(state, district)
                
                if 'error' in result:
                    print(f"   ⚠️  {result['error']}")
                else:
                    print(f"   ✅ Risk Level: {result['risk_level']}")
                    print(f"      Confidence: {result['confidence']:.1f}%")
                    print(f"      Model Accuracy: {result['model_accuracy']:.1f}%")
                    print(f"      Actual Rainfall: {result['rainfall_data']['actual_rainfall_mm']:.1f} mm")
                    print(f"      Normal Rainfall: {result['rainfall_data']['normal_rainfall_mm']:.1f} mm")
                    print(f"      Departure: {result['rainfall_data']['departure_percent']:.1f}%")
                    
                    # Show probability distribution
                    print(f"      Probability Distribution:")
                    for risk, prob in result['all_probabilities'].items():
                        bar_length = int(prob / 5)
                        bar = "█" * bar_length + "░" * (20 - bar_length)
                        print(f"        {risk:7} {bar} {prob:5.1f}%")
            
            except Exception as e:
                print(f"   ❌ Error: {str(e)}")
        
        print_section("FULL RESULT EXAMPLE")
        
        result = model.predict("Assam", "Kamrup Metro (Guwahati)")
        
        print("\n📋 Full Prediction Result:")
        print(f"""
State: {result['state']}
District: {result['district']}
Risk Level: {result['risk_level']}
Confidence: {result['confidence']:.1f}%
Model Accuracy: {result['model_accuracy']:.1f}%

Rainfall Data:
  - Actual: {result['rainfall_data']['actual_rainfall_mm']:.1f} mm
  - Normal: {result['rainfall_data']['normal_rainfall_mm']:.1f} mm
  - Departure: {result['rainfall_data']['departure_percent']:.1f}%

Probability Distribution:
""")
        for risk, prob in result['all_probabilities'].items():
            print(f"  {risk}: {prob:.2f}%")
        
        print(f"\nFeature Importance (Top 3):")
        sorted_features = sorted(
            result['feature_importance'].items(),
            key=lambda x: x[1],
            reverse=True
        )[:3]
        for i, (feature, importance) in enumerate(sorted_features, 1):
            print(f"  {i}. {feature}: {importance:.2f}%")
        
        print(f"\nRecommendations:")
        for rec in result['recommendations']:
            print(f"  {rec}")
        
        print_section("TEST COMPLETE ✅")
        print("""
✨ Model is working correctly!

Next steps:
1. Run: python app.py
2. Open: http://localhost:5000
3. Select a state and district
4. View the detailed flood risk analysis

For more help, see README.md
""")
        return True
    
    except Exception as e:
        print_section("ERROR OCCURRED ❌")
        print(f"\n{type(e).__name__}: {str(e)}")
        print("\nPlease check:")
        print("  1. CSV file path and format")
        print("  2. All dependencies installed (pip install -r requirements.txt)")
        print("  3. Python version (3.8+)")
        return False

if __name__ == "__main__":
    success = test_model()
    sys.exit(0 if success else 1)
