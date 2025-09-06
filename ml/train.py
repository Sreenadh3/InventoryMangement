# ml/train.py
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_percentage_error
from pymongo import MongoClient
from bson import ObjectId
import os

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "timsdb")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

def load_transactions():
    docs = list(db.transactions.find({}))
    if not docs:
        return pd.DataFrame()
    df = pd.DataFrame(docs)
    df['ts'] = pd.to_datetime(df['ts'])
    return df

def prepare_daily(df):
    # demand = qty for 'out' transactions
    df['demand'] = df.apply(lambda r: r['qty'] if r['type'] == 'out' else 0, axis=1)
    df['date'] = df['ts'].dt.date
    daily = df.groupby(['product_id','date'])['demand'].sum().reset_index()

    # fill missing dates per product
    dfs = []
    for pid, g in daily.groupby('product_id'):
        g = g.set_index('date').reindex(
            pd.date_range(g['date'].min(), g['date'].max(), freq='D'),
            fill_value=0
        )
        g.index.name = 'date'
        g = g.reset_index().rename(columns={'index':'date'})
        g['product_id'] = pid
        dfs.append(g)
    return pd.concat(dfs, ignore_index=True)

def make_features(df, lags=[1,7,14]):
    df = df.copy()
    df.sort_values(['product_id','date'], inplace=True)
    for lag in lags:
        df[f'lag_{lag}'] = df.groupby('product_id')['demand'].shift(lag).fillna(0)
    df['rolling_7'] = df.groupby('product_id')['demand'].transform(lambda x: x.rolling(7, min_periods=1).mean())
    df.dropna(inplace=True)
    return df

def train_and_save(df):
    models = {}
    results = []
    for pid, g in df.groupby('product_id'):
        if len(g) < 30:
            continue
        train = g.iloc[:-14]
        test = g.iloc[-14:]

        X_cols = [c for c in g.columns if c.startswith('lag_') or c == 'rolling_7']
        X_train, y_train = train[X_cols], train['demand']
        X_test, y_test = test[X_cols], test['demand']

        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        preds = model.predict(X_test).clip(0)

        mape = mean_absolute_percentage_error(y_test, preds)
        results.append({'product_id': str(pid), 'mape': float(mape)})

        # save model
        joblib.dump(model, f"model_{pid}.pkl")

    results_df = pd.DataFrame(results)
    if not results_df.empty:
        print("Training results:")
        print(results_df.sort_values('mape').head(10))
        results_df.to_csv("training_results.csv", index=False)
    else:
        print("⚠️ No products with enough data to train.")

if __name__ == '__main__':
    df = load_transactions()
    if df.empty:
        print("⚠️ No transactions found in MongoDB.")
        exit()
    daily = prepare_daily(df)
    feat = make_features(daily)
    train_and_save(feat)
