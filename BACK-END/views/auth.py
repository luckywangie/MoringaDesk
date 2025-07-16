from flask import Blueprint, request, jsonify, current_app
from google.oauth2 import id_token
from google.auth.transport import requests as grequests
import jwt
import datetime
from functools import wraps

auth_bp = Blueprint('auth', __name__)

GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"

# Simulated user DB (replace with real DB in production)
users_db = {}

# JWT Token generator
def generate_jwt(user_id, email):
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1)
    }
    token = jwt.encode(payload, current_app.config['SECRET_KEY'], algorithm='HS256')
    return token

# Middleware to protect routes
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({'error': 'Token is missing'}), 401

        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            request.user_id = data['user_id']
            request.user_email = data['email']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

        return f(*args, **kwargs)
    return decorated

# Google Auth route
@auth_bp.route('/api/auth/google', methods=['POST'])
def google_auth():
    data = request.get_json()
    token = data.get('token')

    if not token:
        return jsonify({"error": "Missing token"}), 400

    try:
        idinfo = id_token.verify_oauth2_token(token, grequests.Request(), GOOGLE_CLIENT_ID)

        user_email = idinfo['email']
        user_name = idinfo.get('name')
        user_picture = idinfo.get('picture')

        # Register if new user
        if user_email not in users_db:
            users_db[user_email] = {
                'id': len(users_db) + 1,
                'email': user_email,
                'name': user_name,
                'picture': user_picture
            }
            message = "User registered and logged in"
        else:
            message = "User logged in"

        user = users_db[user_email]
        jwt_token = generate_jwt(user['id'], user_email)

        return jsonify({
            "message": message,
            "user": user,
            "token": jwt_token
        })

    except ValueError as e:
        return jsonify({"error": "Invalid token", "details": str(e)}), 401

# Dev login for testing (no Google required)
@auth_bp.route('/api/auth/dev', methods=['POST'])
def dev_login():
    data = request.get_json()
    email = data.get('email', 'test@example.com')
    user_id = 999  # Static or test user ID
    jwt_token = generate_jwt(user_id, email)

    return jsonify({
        "message": "Dev token generated",
        "token": jwt_token
    })
