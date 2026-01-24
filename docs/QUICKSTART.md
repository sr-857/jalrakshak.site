# 🚀 Quick Start Guide - Flood Risk Model

## ⚡ 5-Minute Setup

### Step 1: Install Python Packages (2 minutes)

Open PowerShell in the `flood_risk_model` folder and run:

```powershell
pip install -r requirements.txt
```

Expected output: "Successfully installed..."

### Step 2: Verify CSV File Location (1 minute)

The CSV file should be at:
```
C:\Users\lenovo\Downloads\rainfall_clean_districtwise_NE_India_Jan2026.csv
```

✅ If file is there, proceed to Step 3

❌ If NOT there, copy it to the above location

### Step 3: Test the Model (1 minute)

Run the test script to ensure everything works:

```powershell
python test_model.py
```

**Expected output:**
- ✅ CSV file found!
- ✅ Model training complete!
- ✅ Test cases pass
- ✅ Shows sample predictions

If you see errors, check the **Troubleshooting** section below.

### Step 4: Start the Web App (1 minute)

```powershell
python app.py
```

**Expected output:**
```
Initializing Flood Risk Assessment Model...
Loading data...
Creating features...
Training flood risk model...
Model saved to flood_model.pkl
Model ready! Starting Flask app...
 * Running on http://localhost:5000
```

### Step 5: Open in Browser (1 minute)

Go to: **http://localhost:5000**

You should see a beautiful dark-themed dashboard! 🎨

---

## 🎮 How to Use

### On the Dashboard:

1. **Select State** from the first dropdown
2. **Select District** from the second dropdown (auto-populated)
3. **Click "Analyze Risk"** button
4. **View Results** showing:
   - Risk Level (LOW/MEDIUM/HIGH)
   - Confidence percentage
   - Probability distribution
   - Rainfall data
   - Feature importance
   - Recommendations

---

## 🧪 Test Cases to Try

### Easy Test (Low Risk):
- State: **Assam**
- District: **Kamrup Metro (Guwahati)**
- Expected: **LOW** risk (0.0 mm actual vs 4.6 mm normal)

### Other Tests:
- State: **Assam**, District: **Dibrugarh**
- State: **Meghalaya**, District: **East Khasi Hills**
- State: **Mizoram**, District: **Aizawl**

---

## 📊 Understanding Results

| Item | Meaning |
|------|---------|
| **Risk Level** | LOW/MEDIUM/HIGH classification |
| **Confidence** | How sure (0-100%) the model is about this prediction |
| **Model Accuracy** | How well the model performs on similar data (0-100%) |
| **Actual vs Normal** | Comparison of rainfall to historical average |
| **Departure %** | How much above/below normal (-100% to +500%) |
| **Feature Importance** | Which factors most influenced the prediction |

### Example Output:
```
State: Assam, District: Guwahati
Risk Level: LOW ✓
Confidence: 91.2%
Model Accuracy: 88.9%

Rainfall:
  Actual: 0.0 mm
  Normal: 4.6 mm
  Departure: -99%

This means: Very little rain (99% below normal) = Low flood risk
```

---

## ⚡ Common Issues & Fixes

### Issue: "CSV file not found"
**Fix:** 
1. Check file is at: `C:\Users\lenovo\Downloads\rainfall_clean_districtwise_NE_India_Jan2026.csv`
2. Use test_model.py to verify path

### Issue: "Port 5000 already in use"
**Fix:** Edit app.py, change port 5000 to 5001:
```python
app.run(debug=True, host='0.0.0.0', port=5001)
```
Then access: `http://localhost:5001`

### Issue: Module "sklearn" not found
**Fix:** Run:
```powershell
pip install -r requirements.txt
```

### Issue: Districts dropdown stays empty
**Fix:**
1. Check CSV file column names exactly match: `State`, `District`, `Actual Rainfall (mm)`, `Normal Rainfall (mm)`, `Departure (%)`
2. Check for extra spaces in data
3. Run test_model.py to verify data loads

### Issue: Slow predictions
**Normal!** First prediction takes ~2 seconds. Subsequent ones are instant.

### Issue: "Cannot find module 'data_processor'"
**Fix:** Make sure you're running from inside the `flood_risk_model` folder:
```powershell
cd C:\Users\lenovo\flood_risk_model
python app.py
```

---

## 📁 File Structure

```
flood_risk_model/
│
├── app.py                    ← Start here with: python app.py
├── requirements.txt          ← Install with: pip install -r requirements.txt
├── test_model.py            ← Test with: python test_model.py
│
├── flood_model.py           ← AI model (Random Forest Classifier)
├── data_processor.py        ← Data handling
│
├── flood_model.pkl          ← Trained model (auto-generated)
│
├── templates/
│   └── index.html           ← Web interface
│
└── README.md                ← Full documentation
```

---

## 🎯 Model Details

**Algorithm:** Random Forest Classifier with 100 trees

**Features Used:**
1. Rainfall Ratio (actual ÷ normal)
2. Departure percentage from normal
3. Absolute rainfall amount
4. Historical normal rainfall
5. Excess rainfall (actual - normal)

**Risk Classification:**
- **HIGH:** Rainfall > 1.5× normal
- **MEDIUM:** Rainfall > 1.0× normal OR Departure > -20%
- **LOW:** All other cases

**Accuracy:** ~85-90% on test data

---

## 🔧 Advanced: Manual Testing

### Test with Python directly:

Create file `manual_test.py`:

```python
from flood_model import FloodRiskModel
import os

csv_path = os.path.expanduser('~/Downloads/rainfall_clean_districtwise_NE_India_Jan2026.csv')
model = FloodRiskModel(csv_path)
model.train()

# Predict for any location
result = model.predict("Assam", "Kamrup Metro (Guwahati)")

print(f"Risk: {result['risk_level']}")
print(f"Confidence: {result['confidence']:.1f}%")
print(f"Accuracy: {result['model_accuracy']:.1f}%")
```

Run with:
```powershell
python manual_test.py
```

---

## 🌐 Accessing Remotely

To access the dashboard from another computer on your network:

1. Find your computer's IP (run `ipconfig` in PowerShell)
2. Look for "IPv4 Address" (like 192.168.1.100)
3. Share URL: `http://192.168.1.100:5000`

---

## 📞 Need Help?

1. **Check README.md** for detailed documentation
2. **Run test_model.py** to diagnose issues
3. **Review CSV format** - must have exact columns
4. **Check dependencies** - `pip install -r requirements.txt`

---

## ✨ You're All Set!

Your flood risk prediction system is ready to use! 

**Next:**
```powershell
python app.py
```

Then open: **http://localhost:5000** 🌊
