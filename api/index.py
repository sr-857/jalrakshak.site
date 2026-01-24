from flask import Flask, request, jsonify
import os
import sys
import flood_model
from flood_model import FloodRiskModel

# Initialize Flask app
app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False

# Global model instance
flood_model = None
states_list = []
districts_by_state = {}

def initialize_model():
    """Initialize the flood risk model"""
    global flood_model, states_list, districts_by_state
    
    # Path inside Vercel environment
    csv_path = os.path.join(os.getcwd(), 'data', 'flood_data.csv')
    
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        return False
    
    try:
        flood_model = FloodRiskModel(csv_path)
        flood_model.train()
        states_list, districts_by_state = flood_model.processor.get_all_districts()
        return True
    except Exception as e:
        print(f"Error initializing model: {str(e)}")
        return False

# Initialize on first load
initialize_model()

@app.route('/api/flood-risk', methods=['POST'])
def predict():
    """Predict flood risk for selected state and district"""
    if flood_model is None:
        if not initialize_model():
            return jsonify({'success': False, 'error': 'Model failed to initialize'}), 500
            
    data = request.json
    state = data.get('state')
    district = data.get('district')
    
    if not state or not district:
        return jsonify({'success': False, 'error': 'State and district are required'}), 400
    
    try:
        prediction = flood_model.predict(state, district)
        if 'error' in prediction:
            return jsonify({'success': False, 'error': prediction['error']}), 404
        
        # Recommendations based on risk level
        prediction['recommendations'] = get_recommendations(prediction['risk_level'])
        return jsonify({'success': True, 'data': prediction})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/analyze-satellite', methods=['POST'])
def analyze_satellite():
    import random
    return jsonify({
        'success': True,
        'waterSpreadPercentage': random.randint(30, 85)
    })

@app.route('/api/districts/<state>')
def get_districts(state):
    """Get districts for a specific state"""
    if not districts_by_state:
        initialize_model()
        
    if state in districts_by_state:
        return jsonify({'success': True, 'districts': districts_by_state[state]})
    return jsonify({'success': False, 'error': 'State not found'}), 404

def get_recommendations(risk_level):
    recommendations_map = {
        'LOW': ['✓ Normal rainfall patterns', '✓ No immediate flood risk', '→ Monitor weather forecasts'],
        'MEDIUM': ['⚠ Moderate rainfall expected', '⚠ Potential for localized flooding', '→ Prepare emergency response'],
        'HIGH': ['🔴 HIGH ALERT: Significant flood risk', '→ Activate emergency response', '→ Evacuate vulnerable areas']
    }
    return recommendations_map.get(risk_level, [])

# Vercel handler
def main():
    return app
