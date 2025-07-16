from flask import Blueprint, request, jsonify
from models import db, Notifications
from views.auth import token_required

notification_bp = Blueprint('notifications', __name__, url_prefix='/notifications')


# Create a new notification (Admin only)
@notification_bp.route('/', methods=['POST'])
@token_required
def create_notification(current_user):
    if not current_user.is_admin:
        return jsonify({'message': 'Admin privileges required'}), 403

    data = request.get_json()
    user_id = data.get('user_id')
    notif_type = data.get('type')
    message = data.get('message')

    if not all([user_id, notif_type, message]):
        return jsonify({'error': 'user_id, type, and message are required'}), 400

    notification = Notifications(
        user_id=user_id,
        type=notif_type,
        message=message
    )
    db.session.add(notification)
    db.session.commit()

    return jsonify({'message': 'Notification created', 'id': notification.id}), 201


# Get all notifications for the current user
@notification_bp.route('/', methods=['GET'])
@token_required
def get_user_notifications(current_user):
    notifications = Notifications.query.filter_by(user_id=current_user.id).order_by(Notifications.created_at.desc()).all()
    return jsonify([
        {
            'id': n.id,
            'type': n.type,
            'message': n.message,
            'created_at': n.created_at,
            'is_read': n.is_read
        } for n in notifications
    ]), 200


# Get a single notification by ID (only for owner or admin)
@notification_bp.route('/<int:notification_id>', methods=['GET'])
@token_required
def get_notification(current_user, notification_id):
    notification = Notifications.query.get(notification_id)
    if not notification:
        return jsonify({'message': 'Notification not found'}), 404

    if notification.user_id != current_user.id and not current_user.is_admin:
        return jsonify({'message': 'Access denied'}), 403

    return jsonify({
        'id': notification.id,
        'type': notification.type,
        'message': notification.message,
        'created_at': notification.created_at,
        'is_read': notification.is_read
    }), 200


# Update a notification's read status (only owner or admin)
@notification_bp.route('/<int:notification_id>', methods=['PUT'])
@token_required
def update_notification(current_user, notification_id):
    notification = Notifications.query.get(notification_id)
    if not notification:
        return jsonify({'message': 'Notification not found'}), 404

    if notification.user_id != current_user.id and not current_user.is_admin:
        return jsonify({'message': 'Access denied'}), 403

    data = request.get_json()
    is_read = data.get('is_read')

    if is_read is not None:
        notification.is_read = is_read
        db.session.commit()
        return jsonify({'message': 'Notification updated'}), 200
    else:
        return jsonify({'error': 'Missing is_read field'}), 400


# Delete a notification (only owner or admin)
@notification_bp.route('/<int:notification_id>', methods=['DELETE'])
@token_required
def delete_notification(current_user, notification_id):
    notification = Notifications.query.get(notification_id)
    if not notification:
        return jsonify({'message': 'Notification not found'}), 404

    if notification.user_id != current_user.id and not current_user.is_admin:
        return jsonify({'message': 'Access denied'}), 403

    db.session.delete(notification)
    db.session.commit()
    return jsonify({'message': 'Notification deleted'}), 200
