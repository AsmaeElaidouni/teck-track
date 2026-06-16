import pandas as pd
from typing import List
from datetime import datetime
from sklearn.linear_model import LinearRegression
from app.schemas import PartStock

def predict_stock_depletion(parts: List[PartStock]) -> List[dict]:
    """
    Analyse l'historique de consommation de chaque pièce pour prédire
    combien de jours il reste avant d'atteindre le seuil critique (minThreshold).
    """
    predictions = []
    current_date = datetime.now()

    for part in parts:
        if part.stock <= part.minThreshold:
            predictions.append({
                "partId": part.id,
                "partName": part.name,
                "status": "CRITICAL",
                "message": "Stock déjà en dessous ou égal au seuil critique.",
                "days_remaining": 0
            })
            continue
            
        if not part.consumptions:
            predictions.append({
                "partId": part.id,
                "partName": part.name,
                "status": "SAFE",
                "message": "Pas assez de données de consommation pour prédire.",
                "days_remaining": -1
            })
            continue

        # Convertir les données en DataFrame pandas
        df = pd.DataFrame([c.model_dump() if hasattr(c, "model_dump") else c.dict() for c in part.consumptions])
        df['createdAt'] = pd.to_datetime(df['createdAt'])
        
        # Agréger par jour pour voir la consommation quotidienne
        df['date'] = df['createdAt'].dt.date
        daily_consumption = df.groupby('date')['quantity'].sum().reset_index()
        daily_consumption['date'] = pd.to_datetime(daily_consumption['date'])
        
        # Si nous n'avons des données que sur un seul jour, impossible de faire une tendance
        if len(daily_consumption) < 2:
            avg_daily = daily_consumption['quantity'].mean()
            if avg_daily > 0:
                days_left = (part.stock - part.minThreshold) / avg_daily
                predictions.append({
                    "partId": part.id,
                    "partName": part.name,
                    "status": "WARNING" if days_left < 7 else "SAFE",
                    "message": "Estimation simple basée sur peu de données.",
                    "days_remaining": max(0, int(days_left))
                })
            continue

        # Utiliser la régression linéaire pour prédire la tendance de consommation
        start_date = daily_consumption['date'].min()
        daily_consumption['days_passed'] = (daily_consumption['date'] - start_date).dt.days
        
        X = daily_consumption[['days_passed']]
        y = daily_consumption['quantity']
        
        model = LinearRegression()
        model.fit(X, y)
        
        # Prédiction du taux de consommation quotidien futur (la pente ou la moyenne lissée)
        avg_rate = max(y.mean(), model.predict([[daily_consumption['days_passed'].max() + 1]])[0])
        
        if avg_rate <= 0:
            avg_rate = 0.1 # éviter division par zero
            
        days_remaining = (part.stock - part.minThreshold) / avg_rate
        days_remaining = max(0, int(days_remaining))
        
        status = "SAFE"
        if days_remaining <= 7:
            status = "CRITICAL"
        elif days_remaining <= 15:
            status = "WARNING"
            
        predictions.append({
            "partId": part.id,
            "partName": part.name,
            "status": status,
            "message": f"Rupture de stock estimée dans environ {days_remaining} jours.",
            "days_remaining": days_remaining,
            "predicted_daily_consumption": round(avg_rate, 2)
        })

    return predictions
