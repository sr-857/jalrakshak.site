"""
JalRakshak - Flask Web Server for AI Model
This module provides the web interface and API endpoints for the flood risk prediction model.
"""

from flask import Flask, render_template, request, jsonify
import os
import sys

# Add current directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

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
    
    csv_path = os.path.join(os.path.dirname(__file__), 'data', 'rainfall_clean_districtwise_NE_India_Jan2026.csv')
    
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

# Initialize on startup
initialize_model()

@app.route('/')
def index():
    """Render the main dashboard"""
    return render_template('index.html', states=states_list)

@app.route('/api/districts/<state>')
def get_districts(state):
    """Get districts for a specific state"""
    if not districts_by_state:
        initialize_model()
        
    if state in districts_by_state:
        return jsonify({'success': True, 'districts': districts_by_state[state]})
    return jsonify({'success': False, 'error': 'State not found'}), 404

@app.route('/api/predict', methods=['POST'])
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
        
        prediction['recommendations'] = get_recommendations(prediction['risk_level'])
        return jsonify({'success': True, 'data': prediction})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

def get_recommendations(risk_level):
    """Get recommendations based on risk level"""
    recommendations_map = {
        'LOW': ['Continue routine monitoring', 'No immediate action required', 'Stay informed of weather updates'],
        'MEDIUM': ['Monitor rainfall patterns closely', 'Prepare emergency response plans', 'Alert local authorities'],
        'HIGH': ['Activate emergency response', 'Consider evacuation of vulnerable areas', 'Coordinate with disaster management']
    }
    return recommendations_map.get(risk_level, [])

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
