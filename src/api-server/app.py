from flask import Flask, render_template, request, jsonify
import os
import sys
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
    
    csv_path = os.path.join(
        os.path.expanduser('~'),
        'Downloads',
        'rainfall_clean_districtwise_NE_India_Jan2026.csv'
    )
    
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        return False
    
    try:
        flood_model = FloodRiskModel(csv_path)
        print("Training flood risk model...")
        flood_model.train()
        flood_model.save_model('flood_model.pkl')
        
        # Load states and districts
        states_list, districts_by_state = flood_model.processor.get_all_districts()
        print(f"Model initialized with {len(states_list)} states")
        return True
    except Exception as e:
        print(f"Error initializing model: {str(e)}")
        return False

@app.route('/')
def index():
    """Render main dashboard"""
    return render_template('index.html', states=states_list)

@app.route('/api/districts/<state>')
def get_districts(state):
    """Get districts for a specific state"""
    if state in districts_by_state:
        return jsonify({
            'success': True,
            'districts': districts_by_state[state]
        })
    return jsonify({
        'success': False,
        'error': 'State not found'
    }), 404

@app.route('/api/predict', methods=['POST'])
def predict():
    """Predict flood risk for selected state and district"""
    data = request.json
    state = data.get('state')
    district = data.get('district')
    
    if not state or not district:
        return jsonify({
            'success': False,
            'error': 'State and district are required'
        }), 400
    
    try:
        prediction = flood_model.predict(state, district)
        
        if 'error' in prediction:
            return jsonify({
                'success': False,
                'error': prediction['error']
            }), 404
        
        # Add recommendations based on risk level
        recommendations = get_recommendations(prediction['risk_level'])
        prediction['recommendations'] = recommendations
        
        return jsonify({
            'success': True,
            'data': prediction
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def get_recommendations(risk_level):
    """Get recommendations based on risk level"""
    recommendations_map = {
        'LOW': [
            '✓ Normal rainfall patterns observed',
            '✓ No immediate flood risk',
            '✓ Continue regular monitoring',
            '→ Maintain standard drainage systems',
            '→ Monitor weather forecasts regularly'
        ],
        'MEDIUM': [
            '⚠ Moderate rainfall expected',
            '⚠ Potential for localized flooding',
            '→ Alert local authorities',
            '→ Inspect and clear drainage channels',
            '→ Prepare emergency response teams',
            '→ Alert public via media channels'
        ],
        'HIGH': [
            '🔴 HIGH ALERT: Significant flood risk',
            '🔴 Heavy rainfall pattern detected',
            '→ Activate emergency response protocols',
            '→ Evacuate vulnerable areas if needed',
            '→ Deploy rescue and relief teams',
            '→ Set up relief camps and shelters',
            '→ Coordinate with regional authorities',
            '→ Provide real-time updates to public'
        ]
    }
    
    return recommendations_map.get(risk_level, [])

if __name__ == '__main__':
    print("Initializing Flood Risk Assessment Model...")
    if initialize_model():
        print("Model ready! Starting Flask app...")
        app.run(debug=True, host='0.0.0.0', port=5000)
    else:
        print("Failed to initialize model")
        sys.exit(1)
