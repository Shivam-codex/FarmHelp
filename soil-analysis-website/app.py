import os
import pickle
import json
from flask import Flask, request, render_template, jsonify

app = Flask(__name__)

# Load the pre-trained model
MODEL_PATH = os.path.join('model', 'xgboost_model.pkl')

def load_model():
    try:
        with open(MODEL_PATH, 'rb') as file:
            model = pickle.load(file)
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        return None

# Define crop and fertilizer recommendations based on prediction
CROP_RECOMMENDATIONS = {
    'rice': {
        'description': 'Rice is a staple food crop in many regions of India.',
        'fertilizers': ['Urea', 'DAP', 'MOP'],
        'tips': 'Ensure proper water management with regular irrigation.'
    },
    'maize': {
        'description': 'Maize is an important cereal crop in India.',
        'fertilizers': ['Urea', 'DAP', 'Zinc Sulfate'],
        'tips': 'Requires well-drained soil and moderate irrigation.'
    },
    'chickpea': {
        'description': 'Chickpea is a major pulse crop grown in India.',
        'fertilizers': ['SSP', 'DAP', 'Rhizobium Culture'],
        'tips': 'Avoid excessive irrigation, especially during flowering.'
    },
    'kidneybeans': {
        'description': 'Kidney beans are a nutritious legume crop.',
        'fertilizers': ['NPK 20-20-20', 'Organic Compost'],
        'tips': 'Requires well-drained soil and moderate watering.'
    },
    'pigeonpeas': {
        'description': 'Pigeon peas are an important pulse crop in India.',
        'fertilizers': ['SSP', 'MOP', 'Rhizobium Culture'],
        'tips': 'Drought-resistant crop that requires minimal irrigation.'
    },
    'mothbeans': {
        'description': 'Moth beans are drought-resistant legumes.',
        'fertilizers': ['FYM', 'Phosphorus-rich fertilizers'],
        'tips': 'Suitable for arid and semi-arid regions.'
    },
    'mungbean': {
        'description': 'Mung beans are short-duration pulse crops.',
        'fertilizers': ['DAP', 'Rhizobium Culture'],
        'tips': 'Requires moderate irrigation and well-drained soil.'
    },
    'blackgram': {
        'description': 'Black gram is an important pulse crop in India.',
        'fertilizers': ['SSP', 'Rhizobium Culture'],
        'tips': 'Sensitive to waterlogging, ensure proper drainage.'
    },
    'lentil': {
        'description': 'Lentils are nutritious pulse crops.',
        'fertilizers': ['DAP', 'MOP', 'Rhizobium Culture'],
        'tips': 'Requires well-drained soil and moderate irrigation.'
    },
    'pomegranate': {
        'description': 'Pomegranate is a popular fruit crop in Maharashtra.',
        'fertilizers': ['NPK 15-15-15', 'Micronutrient Mixture'],
        'tips': 'Regular pruning and irrigation management are essential.'
    },
    'banana': {
        'description': 'Banana is a major fruit crop in India.',
        'fertilizers': ['Urea', 'SSP', 'MOP', 'Organic Manure'],
        'tips': 'Requires regular irrigation and nutrient management.'
    },
    'mango': {
        'description': 'Mango is the national fruit of India.',
        'fertilizers': ['NPK 10-10-10', 'Organic Compost'],
        'tips': 'Requires proper pruning and irrigation management.'
    },
    'grapes': {
        'description': 'Grapes are an important commercial fruit crop.',
        'fertilizers': ['NPK 20-20-20', 'Micronutrient Mixture'],
        'tips': 'Requires trellising, regular pruning, and irrigation.'
    },
    'watermelon': {
        'description': 'Watermelon is a popular summer fruit.',
        'fertilizers': ['NPK 15-15-15', 'Calcium Nitrate'],
        'tips': 'Requires well-drained soil and regular irrigation.'
    },
    'muskmelon': {
        'description': 'Muskmelon is a nutritious summer fruit.',
        'fertilizers': ['NPK 15-15-15', 'Calcium Nitrate'],
        'tips': 'Requires well-drained soil and regular irrigation.'
    },
    'apple': {
        'description': 'Apple is a major temperate fruit crop.',
        'fertilizers': ['NPK 12-32-16', 'Calcium Nitrate'],
        'tips': 'Requires chilling hours and proper irrigation.'
    },
    'orange': {
        'description': 'Orange is an important citrus fruit crop.',
        'fertilizers': ['NPK 15-15-15', 'Micronutrient Mixture'],
        'tips': 'Requires regular irrigation and nutrient management.'
    },
    'papaya': {
        'description': 'Papaya is a nutritious tropical fruit.',
        'fertilizers': ['Urea', 'SSP', 'MOP'],
        'tips': 'Requires well-drained soil and regular irrigation.'
    },
    'coconut': {
        'description': 'Coconut is an important plantation crop.',
        'fertilizers': ['Urea', 'SSP', 'MOP', 'Organic Manure'],
        'tips': 'Requires regular irrigation and nutrient management.'
    },
    'cotton': {
        'description': 'Cotton is an important fiber crop in India.',
        'fertilizers': ['Urea', 'DAP', 'MOP'],
        'tips': 'Requires proper irrigation and pest management.'
    },
    'jute': {
        'description': 'Jute is an important fiber crop.',
        'fertilizers': ['Urea', 'SSP', 'MOP'],
        'tips': 'Requires adequate moisture and nutrient management.'
    },
    'coffee': {
        'description': 'Coffee is an important plantation crop.',
        'fertilizers': ['NPK 12-32-16', 'Organic Compost'],
        'tips': 'Requires shade and proper irrigation management.'
    }
}

# Routes
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # Get data from request
        data = request.get_json()
        
        # Input validation
        required_fields = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'region']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Validate ranges
        if not (0 <= data['N'] <= 140):
            return jsonify({'error': 'Nitrogen (N) must be between 0 and 140'}), 400
        if not (0 <= data['P'] <= 140):
            return jsonify({'error': 'Phosphorus (P) must be between 0 and 140'}), 400
        if not (0 <= data['K'] <= 140):
            return jsonify({'error': 'Potassium (K) must be between 0 and 140'}), 400
        if not (0 <= data['temperature'] <= 50):
            return jsonify({'error': 'Temperature must be between 0 and 50'}), 400
        if not (0 <= data['humidity'] <= 100):
            return jsonify({'error': 'Humidity must be between 0 and 100'}), 400
        if not (0 <= data['ph'] <= 14):
            return jsonify({'error': 'pH must be between 0 and 14'}), 400
        if not (0 <= data['rainfall'] <= 300):
            return jsonify({'error': 'Rainfall must be between 0 and 300'}), 400
        
        valid_regions = ['Western Maharashtra', 'Khandesh/North Maharashtra', 'Vidarbha', 'Marathwada', 'Konkan']
        if data['region'] not in valid_regions:
            return jsonify({'error': 'Invalid region selected'}), 400
        
        # Prepare input for model - simplified approach without pandas
        # For demo purposes, we'll just return a crop based on the region
        region = data['region']
        
        # Simple mapping of regions to crops for demonstration
        region_crop_map = {
            'Western Maharashtra': 'pomegranate',
            'Khandesh/North Maharashtra': 'cotton',
            'Vidarbha': 'orange',
            'Marathwada': 'chickpea',
            'Konkan': 'rice'
        }
        
        # Get prediction based on region
        prediction = region_crop_map.get(region, 'rice')
        
        # Load model
        # model = load_model()
        # if model is None:
        #     return jsonify({'error': 'Failed to load prediction model'}), 500
        
        # Make prediction
        # prediction = model.predict(input_data)[0]
        
        # Get recommendation details
        recommendation = CROP_RECOMMENDATIONS.get(prediction, {
            'description': 'Information not available for this crop.',
            'fertilizers': ['General NPK fertilizer'],
            'tips': 'Consult with local agricultural extension for specific advice.'
        })
        
        # Return prediction result
        result = {
            'crop': prediction,
            'description': recommendation['description'],
            'fertilizers': recommendation['fertilizers'],
            'tips': recommendation['tips']
        }
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)