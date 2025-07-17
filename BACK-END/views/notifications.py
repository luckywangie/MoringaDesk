from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Notifications, User

notification_bp = Blueprint('notification_bp', __name__, url_prefix='/api')

# Serializer
def serialize_notification(notification):
    return {
        'id': notification.id,
        'user_id': notification.user_id,
        'type': notification.type,
        'message': notification.message,
        'created_at': notification.created_at.strftime('%a, %d %b %Y %H:%M:%S GMT'),
        'is_read': notification.is_read
    }

# CREATE a notification
@notification_bp.route('/notifications', methods=['POST'])
@jwt_required()
def create_notification():
    data = request.get_json()
    user_id = data.get('user_id')  # Admin can specify this
    current_user = get_jwt_identity()  # noqa: F841

    type = data.get('type')
    message = data.get('message')

    if not user_id or not type or not message:
        return jsonify({'message': 'user_id, type, and message are required'}), 400

    notification = Notifications(
        user_id=user_id,
        type=type,
        message=message
    )
    db.session.add(notification)
    db.session.commit()

    return jsonify({'message': 'Notification created', 'notification': serialize_notification(notification)}), 201

# READ all notifications (admin only)
@notification_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_all_notifications():
    current_user = get_jwt_identity()
    user = User.query.get(current_user)
    if not user.is_admin:
        return jsonify({'message': 'Admin access required'}), 403

    notifications = Notifications.query.order_by(Notifications.created_at.desc()).all()
    return jsonify([serialize_notification(n) for n in notifications]), 200

# READ my notifications (authenticated user)
@notification_bp.route('/notifications/me', methods=['GET'])
@jwt_required()
def get_my_notifications():
    current_user = get_jwt_identity()
    notifications = Notifications.query.filter_by(user_id=current_user).order_by(Notifications.created_at.desc()).all()
    return jsonify([serialize_notification(n) for n in notifications]), 200

# READ one notification
@notification_bp.route('/notifications/<int:id>', methods=['GET'])
@jwt_required()
def get_notification(id):
    notification = Notifications.query.get(id)
    if not notification:
        return jsonify({'message': 'Notification not found'}), 404

    current_user = get_jwt_identity()
    if notification.user_id != current_user:
        return jsonify({'message': 'Unauthorized'}), 403

    return jsonify(serialize_notification(notification)), 200

# UPDATE notification (mark as read/unread)
@notification_bp.route('/notifications/<int:id>', methods=['PUT'])
@jwt_required()
def update_notification(id):
    notification = Notifications.query.get(id)
    if not notification:
        return jsonify({'message': 'Notification not found'}), 404

    current_user = get_jwt_identity()
    if notification.user_id != current_user:
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json()
    notification.is_read = data.get('is_read', notification.is_read)

    db.session.commit()
    return jsonify({'message': 'Notification updated', 'notification': serialize_notification(notification)}), 200

# DELETE notification
@notification_bp.route('/notifications/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_notification(id):
    notification = Notifications.query.get(id)
    if not notification:
        return jsonify({'message': 'Notification not found'}), 404

    current_user = get_jwt_identity()
    user = User.query.get(current_user)

    # Only the owner or admin can delete
    if notification.user_id != current_user and not user.is_admin:
        return jsonify({'message': 'Unauthorized'}), 403

    db.session.delete(notification)
    db.session.commit()
    return jsonify({'message': 'Notification deleted'}), 200
