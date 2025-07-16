# auth.py
from flask import Blueprint, request, jsonify
from google.oauth2 import id_token
from google.auth.transport import requests as grequests

auth_bp = Blueprint('auth', __name__)

# Replace this with your actual Google Client ID from Google Cloud Console
GOOGLE_CLIENT_ID = "YOUR_GOOGLE_CLIENT_ID"

# Simulated user database (replace this with a real DB in production)
users_db = {}

@auth_bp.route('/api/auth/google', methods=['POST'])
def google_auth():
    data = request.get_json()
    token = data.get('token')

    if not token:
        return jsonify({"error": "Missing token"}), 400

    try:
        # Verify the ID token with Google's OAuth2 server
        idinfo = id_token.verify_oauth2_token(token, grequests.Request(), GOOGLE_CLIENT_ID)

        # Extract user details
        user_email = idinfo['email']
        user_name = idinfo.get('name')
        user_picture = idinfo.get('picture')

        # Simulate register if user doesn't exist
        if user_email not in users_db:
            users_db[user_email] = {
                'email': user_email,
                'name': user_name,
                'picture': user_picture,
            }
            message = "User registered and logged in"
        else:
            message = "User logged in"

        return jsonify({
            "message": message,
            "user": users_db[user_email]
        })

    except ValueError as e:
        # Invalid token
        return jsonify({"error": "Invalid token", "details": str(e)}), 401
