import jwt
import datetime
from flask import Blueprint, request, jsonify
from models import db, User
from functools import wraps
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from werkzeug.security import generate_password_hash, check_password_hash

# ✅ Set up blueprint with prefix
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

# 🔐 Configuration (Use environment variables in production)
SECRET_KEY = 'moringa_secret_2025'
GOOGLE_CLIENT_ID = 'your-google-client-id.apps.googleusercontent.com'  # Replace this with your real client ID

# -------------------- JWT Helpers --------------------

def generate_jwt(user):
    payload = {
        'sub': str(user.id),  # ✅ Added for compatibility with JWT libraries that expect a subject
        'id': user.id,
        'email': user.email,
        'username': user.username,
        'is_admin': user.is_admin,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def decode_jwt(token):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            try:
                token = request.headers['Authorization'].split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        data = decode_jwt(token)
        if not data:
            return jsonify({'message': 'Token is invalid or expired!'}), 401

        user = User.query.get(data['id'])
        if not user:
            return jsonify({'message': 'User not found'}), 404

        return f(user, *args, **kwargs)
    return decorated

# -------------------- Routes --------------------

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not all([username, email, password]):
        return jsonify({'message': 'Missing required fields'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already registered'}), 400

    hashed_password = generate_password_hash(password)

    user = User(username=username, email=email, password=hashed_password)
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'message': 'Missing email or password'}), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid email or password'}), 401

    token = generate_jwt(user)
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_admin': user.is_admin
        }
    }), 200

@auth_bp.route('/google-login', methods=['POST'])
def google_login():
    data = request.get_json()
    token = data.get('token')

    try:
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), GOOGLE_CLIENT_ID)

        email = idinfo['email']
        username = idinfo.get('name', email.split('@')[0])

        user = User.query.filter_by(email=email).first()
        if not user:
            # New user from Google
            user = User(username=username, email=email, password='google_oauth')
            db.session.add(user)
            db.session.commit()

        jwt_token = generate_jwt(user)
        return jsonify({
            'token': jwt_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'is_admin': user.is_admin
            }
        }), 200

    except ValueError:
        return jsonify({'message': 'Invalid Google token'}), 400

@auth_bp.route('/me', methods=['GET'])
@token_required
def me(current_user):
    return jsonify({
        'id': current_user.id,
        'username': current_user.username,
        'email': current_user.email,
        'is_admin': current_user.is_admin
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    return jsonify({'message': 'Logged out successfully. Frontend should delete token.'}), 200
