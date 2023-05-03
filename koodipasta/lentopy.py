import random
import time

import mysql.connector
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Gr007",
    database="flight_game"
)

cursor = connection.cursor()

types = {
    "balloonport": ("Balloonport", 1, range(4, 6), 0.3),
    "heliport": ("Heliport", range(400,600), range(200, 400), 150),
    "seaplane_base": ("Seaplane Base", 1, range(4, 6), 3),
    "small_airport": ("Regional Airport", range(500,1500), range(300, 800), 200),
    "medium_airport": ("National Ariport", range(1000,5000), range(800, 3800), 600),
    "large_airport": ("International Airport", range(20000,40000), range(18000, 30000), 15000)
}

money_multiplier = 100000

@app.route('/get_all')
def get_all():
    cursor.execute("SELECT name FROM airport WHERE type NOT IN ('closed', 'balloonport', 'heliport', 'seaplane_base')")
    cursor_data = cursor.fetchall()
    return jsonify([str(item[0]) for item in cursor_data])

@app.route('/new_airport/<name>')
def new_airport(name):
    name = str(name)
    time.sleep(2)
    print()
    print(name)
    try:
        cursor.execute(f"SELECT type, iso_region, iso_country, continent, latitude_deg, longitude_deg  FROM airport WHERE name = '{name}'")
    except:
        print("bruh")
    print("Cursor passed!")
    cursor_data = cursor.fetchone()

    type_ = types[cursor_data[0]]
    price_range = type_[1]
    revenue_range = type_[2]

    price = random.randint(price_range.start, price_range.stop) * money_multiplier

    data = {
        "name": name,
        "price": price,
        "revenue": random.randint(revenue_range.start, revenue_range.stop) * money_multiplier,
        "price_sell": price*0.7,
        "repair_cost": type_[3] * money_multiplier,
        "latitude": cursor_data[4],
        "longitude": cursor_data[5],
        "region": cursor_data[1],
        "country": cursor_data[2],
        "continent": cursor_data[3],
    }

    print(data)

    return jsonify(data)


if __name__ == '__main__':
    app.config['JSON_SORT_KEYS'] = False
    app.run(use_reloader=True, host='127.0.0.1', port=3000)