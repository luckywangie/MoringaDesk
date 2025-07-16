from flask import request, jsonify, Blueprint
from models import db, User, Votes
from flask_jwt_extended import jwt_required, get_jwt_identity
from views.auth import token_required  # noqa: F401

user_bp = Blueprint("user_bp", __name__)

# Get all users (admin only)
@user_bp.route("/api/users", methods=["GET"])
@jwt_required()
def get_all_users():
    users = User.query.all()
    return jsonify([
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "is_admin": user.is_admin,
            "is_active": user.is_active,
        }
        for user in users
    ]), 200

# Get user by ID
@user_bp.route("/api/users/<int:user_id>", methods=["GET"])
@jwt_required()
def get_user_by_id(user_id):
    user = User.query.get(user_id)
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
        "questions": [
            {
                "id": q.id,
                "title": q.title,
                "description": q.description,
                "is_solved": q.is_solved,
                "created_at": q.created_at.isoformat(),
                "language": q.language,
            }
            for q in user.questions
        ],
        "answers": [
            {
                "id": a.id,
                "content": a.content[:100] + '...' if len(a.content) > 150 else a.content,
                "question_title": a.question.title,
                "vote_count": Votes.query.filter_by(solution_id=a.id).count(),
                "created_at": a.created_at.isoformat(),
            }
            for a in user.answers
        ],
    }
    return jsonify(user_data), 200

# Update user
@user_bp.route("/api/users/<int:user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if str(current_user_id) != str(user_id) and not User.query.get(current_user_id).is_admin:
        return jsonify({"error": "Unauthorized"}), 403

    data = request.get_json()
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    user.is_active = data.get('is_active', user.is_active)
    user.is_admin = data.get('is_admin', user.is_admin)

    db.session.commit()
    return jsonify({"success": "User updated successfully"}), 200

# Delete user
@user_bp.route("/api/users/<int:user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if str(current_user_id) != str(user_id) and not User.query.get(current_user_id).is_admin:
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(user)
    db.session.commit()
    return jsonify({"success": "User deleted successfully"}), 200
