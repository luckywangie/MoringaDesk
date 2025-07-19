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
    user_id = data.get('user_id')
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

# READ all notifications (admin only) with optional pagination & filter
@notification_bp.route('/notifications', methods=['GET'])
@jwt_required()
def get_all_notifications():
    current_user = get_jwt_identity()
    user = User.query.get(current_user)
    if not user.is_admin:
        return jsonify({'message': 'Admin access required'}), 403

    is_read = request.args.get('is_read')
    limit = request.args.get('limit', type=int)
    offset = request.args.get('offset', type=int)

    query = Notifications.query
    if is_read is not None:
        query = query.filter_by(is_read=(is_read.lower() == 'true'))

    query = query.order_by(Notifications.created_at.desc())

    if limit is not None:
        query = query.limit(limit)
    if offset is not None:
        query = query.offset(offset)

    notifications = query.all()
    return jsonify([serialize_notification(n) for n in notifications]), 200

# READ my notifications with optional filter and pagination
@notification_bp.route('/notifications/me', methods=['GET'])
@jwt_required()
def get_my_notifications():
    current_user = get_jwt_identity()
    is_read = request.args.get('is_read')
    limit = request.args.get('limit', type=int)
    offset = request.args.get('offset', type=int)

    query = Notifications.query.filter_by(user_id=current_user)
    if is_read is not None:
        query = query.filter_by(is_read=(is_read.lower() == 'true'))

    query = query.order_by(Notifications.created_at.desc())

    if limit is not None:
        query = query.limit(limit)
    if offset is not None:
        query = query.offset(offset)

    notifications = query.all()
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

    if notification.user_id != current_user and not user.is_admin:
        return jsonify({'message': 'Unauthorized'}), 403

    db.session.delete(notification)
    db.session.commit()
    return jsonify({'message': 'Notification deleted'}), 200

# MARK ALL as read
@notification_bp.route('/notifications/mark-all-read', methods=['PUT'])
@jwt_required()
def mark_all_notifications_read():
    current_user = get_jwt_identity()
    notifications = Notifications.query.filter_by(user_id=current_user, is_read=False).all()

    for notification in notifications:
        notification.is_read = True

    db.session.commit()
    return jsonify({'message': 'All notifications marked as read'}), 200
