from flask import Blueprint, request, jsonify
from models import db, Tags
from views.auth import token_required

tags_bp = Blueprint('tags', __name__, url_prefix='/tags')

#  Create a new tag (Admin only)
@tags_bp.route('/', methods=['POST'])
@token_required
def create_tag(current_user):
    if not current_user.is_admin:
        return jsonify({'error': 'Admin privileges required'}), 403

    data = request.get_json()
    name = data.get('name')
    type_ = data.get('type')

    if not name:
        return jsonify({'error': 'Tag name is required'}), 400

    tag = Tags(name=name, type=type_)
    db.session.add(tag)
    db.session.commit()

    return jsonify({'message': 'Tag created', 'id': tag.id}), 201

#  Get all tags
@tags_bp.route('/', methods=['GET'])
def get_all_tags():
    tags = Tags.query.all()
    return jsonify([
        {
            'id': tag.id,
            'name': tag.name,
            'type': tag.type,
            'created_at': tag.created_at
        } for tag in tags
    ]), 200

# Get a tag by ID
@tags_bp.route('/<int:tag_id>', methods=['GET'])
def get_tag(tag_id):
    tag = Tags.query.get(tag_id)
    if not tag:
        return jsonify({'error': 'Tag not found'}), 404

    return jsonify({
        'id': tag.id,
        'name': tag.name,
        'type': tag.type,
        'created_at': tag.created_at
    }), 200

# Update a tag (Admin only)
@tags_bp.route('/<int:tag_id>', methods=['PUT'])
@token_required
def update_tag(current_user, tag_id):
    if not current_user.is_admin:
        return jsonify({'error': 'Admin privileges required'}), 403

    tag = Tags.query.get(tag_id)
    if not tag:
        return jsonify({'error': 'Tag not found'}), 404

    data = request.get_json()
    tag.name = data.get('name', tag.name)
    tag.type = data.get('type', tag.type)

    db.session.commit()
    return jsonify({'message': 'Tag updated'}), 200

#  Delete a tag (Admin only)
@tags_bp.route('/<int:tag_id>', methods=['DELETE'])
@token_required
def delete_tag(current_user, tag_id):
    if not current_user.is_admin:
        return jsonify({'error': 'Admin privileges required'}), 403

    tag = Tags.query.get(tag_id)
    if not tag:
        return jsonify({'error': 'Tag not found'}), 404

    db.session.delete(tag)
    db.session.commit()
    return jsonify({'message': 'Tag deleted'}), 200
