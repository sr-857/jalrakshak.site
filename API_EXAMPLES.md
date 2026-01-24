# 🔌 API Usage Examples

The Flood Risk Model provides REST API endpoints for integration with other applications.

## Base URL

```
http://localhost:5000
```

---

## 📚 API Endpoints

### 1. Get Dashboard
**GET** `/`

Returns the web interface (HTML page)

**Usage:**
```bash
curl http://localhost:5000/
```

---

### 2. Get Districts by State
**GET** `/api/districts/<state>`

Returns list of all districts in a state

**Parameters:**
- `state` (string, required): State name (e.g., "Assam")

**Response:**
```json
{
  "success": true,
  "districts": [
    "Kamrup Metro (Guwahati)",
    "Kamrup Rural",
    "Dibrugarh",
    "Cachar (Silchar)",
    "Jorhat",
    "Nagaon",
    "Barpeta",
    "Dhubri"
  ]
}
```

**Example:**
```bash
curl http://localhost:5000/api/districts/Assam
```

**Python Example:**
```python
import requests

response = requests.get('http://localhost:5000/api/districts/Assam')
districts = response.json()['districts']

for district in districts:
    print(district)
```

**JavaScript Example:**
```javascript
fetch('http://localhost:5000/api/districts/Assam')
  .then(response => response.json())
  .then(data => {
    data.districts.forEach(district => {
      console.log(district);
    });
  });
```

---

### 3. Predict Flood Risk
**POST** `/api/predict`

Makes a flood risk prediction for a location

**Request Body:**
```json
{
  "state": "Assam",
  "district": "Kamrup Metro (Guwahati)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "state": "Assam",
    "district": "Kamrup Metro (Guwahati)",
    "risk_level": "LOW",
    "confidence": 91.23,
    "all_probabilities": {
      "LOW": 91.23,
      "MEDIUM": 8.12,
      "HIGH": 0.65
    },
    "rainfall_data": {
      "actual_rainfall_mm": 0.0,
      "normal_rainfall_mm": 4.6,
      "departure_percent": -99.0
    },
    "feature_importance": {
      "rainfall_ratio": 28.45,
      "departure_pct": 25.67,
      "actual_rainfall": 18.92,
      "normal_rainfall": 15.23,
      "excess_rainfall": 11.73
    },
    "model_accuracy": 88.89,
    "recommendations": [
      "✓ Normal rainfall patterns observed",
      "✓ No immediate flood risk",
      "✓ Continue regular monitoring",
      "→ Maintain standard drainage systems",
      "→ Monitor weather forecasts regularly"
    ]
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"state":"Assam","district":"Kamrup Metro (Guwahati)"}'
```

---

## 💻 Integration Examples

### Python Integration

#### Simple Usage:
```python
import requests
import json

def get_flood_risk(state, district):
    url = 'http://localhost:5000/api/predict'
    payload = {
        'state': state,
        'district': district
    }
    
    response = requests.post(url, json=payload)
    result = response.json()
    
    if result['success']:
        data = result['data']
        return {
            'risk': data['risk_level'],
            'confidence': data['confidence'],
            'accuracy': data['model_accuracy']
        }
    else:
        return {'error': result['error']}

# Usage
risk = get_flood_risk('Assam', 'Kamrup Metro (Guwahati)')
print(f"Risk Level: {risk['risk']}")
print(f"Confidence: {risk['confidence']:.1f}%")
print(f"Model Accuracy: {risk['accuracy']:.1f}%")
```

#### Advanced Usage with Error Handling:
```python
import requests

def predict_all_districts(state):
    """Predict flood risk for all districts in a state"""
    
    # Get districts
    districts_url = f'http://localhost:5000/api/districts/{state}'
    districts_response = requests.get(districts_url)
    
    if not districts_response.json()['success']:
        print(f"State not found: {state}")
        return []
    
    districts = districts_response.json()['districts']
    
    # Predict for each district
    predictions = []
    predict_url = 'http://localhost:5000/api/predict'
    
    for district in districts:
        try:
            response = requests.post(predict_url, json={
                'state': state,
                'district': district
            })
            
            if response.json()['success']:
                data = response.json()['data']
                predictions.append({
                    'district': district,
                    'risk': data['risk_level'],
                    'confidence': data['confidence']
                })
        except Exception as e:
            print(f"Error predicting {district}: {e}")
    
    return predictions

# Usage
results = predict_all_districts('Assam')

# Sort by risk level
risk_order = {'HIGH': 0, 'MEDIUM': 1, 'LOW': 2}
results.sort(key=lambda x: risk_order.get(x['risk'], 3))

print("High Risk Districts:")
for r in results:
    if r['risk'] == 'HIGH':
        print(f"  {r['district']}: {r['confidence']:.1f}% confidence")
```

### JavaScript/Node.js Integration

```javascript
// Fetch and display flood risk
async function displayFloodRisk(state, district) {
  try {
    const response = await fetch('http://localhost:5000/api/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ state, district })
    });
    
    const result = await response.json();
    
    if (result.success) {
      const data = result.data;
      console.log(`Risk Level: ${data.risk_level}`);
      console.log(`Confidence: ${data.confidence.toFixed(1)}%`);
      console.log(`Model Accuracy: ${data.model_accuracy.toFixed(1)}%`);
      
      // Display recommendations
      console.log('Recommendations:');
      data.recommendations.forEach(rec => {
        console.log(`  ${rec}`);
      });
      
      return data;
    } else {
      console.error('Error:', result.error);
    }
  } catch (error) {
    console.error('API Error:', error);
  }
}

// Usage
displayFloodRisk('Assam', 'Kamrup Metro (Guwahati)');
```

### JavaScript - Batch Processing

```javascript
// Get predictions for multiple locations
async function batchPredict(locations) {
  const predictions = [];
  
  for (const { state, district } of locations) {
    try {
      const response = await fetch('http://localhost:5000/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, district })
      });
      
      const result = await response.json();
      if (result.success) {
        predictions.push({
          location: `${state}, ${district}`,
          ...result.data
        });
      }
    } catch (error) {
      console.error(`Error for ${state}, ${district}:`, error);
    }
  }
  
  return predictions;
}

// Usage
const locations = [
  { state: 'Assam', district: 'Kamrup Metro (Guwahati)' },
  { state: 'Assam', district: 'Dibrugarh' },
  { state: 'Meghalaya', district: 'East Khasi Hills' }
];

batchPredict(locations).then(results => {
  console.table(results);
});
```

### cURL Examples

**Get all districts in Assam:**
```bash
curl http://localhost:5000/api/districts/Assam | jq
```

**Predict flood risk (pretty printed):**
```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"state":"Assam","district":"Kamrup Metro (Guwahati)"}' | jq
```

**Predict and extract risk level:**
```bash
curl -s -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"state":"Assam","district":"Kamrup Metro (Guwahati)"}' | jq '.data.risk_level'
```

---

## 🔄 Response Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (missing parameters) |
| 404 | Not found (district/state doesn't exist) |
| 500 | Server error (check logs) |

---

## 🧮 Response Data Fields

### Prediction Response

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Request succeeded |
| `state` | string | State name |
| `district` | string | District name |
| `risk_level` | string | "LOW", "MEDIUM", or "HIGH" |
| `confidence` | float | Probability percentage (0-100) |
| `all_probabilities` | object | Probabilities for all risk levels |
| `rainfall_data.actual_rainfall_mm` | float | Measured rainfall |
| `rainfall_data.normal_rainfall_mm` | float | Historical average |
| `rainfall_data.departure_percent` | float | Deviation from normal |
| `feature_importance` | object | Contribution of each feature (%) |
| `model_accuracy` | float | Overall model accuracy (%) |
| `recommendations` | array | Action items based on risk level |

---

## 📊 Example Workflow

```python
import requests

# Step 1: Get all states by querying districts
states = ['Assam', 'Meghalaya', 'Mizoram', 'Manipur', 'Nagaland', 'Sikkim', 'Tripura']

# Step 2: For each state, get districts
for state in states:
    response = requests.get(f'http://localhost:5000/api/districts/{state}')
    districts = response.json()['districts']
    
    # Step 3: Predict for each district
    high_risk = []
    for district in districts:
        pred = requests.post('http://localhost:5000/api/predict', 
            json={'state': state, 'district': district})
        
        data = pred.json()['data']
        if data['risk_level'] == 'HIGH':
            high_risk.append({
                'location': f"{state}, {district}",
                'confidence': data['confidence'],
                'rainfall': data['rainfall_data']['actual_rainfall_mm']
            })
    
    # Step 4: Report high-risk areas
    if high_risk:
        print(f"\n⚠️ HIGH RISK AREAS IN {state}:")
        for item in high_risk:
            print(f"  {item['location']}: {item['confidence']:.1f}% confidence")
```

---

## 🚀 Performance Tips

1. **Batch requests**: Send multiple predictions together for efficiency
2. **Cache results**: Store results to avoid repeated API calls
3. **Async calls**: Use async/await in JavaScript for non-blocking calls
4. **Connection pooling**: Use session objects in Python for reused connections

---

## 🔒 Security Considerations

- API runs on localhost by default (not exposed to internet)
- To expose to network, edit app.py:
  ```python
  app.run(host='0.0.0.0', port=5000)  # Accessible from other computers
  ```
- Consider adding authentication for production use

---

## 📝 Common Integration Patterns

### Pattern 1: Real-time Dashboard
```python
from flask import Flask, render_template
import requests

app = Flask(__name__)

@app.route('/dashboard/<state>')
def dashboard(state):
    # Fetch predictions for all districts
    url = f'http://localhost:5000/api/districts/{state}'
    response = requests.get(url)
    districts = response.json()['districts']
    
    # Get predictions
    predictions = []
    for district in districts:
        pred = requests.post('http://localhost:5000/api/predict',
            json={'state': state, 'district': district})
        predictions.append(pred.json()['data'])
    
    return render_template('dashboard.html', predictions=predictions)
```

### Pattern 2: Automated Alerts
```python
import requests
import smtplib

def check_and_alert():
    # Get high-risk locations
    high_risk_areas = []
    
    for state in ['Assam', 'Meghalaya']:
        response = requests.get(f'http://localhost:5000/api/districts/{state}')
        districts = response.json()['districts']
        
        for district in districts:
            pred = requests.post('http://localhost:5000/api/predict',
                json={'state': state, 'district': district})
            
            data = pred.json()['data']
            if data['risk_level'] == 'HIGH':
                high_risk_areas.append(f"{state}, {district}")
    
    # Send alert if high-risk areas found
    if high_risk_areas:
        alert_message = f"🚨 HIGH FLOOD RISK: {', '.join(high_risk_areas)}"
        # Send email/SMS/notification
        print(alert_message)
```

---

Happy Integrating! 🚀
