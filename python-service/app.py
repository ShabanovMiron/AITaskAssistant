from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def analyze_text(text: str):
    text_lower = text.lower()

    # Приоритет
    if any(word in text_lower for word in ['срочно', 'пятница', 'сегодня', 'аврал']):
        priority = 'high'
    elif any(word in text_lower for word in ['важно', 'скоро', 'завтра']):
        priority = 'medium'
    else:
        priority = 'low'

    # Категория
    if any(word in text_lower for word in ['презентация', 'клиент', 'встреча', 'переговоры']):
        category = 'business'
    elif any(word in text_lower for word in ['отчет', 'анализ', 'исследование']):
        category = 'analytics'
    elif any(word in text_lower for word in ['документ', 'письмо', 'контракт', 'договор']):
        category = 'documentation'
    else:
        category = 'general'

    return {'priority': priority, 'category': category}

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'No text provided'}), 400

    text = data['text']
    if not isinstance(text, str) or len(text.strip()) == 0:
        return jsonify({'error': 'Text must be a non-empty string'}), 400

    result = analyze_text(text)
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)