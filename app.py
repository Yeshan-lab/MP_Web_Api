from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import random
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend-backend communication

class MealGenerator:
    def __init__(self):
        self.proteins = []
        self.veggies = []
        self.carbs = []
        self.tips = []
        self.load_data()
    
    def load_data(self):
        """Load Sri Lankan food database"""
        self.proteins = [
            {"name": "Eggs (2 large)", "protein": 12, "cost": "Low", "type": "Animal"},
            {"name": "Canned Sardines (100g)", "protein": 20, "cost": "Medium", "type": "Animal"},
            {"name": "Canned Mackerel (100g)", "protein": 19, "cost": "Medium", "type": "Animal"},
            {"name": "Chicken Liver (100g)", "protein": 24, "cost": "Medium", "type": "Animal"},
            {"name": "Dhal (1 cup cooked)", "protein": 18, "cost": "Very Low", "type": "Plant"},
            {"name": "Chickpeas (1 cup cooked)", "protein": 15, "cost": "Low", "type": "Plant"},
            {"name": "Cottage Cheese (100g)", "protein": 11, "cost": "Medium", "type": "Dairy"},
            {"name": "Plain Curd (1 cup)", "protein": 8, "cost": "Low", "type": "Dairy"},
            {"name": "Dried Fish (50g)", "protein": 25, "cost": "Medium", "type": "Animal"},
            {"name": "Mackerel (100g)", "protein": 19, "cost": "Medium", "type": "Animal"},
        ]

        self.veggies = [
            "Kankun (Water Spinach) Mallung",
            "Mukunuwenna (Alternanthera) Mallung",
            "Gotukola (Centella) Sambol",
            "Cabbage Salad",
            "Spinach (Nivithi) Curry",
            "Bean Curry",
            "Brinjal (Eggplant) Moju",
            "Cucumber Salad",
            "Carrot Salad",
            "Kohila (Lasia Spinosa) Curry"
        ]

        self.carbs = [
            "Red Rice (1 scoop)",
            "White Rice (1 scoop)",
            "Roti (1 piece)",
            "Jak Fruit (1 cup)",
            "Oats (1 cup)",
            "Whole Grain Bread (2 slices)",
            "Sweet Potato (1 medium)",
            "String Hoppers (5 pieces)",
            "Hoppers (2 pieces)",
            "Kurakkan Roti (1 piece)"
        ]

        self.tips = [
            "Spread your protein intake evenly across all meals",
            "Combine rice and dhal to form a complete protein",
            "Fill half your plate with vegetables to feel full",
            "Use minimal oil when cooking - try steaming or baking",
            "Drink plenty of water before meals to reduce appetite",
            "Focus on weight training 3x/week to preserve muscle",
            "Be patient - aim for 0.5kg loss per week (not more)",
            "Get 7-8 hours of sleep for better recovery and hormones",
            "Limit sugary drinks and snacks - they add empty calories",
            "Walk for 30 minutes daily to boost metabolism",
        ]
    
    def generate_meal_plan(self, protein_goal=50):
        """Generate a complete daily meal plan"""
        meal_plan = {
            "breakfast": self.generate_meal("Breakfast"),
            "lunch": self.generate_meal("Lunch"),
            "dinner": self.generate_meal("Dinner"),
            "total_protein": 0,
            "protein_goal": protein_goal,
            "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # Calculate total protein
        meal_plan["total_protein"] = sum(
            meal["protein"]["protein"] for meal in [
                meal_plan["breakfast"],
                meal_plan["lunch"],
                meal_plan["dinner"]
            ]
        )
        
        # Add random tips
        meal_plan["tips"] = random.sample(self.tips, 3)
        
        return meal_plan
    
    def generate_meal(self, meal_type):
        """Generate a single meal"""
        protein = random.choice(self.proteins)
        veggie = random.choice(self.veggies)
        carb = random.choice(self.carbs)
        
        return {
            "type": meal_type,
            "protein": protein,
            "veggie": veggie,
            "carb": carb
        }

# Initialize meal generator
meal_generator = MealGenerator()

# API Routes
@app.route('/')
def serve_frontend():
    return send_from_directory('../frontend', 'index.html')

@app.route('/api/generate-meal-plan', methods=['GET'])
def generate_meal_plan():
    try:
        protein_goal = int(request.args.get('protein_goal', 50))
        meal_plan = meal_generator.generate_meal_plan(protein_goal)
        return jsonify({"success": True, "data": meal_plan})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/api/foods', methods=['GET'])
def get_foods():
    return jsonify({
        "proteins": meal_generator.proteins,
        "veggies": meal_generator.veggies,
        "carbs": meal_generator.carbs
    })

@app.route('/api/tips', methods=['GET'])
def get_tips():
    count = int(request.args.get('count', 3))
    return jsonify({"tips": random.sample(meal_generator.tips, min(count, len(meal_generator.tips)))})

# Serve static files
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend', path)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
