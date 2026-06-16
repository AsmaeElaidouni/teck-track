import mysql.connector
from datetime import datetime, timedelta
import json

# Configuration de la base de données
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "maintenance_db"
}

def analyze_stock_ia():
    try:
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor(dictionary=True)

        # 1. Récupérer les pièces et leur stock actuel
        cursor.execute("SELECT id, name, stock FROM Part")
        parts = cursor.fetchall()

        results = []

        for part in parts:
            # 2. Récupérer la consommation des 30 derniers jours pour cette pièce
            query = """
                SELECT SUM(quantity) as total_used 
                FROM Consumption 
                WHERE partId = %s AND createdAt >= %s
            """
            thirty_days_ago = datetime.now() - timedelta(days=30)
            cursor.execute(query, (part['id'], thirty_days_ago))
            result = cursor.fetchone()
            
            # Handling None case if total_used is null in DB
            total_used = int(result['total_used']) if result['total_used'] else 0
            daily_avg = total_used / 30

            part_prediction = {
                "id": part['id'],
                "name": part['name'],
                "current_stock": part['stock'],
                "daily_avg": round(daily_avg, 2),
                "status": "stable",
                "days_left": None,
                "prediction_date": None,
                "message": ""
            }

            # 3. Prédiction (Logique IA Simple)
            if daily_avg > 0:
                days_left = part['stock'] / daily_avg
                part_prediction['days_left'] = int(days_left)
                prediction_date = datetime.now() + timedelta(days=days_left)
                part_prediction['prediction_date'] = prediction_date.strftime('%Y-%m-%d')
                
                if days_left < 7:
                    part_prediction['status'] = "critical"
                    part_prediction['message'] = f"Rupture prévue dans {int(days_left)} jours"
                else:
                    part_prediction['status'] = "stable"
                    part_prediction['message'] = f"Autonomie estimée à {int(days_left)} jours"
            else:
                part_prediction['status'] = "stable"
                part_prediction['message'] = "Aucune consommation récente."

            results.append(part_prediction)

        cursor.close()
        conn.close()

        # Output the JSON
        print(json.dumps({"success": True, "data": results}))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    analyze_stock_ia()
