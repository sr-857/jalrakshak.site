# 🛠️ Complete Installation & Usage Guide

## ✅ Pre-requisites Check

Before starting, ensure you have:

- [ ] Python 3.8 or higher installed
- [ ] pip (Python package manager)
- [ ] Your CSV data file ready
- [ ] A modern web browser

### Check Python Installation

Open PowerShell and run:

```powershell
python --version
```

**Expected:** Python 3.8.0 or higher

If not installed, download from: https://www.python.org/downloads/

---

## 📦 Installation Steps

### Step 1: Navigate to Project Directory

```powershell
cd C:\Users\lenovo\flood_risk_model
```

### Step 2: Create Virtual Environment (Optional but Recommended)

```powershell
# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\Activate.ps1
```

**What this does:** Isolates project dependencies from your system Python

### Step 3: Install Dependencies

```powershell
pip install -r requirements.txt
```

**Expected Output:**
```
Collecting Flask==2.3.0
...
Successfully installed Flask-2.3.0 scikit-learn-1.2.0 pandas-1.5.0 ...
```

### Step 4: Verify Installation

```powershell
python -c "import flask, sklearn, pandas, numpy; print('✓ All packages installed!')"
```

**Expected:** `✓ All packages installed!`

---

## 📂 Data Preparation

### Required CSV Format

Your data file must have these exact columns:

```
State,District,Actual Rainfall (mm),Normal Rainfall (mm),Departure (%)
```

### File Location

Place CSV at:
```
C:\Users\lenovo\Downloads\rainfall_clean_districtwise_NE_India_Jan2026.csv
```

### Verify File

```powershell
Test-Path "C:\Users\lenovo\Downloads\rainfall_clean_districtwise_NE_India_Jan2026.csv"
```

**Expected:** `True`

---

## 🧪 Test Before Running

### Run Test Suite

```powershell
python test_model.py
```

**What this does:**
1. ✓ Checks CSV file exists and loads correctly
2. ✓ Trains the ML model
3. ✓ Makes sample predictions
4. ✓ Shows model performance metrics
5. ✓ Verifies all features work

**Expected Output:**
```
============================================================
  FLOOD RISK MODEL - TEST SUITE
============================================================

📁 CSV File Path: C:\Users\lenovo\Downloads\...
✅ CSV file found!

📊 Training model (this may take 30 seconds)...
✅ Model training complete!
   Test Accuracy: 88.89%

📍 States: 8
   • Assam: 8 districts
   • Meghalaya: 5 districts
   ...

🔍 Testing: Assam - Kamrup Metro (Guwahati)
   ✅ Risk Level: LOW
      Confidence: 91.2%
      ...

✅ TEST COMPLETE
```

### If Test Fails

**Error: "CSV file not found"**
- Check file path: `C:\Users\lenovo\Downloads\`
- Verify file name matches exactly
- Use: `Test-Path "C:\Users\lenovo\Downloads\rainfall_clean_districtwise_NE_India_Jan2026.csv"`

**Error: "Module not found"**
```powershell
pip install -r requirements.txt
```

**Error: "Permission denied"**
- Run PowerShell as Administrator
- Or use: `python -m pip install --user -r requirements.txt`

---

## 🚀 Running the Application

### Start the Flask Server

```powershell
python app.py
```

**Expected Output:**
```
Initializing Flood Risk Assessment Model...
Loading data...
Creating features...
Training flood risk model...
Building Random Forest with 100 trees...
Model training complete!
Test Accuracy: 88.89%
Model saved to flood_model.pkl
Model ready! Starting Flask app...
 * Running on http://localhost:5000 (Press CTRL+C to quit)
```

**The model trains automatically on first run (takes ~30 seconds)**

### Access the Dashboard

Open your web browser and go to:

```
http://localhost:5000
```

You should see:
- 🌊 Flood Risk Assessment title
- Input form with State/District dropdowns
- "Analyze Risk" button
- How It Works information panel

---

## 🎮 Using the Dashboard

### Make Your First Prediction

1. **Select State:** Click dropdown → Choose "Assam"
2. **Select District:** Click dropdown → Choose "Kamrup Metro (Guwahati)"
3. **Click Button:** Press "Analyze Risk"
4. **View Results:** Scroll down to see predictions

### Understanding the Results

```
Location: Silchar, Assam

Risk Level: [Color-coded badge showing LOW/MEDIUM/HIGH]
Confidence: [Percentage showing model certainty]

Probability Distribution:
  LOW:    91.23%
  MEDIUM:  8.12%
  HIGH:    0.65%

Rainfall Data:
  Actual:   0.0 mm
  Normal:   7.2 mm
  Departure: -99%

Feature Importance:
  rainfall_ratio:  28.45%
  departure_pct:   25.67%
  ...

Recommendations:
  ✓ Normal rainfall patterns observed
  ✓ No immediate flood risk
  → Continue regular monitoring
  ...
```

### Try Different Locations

1. Clear form or refresh page
2. Select different state
3. Select different district
4. Click "Analyze Risk" again
5. Compare results

---

## 🧹 Stopping the Application

To stop the Flask server:

```powershell
CTRL + C
```

Then press `Y` if prompted to confirm.

---

## 🔄 Restarting the Application

After stopping, you can restart anytime:

```powershell
python app.py
```

**On subsequent runs:**
- Model loads from saved `flood_model.pkl` (much faster!)
- No retraining needed
- Starts instantly

To force retraining:
1. Delete `flood_model.pkl`
2. Restart `python app.py`

---

## 📊 Advanced: Accessing the API

### Using curl (Command Line)

Get districts in Assam:
```powershell
curl http://localhost:5000/api/districts/Assam
```

Make prediction:
```powershell
curl -X POST http://localhost:5000/api/predict `
  -Header "Content-Type: application/json" `
  -Body '{"state":"Assam","district":"Kamrup Metro (Guwahati)"}'
```

### Using Python

Create file `test_api.py`:

```python
import requests

# Get districts
response = requests.get('http://localhost:5000/api/districts/Assam')
print("Districts:", response.json()['districts'])

# Make prediction
result = requests.post('http://localhost:5000/api/predict',
    json={'state': 'Assam', 'district': 'Kamrup Metro (Guwahati)'})

data = result.json()['data']
print(f"Risk: {data['risk_level']}")
print(f"Confidence: {data['confidence']:.1f}%")
```

Run with:
```powershell
python test_api.py
```

### Using JavaScript

```javascript
fetch('http://localhost:5000/api/predict', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    state: 'Assam',
    district: 'Kamrup Metro (Guwahati)'
  })
})
.then(response => response.json())
.then(data => console.log(data.data.risk_level));
```

---

## 🔧 Troubleshooting Guide

### Issue: Port Already in Use

**Error:** `Address already in use`

**Solution 1: Find and kill the process**
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual number)
taskkill /PID 12345 /F
```

**Solution 2: Use different port**

Edit `app.py`:
```python
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)  # Change 5000 to 5001
```

Then access: `http://localhost:5001`

### Issue: CSV File Not Found

**Error:** `CSV file not found`

**Solutions:**
1. Check exact file path and name
2. Verify file exists:
   ```powershell
   dir "C:\Users\lenovo\Downloads\rainfall*.csv"
   ```
3. If file has different name, edit `app.py`:
   ```python
   csv_path = os.path.join(
       os.path.expanduser('~'),
       'Downloads',
       'YOUR_FILE_NAME.csv'  # Change this
   )
   ```

### Issue: Module Import Error

**Error:** `ModuleNotFoundError: No module named 'flask'`

**Solution:**
```powershell
pip install -r requirements.txt
```

Or if using virtual environment:
```powershell
venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Issue: Districts Dropdown Empty

**Possible Causes:**
1. CSV not loading
2. Wrong column names in CSV
3. Malformed data

**Debug:**
```python
from data_processor import DataProcessor
processor = DataProcessor("../Downloads/rainfall_clean_districtwise_NE_India_Jan2026.csv")
processor.load_data()
print(processor.data.columns)  # Should print column names
print(processor.data.head())   # Should show first rows
```

### Issue: Model Accuracy Very Low

**Possible Causes:**
1. Not enough data points
2. Poor data quality
3. Risk threshold needs adjustment

**Solutions:**
1. Add more data
2. Clean data (remove outliers)
3. Adjust thresholds in `data_processor.py`:
   ```python
   def create_labels(self, data=None):
       # Adjust these thresholds
       if actual > normal * 1.5:    # Change 1.5
           risk_labels.append('HIGH')
   ```

### Issue: Slow Predictions

**Normal behavior:**
- First prediction: 2-3 seconds (model loads from disk)
- Subsequent: <100ms

**If consistently slow:**
1. Check CPU usage
2. Ensure sufficient RAM (200MB minimum)
3. Try disabling browser extensions

### Issue: Dashboard Not Displaying

**Error:** Blank page or "Connection refused"

**Solutions:**
1. Check terminal for Flask errors
2. Verify port is correct: `http://localhost:5000`
3. Try different browser or clear cache:
   ```
   Ctrl + Shift + Del (most browsers)
   ```

---

## 🚀 Optimization Tips

### For Better Performance

1. **Use Virtual Environment:**
   ```powershell
   python -m venv venv
   venv\Scripts\Activate.ps1
   ```

2. **Cache Model After Training:**
   - Model automatically saves to `flood_model.pkl`
   - Subsequent runs load from cache (much faster)

3. **Reduce Training Data:**
   - Keep CSV with essential records only
   - Removes outliers before training

4. **Increase Tree Count:**
   In `flood_model.py`:
   ```python
   self.model = RandomForestClassifier(n_estimators=200)  # More trees = more accurate
   ```

### For Remote Access

Edit `app.py`:
```python
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)  # 0.0.0.0 = accessible from network
```

Find your computer's IP:
```powershell
ipconfig /all
```

Share URL: `http://YOUR_IP:5000`

---

## 🔒 Security for Production

For production deployment:

1. **Disable Debug Mode:**
   ```python
   app.run(debug=False)  # Security risk: set to False
   ```

2. **Add HTTPS:**
   ```python
   from flask_talisman import Talisman
   Talisman(app)
   ```

3. **Add Authentication:**
   ```python
   from flask_httpauth import HTTPBasicAuth
   auth = HTTPBasicAuth()
   
   @app.route('/api/predict')
   @auth.login_required
   def predict():
       ...
   ```

4. **Rate Limiting:**
   ```python
   from flask_limiter import Limiter
   limiter = Limiter(app, key_func=lambda: request.remote_addr)
   
   @app.route('/api/predict')
   @limiter.limit("10/minute")
   def predict():
       ...
   ```

---

## 📋 Verification Checklist

After installation, verify:

- [ ] Python 3.8+ installed
- [ ] All packages installed (`pip show flask`)
- [ ] CSV file at correct path
- [ ] `test_model.py` runs successfully
- [ ] `app.py` starts without errors
- [ ] Browser shows dashboard at `http://localhost:5000`
- [ ] Can select state and district
- [ ] Predictions load and display correctly
- [ ] Results show risk level, confidence, and recommendations
- [ ] Multiple predictions work (not just first)

---

## 📚 File Descriptions

| File | Purpose |
|------|---------|
| `app.py` | Flask web server |
| `flood_model.py` | ML model training/prediction |
| `data_processor.py` | Data loading and features |
| `test_model.py` | Test suite |
| `requirements.txt` | Python packages |
| `templates/index.html` | Web dashboard |
| `flood_model.pkl` | Trained model (auto-generated) |

---

## 🆘 Getting Help

1. **Check error message** - Read the full error
2. **Search solution** - Look in README.md and QUICKSTART.md
3. **Run test** - Execute `python test_model.py`
4. **Check files** - Verify CSV path and format
5. **Review logs** - Check terminal output for clues
6. **Try examples** - See API_EXAMPLES.md for usage patterns

---

## 🎉 You're Ready to Go!

Your flood risk assessment system is now installed and ready to use.

**Quick reference:**

```powershell
# Activate virtual environment (if created)
venv\Scripts\Activate.ps1

# Install dependencies (first time only)
pip install -r requirements.txt

# Test everything
python test_model.py

# Run the app
python app.py

# Open browser
http://localhost:5000
```

---

**Happy Flood Risk Monitoring!** 🌊

For more details, see:
- QUICKSTART.md - Fast setup guide
- README.md - Full documentation
- API_EXAMPLES.md - API usage
- PROJECT_SUMMARY.md - Project overview
