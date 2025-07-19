from flask import Blueprint, request, jsonify
from models import db, User
from .auth import token_required  # fixed: relative import for Blueprint

user_bp = Blueprint('user', __name__, url_prefix='/api/users')

# -------------------- Get All Users (Admin Only) --------------------
@user_bp.route('', methods=['GET'])  # no trailing slash to avoid 404
@token_required
def get_users(current_user):
    if not current_user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403

    users = User.query.all()
    result = [{
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_admin': user.is_admin
    } for user in users]

    return jsonify(result), 200

# -------------------- Get One User --------------------
@user_bp.route('/<int:user_id>', methods=['GET'])
@token_required
def get_user(current_user, user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_admin': user.is_admin
    }), 200

# -------------------- Update User --------------------
@user_bp.route('/<int:user_id>', methods=['PUT'])
@token_required
def update_user(current_user, user_id):
    if int(current_user.id) != int(user_id):
        return jsonify({'error': 'Unauthorized: You can only update your own profile.'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    user.username = data.get('username', user.username)
    user.email = data.get('email', user.email)
    db.session.commit()

    return jsonify({
        'success': 'User updated successfully',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_admin': user.is_admin
        }
    }), 200
    
# -------------------- Activate/Deactivate User (Admin Only) --------------------
@user_bp.route('/<int:user_id>/activate', methods=['PUT'])
@token_required
def activate_user(current_user, user_id):
    if not current_user.is_admin:
        return jsonify({'error': 'Admin access required'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    is_active = data.get('is_active')
    if is_active is None:
        return jsonify({'error': 'is_active (true/false) is required'}), 400

    user.is_active = bool(is_active)
    db.session.commit()

    status = 'activated' if user.is_active else 'deactivated'
    return jsonify({'success': f'User {user.username} {status} successfully', 'is_active': user.is_active}), 200

# -------------------- Delete User (Admin or Self) --------------------
@user_bp.route('/<int:user_id>', methods=['DELETE'])
@token_required
def delete_user(current_user, user_id):
    if current_user.id != user_id and not current_user.is_admin:
        return jsonify({'message': 'Unauthorized: Only the user or an admin can delete this account.'}), 403

    user = User.query.get(user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({'message': f'User {user.username} deleted successfully'}), 200
