# ml/app.py
from fastapi import FastAPI, HTTPException
from pymongo import MongoClient
from bson import ObjectId
import pandas as pd
import joblib, os
from datetime import date, timedelta

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "timsdb")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

app = FastAPI()

def get_recent_series(product_id, days=30):
    try:
        oid = ObjectId(product_id)
    except:
        return []
    docs = list(db.transactions.find({"product_id": oid}).sort("ts", 1))
    if not docs:
        return []
    df = pd.DataFrame(docs)
    df['ts'] = pd.to_datetime(df['ts'])
    df['demand'] = df.apply(lambda r: r['qty'] if r['type']=='out' else 0, axis=1)
    series = df.set_index('ts').resample('D')['demand'].sum().fillna(0)
    return series[-days:]

@app.get("/forecast")
def forecast(product_id: str, horizon: int = 7):
    series = get_recent_series(product_id, days=60)
    if len(series) == 0:
        raise HTTPException(status_code=404, detail="No data for this product")

    model_path = f"model_{product_id}.pkl"
    preds = []
    today = date.today()

    if os.path.exists(model_path):
        model = joblib.load(model_path)
        # rolling forecast
        last = series.copy()
        for h in range(horizon):
            lag_1 = last.iloc[-1]
            lag_7 = last[-7:].mean()
            lag_14 = last[-14:].mean() if len(last) >= 14 else lag_7
            rolling_7 = last[-7:].mean()
            X = [[lag_1, lag_7, lag_14, rolling_7]]
            p = max(0, float(model.predict(X)[0]))
            preds.append({'date': (today+timedelta(days=h)).isoformat(), 'demand_pred': p})
            last = last.append(pd.Series([p], index=[pd.Timestamp(today+timedelta(days=h))]))
    else:
        # fallback: moving average
        ma = float(series.tail(14).mean())
        preds = [{'date': (today+timedelta(days=h)).isoformat(), 'demand_pred': ma} for h in range(horizon)]

    return {'product_id': product_id, 'forecast': preds}
