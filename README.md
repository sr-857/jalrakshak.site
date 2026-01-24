# Flood Risk Assessment AI Model

An intelligent AI system that predicts flood risk for Indian districts using rainfall data and machine learning classification algorithms.

## 📋 Project Structure

```
flood_risk_model/
├── requirements.txt          # Python dependencies
├── data_processor.py         # Data loading and feature engineering
├── flood_model.py            # ML model training and prediction
├── app.py                    # Flask web server
├── templates/
│   └── index.html            # Web interface dashboard
└── README.md                 # This file
```

## 🚀 Quick Start

### Step 1: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 2: Prepare Data

Make sure your CSV file is at:
```
C:\Users\lenovo\Downloads\rainfall_clean_districtwise_NE_India_Jan2026.csv
```

The CSV should have columns: `State`, `District`, `Actual Rainfall (mm)`, `Normal Rainfall (mm)`, `Departure (%)`

### Step 3: Run the Application

```bash
python app.py
```

This will:
1. Train the ML model (takes ~30 seconds)
2. Save the model to `flood_model.pkl`
3. Start the Flask web server on `http://localhost:5000`

### Step 4: Open in Browser

Navigate to: `http://localhost:5000`

## 📊 How to Use the Web Interface

### Input Data
1. **Select State**: Choose a state from the dropdown (Assam, Meghalaya, Mizoram, etc.)
2. **Select District**: Choose a district from the filtered dropdown
3. **Click "Analyze Risk"**: The AI model will predict the flood risk

### Output Results

The system displays:

- **Risk Level**: LOW | MEDIUM | HIGH (color-coded)
- **Model Confidence**: Probability percentage (0-100%)
- **Model Accuracy**: Overall ML model accuracy on test data
- **Probability Distribution**: Full breakdown of all risk probabilities
- **Rainfall Data**: Actual vs Normal rainfall comparison
- **Feature Importance**: Which factors influenced the prediction most
- **Recommendations**: Action items based on risk level

## 🤖 Model Details

### Algorithm
**Random Forest Classifier** with:
- 100 decision trees
- Max depth: 10
- Cross-validation: 5-fold
- Test-train split: 80-20

### Features Used
1. **Rainfall Ratio**: Actual ÷ Normal rainfall
2. **Departure Percentage**: Deviation from normal (%)
3. **Actual Rainfall**: Absolute rainfall amount (mm)
4. **Normal Rainfall**: Climate baseline (mm)
5. **Excess Rainfall**: Difference (Actual - Normal)

### Classification Labels
- **LOW**: Normal to low rainfall patterns
- **MEDIUM**: Moderate rainfall, potential for localized flooding
- **HIGH**: Heavy rainfall, significant flood risk

## 📈 Model Performance

When you run `app.py`, you'll see metrics like:
```
Training Accuracy: 0.9500
Testing Accuracy: 0.8889
Cross-validation Score: 0.8500 (+/- 0.1200)
```

These show how well the model predicts on new data.

## 🔍 Testing the Model Manually

### Option 1: Use the Web Interface
1. Run `python app.py`
2. Open browser to `http://localhost:5000`
3. Select state and district
4. View predictions

### Option 2: Command Line Testing

Create a file `test_model.py`:

```python
from flood_model import FloodRiskModel

# Initialize and train model
model = FloodRiskModel("../Downloads/rainfall_clean_districtwise_NE_India_Jan2026.csv")
model.train()

# Test prediction
result = model.predict("Assam", "Kamrup Metro (Guwahati)")
print("\n=== PREDICTION RESULT ===")
print(f"State: {result['state']}")
print(f"District: {result['district']}")
print(f"Risk Level: {result['risk_level']}")
print(f"Confidence: {result['confidence']:.2f}%")
print(f"Model Accuracy: {result['model_accuracy']:.2f}%")
print(f"\nAll Probabilities:")
for risk, prob in result['all_probabilities'].items():
    print(f"  {risk}: {prob:.2f}%")
print(f"\nRainfall Data:")
for key, value in result['rainfall_data'].items():
    print(f"  {key}: {value}")
```

Run it:
```bash
python test_model.py
```

### Option 3: Load Pre-trained Model

After running once, the model is saved as `flood_model.pkl`. You can load it without retraining:

```python
from flood_model import FloodRiskModel

model = FloodRiskModel("../Downloads/rainfall_clean_districtwise_NE_India_Jan2026.csv")
model.load_model('flood_model.pkl')  # Load existing model

# Make predictions without retraining
result = model.predict("Assam", "Dibrugarh")
print(result)
```

## 📝 Sample Test Cases

### Test Case 1: Low Risk District
```
State: Assam
District: Kamrup Metro (Guwahati)
Expected Risk: LOW (0.0 mm actual vs 4.6 mm normal)
```

### Test Case 2: High Risk District (if exists in data)
```
State: [State with high rainfall]
District: [District with high rainfall]
Expected Risk: HIGH (actual rainfall > 1.5x normal)
```

## 🎯 Risk Classification Rules

The model uses these thresholds:
- **HIGH**: Actual rainfall > 1.5 × Normal rainfall
- **MEDIUM**: Actual rainfall > 1.0 × Normal rainfall OR Departure > -20%
- **LOW**: All other cases

## 📊 Data Features Explanation

| Feature | Description |
|---------|-------------|
| Rainfall Ratio | How much more/less actual rainfall compared to normal |
| Departure % | Percentage deviation from historical average |
| Actual Rainfall | Measured rainfall in mm |
| Normal Rainfall | Historical average rainfall |
| Excess Rainfall | Additional rainfall beyond normal |

## 🔧 Customization

### Change Model Hyperparameters

Edit `flood_model.py`, in the `train()` method:

```python
self.model = RandomForestClassifier(
    n_estimators=100,      # Increase for more accuracy (slower)
    max_depth=10,          # Adjust tree depth
    min_samples_split=2,   # Minimum samples to split
    min_samples_leaf=1,    # Minimum samples in leaf
    random_state=42,
    n_jobs=-1
)
```

### Add More Features

Edit `data_processor.py`, in the `create_features()` method to add new features based on your data.

### Modify Risk Thresholds

Edit `data_processor.py`, in the `create_labels()` method to adjust risk classification rules.

## ❌ Troubleshooting

### "CSV file not found" Error
- Ensure file is at: `C:\Users\lenovo\Downloads\rainfall_clean_districtwise_NE_India_Jan2026.csv`
- Check file name for typos

### Port 5000 Already in Use
```bash
# Change port in app.py:
app.run(debug=True, host='0.0.0.0', port=5001)  # Use 5001 instead
```

### Model Accuracy Low
- Check data quality
- Ensure sufficient data points (at least 20+)
- Try different thresholds in `create_labels()`

### Districts Not Loading
- Verify CSV column names exactly match: `State`, `District`, etc.
- Check for extra whitespace in data

## 📚 API Endpoints

### GET `/`
Returns the web interface dashboard

### GET `/api/districts/<state>`
Returns list of districts for a state
```json
{
  "success": true,
  "districts": ["District1", "District2", ...]
}
```

### POST `/api/predict`
Makes a flood risk prediction
```json
{
  "state": "Assam",
  "district": "Guwahati"
}
```

Returns:
```json
{
  "success": true,
  "data": {
    "risk_level": "LOW",
    "confidence": 85.5,
    "all_probabilities": {...},
    "recommendations": [...],
    ...
  }
}
```

## 🎓 Understanding the Output

### Confidence vs Accuracy
- **Confidence**: How certain the model is about THIS prediction (0-100%)
- **Accuracy**: How well the model performs GENERALLY on all data (0-100%)

### Example Output
```
Risk Level: MEDIUM (92.3% confidence)
Model Accuracy: 88.9%

This means the model predicts MEDIUM risk with 92.3% certainty,
and the model is generally 88.9% accurate on similar predictions.
```

## 📞 Support

For issues or questions:
1. Check the Troubleshooting section
2. Review the CSV data format
3. Ensure all dependencies are installed

## 📄 License

Educational and research use.

---

**Happy Flood Risk Monitoring!** 🌊
