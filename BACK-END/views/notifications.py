from flask import Blueprint, request, jsonify
from models import db, Notifications, User  # noqa: F401
from views.auth import token_required


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

# CREATE a notification (used by other services, not users directly)
@notification_bp.route('/notifications', methods=['POST'])
@token_required
def create_notification(current_user):
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

# READ all notifications (admin only)
@notification_bp.route('/notifications', methods=['GET'])
@token_required
def get_all_notifications(current_user):
    if not current_user.is_admin:
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

# READ my notifications
@notification_bp.route('/notifications/me', methods=['GET'])
@token_required
def get_my_notifications(current_user):
    is_read = request.args.get('is_read')
    limit = request.args.get('limit', type=int)
    offset = request.args.get('offset', type=int)

    query = Notifications.query.filter_by(user_id=current_user.id)
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
@token_required
def get_notification(current_user, id):
    notification = Notifications.query.get(id)
    if not notification:
        return jsonify({'message': 'Notification not found'}), 404

    if notification.user_id != current_user.id:
        return jsonify({'message': 'Unauthorized'}), 403

    return jsonify(serialize_notification(notification)), 200

# UPDATE notification
@notification_bp.route('/notifications/<int:id>', methods=['PUT'])
@token_required
def update_notification(current_user, id):
    notification = Notifications.query.get(id)
    if not notification:
        return jsonify({'message': 'Notification not found'}), 404

    if notification.user_id != current_user.id:
        return jsonify({'message': 'Unauthorized'}), 403

    data = request.get_json()
    notification.is_read = data.get('is_read', notification.is_read)

    db.session.commit()
    return jsonify({'message': 'Notification updated', 'notification': serialize_notification(notification)}), 200

# DELETE notification
@notification_bp.route('/notifications/<int:id>', methods=['DELETE'])
@token_required
def delete_notification(current_user, id):
    notification = Notifications.query.get(id)
    if not notification:
        return jsonify({'message': 'Notification not found'}), 404

    if notification.user_id != current_user.id and not current_user.is_admin:
        return jsonify({'message': 'Unauthorized'}), 403

    db.session.delete(notification)
    db.session.commit()
    return jsonify({'message': 'Notification deleted'}), 200

# MARK ALL as read
@notification_bp.route('/notifications/mark-all-read', methods=['PUT'])
@token_required
def mark_all_notifications_read(current_user):
    notifications = Notifications.query.filter_by(user_id=current_user.id, is_read=False).all()

    for notification in notifications:
        notification.is_read = True

    db.session.commit()
    return jsonify({'message': 'All notifications marked as read'}), 200
