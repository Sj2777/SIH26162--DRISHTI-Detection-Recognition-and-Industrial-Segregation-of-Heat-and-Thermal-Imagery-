#!/usr/bin/env python3
"""
AGNI-VISION: XGBoost Multi-Class Satellite Fire Classifier
---------------------------------------------------------
Trains an XGBoost gradient boosted decision tree classifier to categorize
spaceborne thermal anomalies into 7 distinct tactical fire types:

0: INDUSTRIAL_HIGH_ALERT (Red - major blowout / critical anomaly)
1: FACTORY               (Orange - registered factory / kiln / refinery stack)
2: HEAT_RING             (Yellow - persistent thermal ring / flare cluster)
3: WILDFIRE              (Green - forest canopy / scrubland fire)
4: CROP                  (Brown - agricultural stubble burning)
5: MINE                  (Purple - open-cast coal pit / quarry activity)
6: UNKNOWN               (Gray - unclassified / sub-pixel thermal trigger)

Features (10-dimensional tabular vector):
- frp: Fire Radiative Power (MW)
- brightness: MWIR Brightness Temperature (K)
- land_cover_code: ESA WorldCover 10m class (10: Tree, 40: Crop, 50: Built-up, 60: Bare/Mine)
- ghsl_pop_density: GHSL 100m grid population density (persons/km²)
- wind_speed: Open-Meteo local wind speed (km/h)
- tropomi_no2: Sentinel-5P TROPOMI regional NO2 (µmol/m²)
- persistence_30d: 30-day thermal detection count
- dist_to_factory_km: Distance to nearest OSM industrial polygon (km)
- hour_utc: Acquisition hour (UTC)
- day_night_flag: 1 for Day ('D'), 0 for Night ('N')
"""

import json
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
OUTPUT_DIR = ROOT_DIR / "public" / "models"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
MODEL_JSON_PATH = OUTPUT_DIR / "xgboost_fire_classifier.json"
RULES_JSON_PATH = OUTPUT_DIR / "xgboost_rules.json"

CLASSES = [
    "INDUSTRIAL_HIGH_ALERT",  # 0 (Red)
    "FACTORY",                # 1 (Orange)
    "HEAT_RING",              # 2 (Yellow)
    "WILDFIRE",               # 3 (Green)
    "CROP",                   # 4 (Brown)
    "MINE",                   # 5 (Purple)
    "UNKNOWN"                 # 6 (Gray)
]

def generate_synthetic_training_data(n_samples=6000, random_state=42):
    np.random.seed(random_state)
    data = []

    for _ in range(n_samples):
        # Pick class with realistic proportions
        cls_idx = np.random.choice([0, 1, 2, 3, 4, 5, 6], p=[0.08, 0.22, 0.12, 0.18, 0.25, 0.10, 0.05])

        if cls_idx == 0:  # INDUSTRIAL_HIGH_ALERT (Red)
            frp = np.random.uniform(45.0, 350.0)
            brightness = np.random.uniform(345.0, 500.0)
            land_cover = 50  # Built-up
            ghsl = np.random.uniform(250, 4500)
            wind = np.random.uniform(5.0, 35.0)
            no2 = np.random.uniform(85.0, 280.0)
            persistence = np.random.randint(15, 30)
            dist_factory = np.random.uniform(0.0, 0.8)
            hour = np.random.randint(0, 24)
            day_night = 1 if hour in range(5, 18) else 0

        elif cls_idx == 1:  # FACTORY (Orange)
            frp = np.random.uniform(12.0, 65.0)
            brightness = np.random.uniform(320.0, 365.0)
            land_cover = 50  # Built-up
            ghsl = np.random.uniform(150, 2500)
            wind = np.random.uniform(4.0, 25.0)
            no2 = np.random.uniform(45.0, 140.0)
            persistence = np.random.randint(10, 30)
            dist_factory = np.random.uniform(0.0, 1.5)
            hour = np.random.randint(0, 24)
            day_night = 1 if hour in range(5, 18) else 0

        elif cls_idx == 2:  # HEAT_RING (Yellow)
            frp = np.random.uniform(8.0, 35.0)
            brightness = np.random.uniform(315.0, 345.0)
            land_cover = np.random.choice([50, 60], p=[0.7, 0.3])
            ghsl = np.random.uniform(500, 5000)
            wind = np.random.uniform(2.0, 18.0)
            no2 = np.random.uniform(30.0, 95.0)
            persistence = np.random.randint(20, 30)
            dist_factory = np.random.uniform(0.2, 3.5)
            hour = np.random.randint(0, 24)
            day_night = 1 if hour in range(5, 18) else 0

        elif cls_idx == 3:  # WILDFIRE (Green)
            frp = np.random.uniform(15.0, 180.0)
            brightness = np.random.uniform(315.0, 380.0)
            land_cover = np.random.choice([10, 20], p=[0.8, 0.2])  # Tree cover, Shrubland
            ghsl = np.random.uniform(0, 45)
            wind = np.random.uniform(8.0, 40.0)
            no2 = np.random.uniform(5.0, 40.0)
            persistence = np.random.randint(1, 6)
            dist_factory = np.random.uniform(8.0, 80.0)
            hour = np.random.randint(0, 24)
            day_night = 1 if hour in range(6, 17) else 0

        elif cls_idx == 4:  # CROP (Brown)
            frp = np.random.uniform(5.0, 45.0)
            brightness = np.random.uniform(310.0, 345.0)
            land_cover = 40  # Cropland
            ghsl = np.random.uniform(40, 600)
            wind = np.random.uniform(3.0, 22.0)
            no2 = np.random.uniform(15.0, 60.0)
            persistence = np.random.randint(1, 4)
            dist_factory = np.random.uniform(4.0, 45.0)
            hour = np.random.choice([6, 7, 8, 9, 10, 11, 12, 13])  # Typically daytime burning
            day_night = 1

        elif cls_idx == 5:  # MINE (Purple)
            frp = np.random.uniform(15.0, 85.0)
            brightness = np.random.uniform(325.0, 375.0)
            land_cover = 60  # Bare / Open-cast pit
            ghsl = np.random.uniform(20, 350)
            wind = np.random.uniform(4.0, 28.0)
            no2 = np.random.uniform(50.0, 160.0)
            persistence = np.random.randint(12, 30)
            dist_factory = np.random.uniform(0.5, 6.0)
            hour = np.random.randint(0, 24)
            day_night = 1 if hour in range(5, 18) else 0

        else:  # UNKNOWN (Gray)
            frp = np.random.uniform(2.0, 12.0)
            brightness = np.random.uniform(300.0, 320.0)
            land_cover = np.random.choice([30, 80, 90])  # Grassland / Water / Wetland
            ghsl = np.random.uniform(0, 200)
            wind = np.random.uniform(1.0, 20.0)
            no2 = np.random.uniform(2.0, 30.0)
            persistence = np.random.randint(0, 2)
            dist_factory = np.random.uniform(5.0, 50.0)
            hour = np.random.randint(0, 24)
            day_night = np.random.choice([0, 1])

        data.append({
            "frp": frp,
            "brightness": brightness,
            "land_cover_code": land_cover,
            "ghsl_pop_density": ghsl,
            "wind_speed": wind,
            "tropomi_no2": no2,
            "persistence_30d": persistence,
            "dist_to_factory_km": dist_factory,
            "hour_utc": hour,
            "day_night_flag": day_night,
            "target": cls_idx
        })

    return pd.DataFrame(data)

def main():
    print("Generating representative earth-observation training dataset (N=6000)...")
    df = generate_synthetic_training_data()

    feature_cols = [
        "frp", "brightness", "land_cover_code", "ghsl_pop_density",
        "wind_speed", "tropomi_no2", "persistence_30d",
        "dist_to_factory_km", "hour_utc", "day_night_flag"
    ]

    X = df[feature_cols]
    y = df["target"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    print("Training XGBoost Multi-Class Classifier (objective='multi:softprob', max_depth=6, n_estimators=100)...")
    clf = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        objective="multi:softprob",
        num_class=7,
        subsample=0.85,
        colsample_bytree=0.85,
        random_state=42
    )

    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"XGBoost Test Accuracy: {acc*100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=CLASSES))

    # Feature Importances
    importances = dict(zip(feature_cols, clf.feature_importances_.tolist()))
    print("\nXGBoost Feature Importances:")
    for f, imp in sorted(importances.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {f:20s}: {imp:.4f}")

    # Export Model Artifacts
    clf.save_model(str(MODEL_JSON_PATH))
    print(f"\nSaved XGBoost Model JSON to: {MODEL_JSON_PATH}")

    # Export lightweight rules schema for browser JavaScript runtime
    metadata = {
        "model": "XGBoost Multi-Class Fire Classifier v1.0",
        "classes": CLASSES,
        "features": feature_cols,
        "feature_importances": importances,
        "accuracy": round(float(acc), 4),
        "class_colors": {
            "INDUSTRIAL_HIGH_ALERT": "#ef4444",  # Red
            "FACTORY": "#f97316",                # Orange
            "HEAT_RING": "#eab308",              # Yellow
            "WILDFIRE": "#22c55e",               # Green
            "CROP": "#b45309",                   # Brown
            "MINE": "#a855f7",                   # Purple
            "UNKNOWN": "#64748b"                 # Gray
        }
    }
    with open(RULES_JSON_PATH, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"Saved Metadata Schema to: {RULES_JSON_PATH}")

if __name__ == "__main__":
    main()
