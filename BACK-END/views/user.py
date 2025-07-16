from flask import request, jsonify, Blueprint
from models import db, User
from flask_jwt_extended import jwt_required, get_jwt_identity
from views.auth import token_required

user_bp = Blueprint("user_bp", __name__)

# get all users "ADMIN"
@user_bp.route("/api/users", methods=["GET"])
@jwt_required()
def get_all_users():
    users = User.query.all()
    return jsonify([{
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_admin": user.is_admin,
        "is_active": user.is_active,
    } for user in users]), 200

# get user by id "ADMIN"
@user_bp.route("/api/users/<user_id>", methods=["GET"])
@jwt_required()
def get_user_by_id(user_id):
    user = user.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_admin": user.is_admin,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat(),
        "updated_at": user.updated_at.isoformat(),
        'questions': [{
            'id': q.id,
            'title': q.title,
            'description': q.description,
            'is_solved': q.is_solved,
            'created_at': q.created_at.isoformat(),
            'language': q.language
        } for q in user.questions],
        'answers': [{
            'id': a.id,
            'content': a.content[:100] + '...' if len(a.content) > 150 else a.content,
            'id': a.id,
            'question_title': a.question.title,
            'vote_count': a.vote_count,
            'created_at': a.created_at.isoformat()
        } for a in user.answers]
    }
    return jsonify(user_data), 200

# update user
@user_bp.route("/api/users/<user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    if 'username' in data:
        user.username = data['username']
    if 'email' in data:
        user.email = data['email']
    if 'is_active' in data:
        user.is_active = data['is_active']
    if 'is_admin' in data:
        user.is_admin = data['is_admin']

    db.session.commit()
    return jsonify({"success": "User updated successfully"}), 200

# delete user
@user_bp.route("/api/users/<user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({"error": "Unauthorized"}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()
    return jsonify({"success": "User deleted successfully"}), 200