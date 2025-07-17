from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, Tags

tags_bp = Blueprint('tags_bp', __name__, url_prefix='/api')

def serialize_tag(tag):
    return {
        'id': tag.id,
        'name': tag.name,
        'type': tag.type,
        'created_at': tag.created_at.strftime('%a, %d %b %Y %H:%M:%S GMT')
    }

# CREATE a tag
@tags_bp.route('/tags', methods=['POST'])
@jwt_required()
def create_tag():
    data = request.get_json()
    name = data.get('name')
    type = data.get('type')

    if not name:
        return jsonify({'message': 'Name is required'}), 400

    tag = Tags(name=name, type=type)
    db.session.add(tag)
    db.session.commit()

    return jsonify({'message': 'Tag created', 'tag': serialize_tag(tag)}), 201

# READ all tags
@tags_bp.route('/tags', methods=['GET'])
@jwt_required()
def get_all_tags():
    tags = Tags.query.order_by(Tags.created_at.desc()).all()
    return jsonify([serialize_tag(tag) for tag in tags]), 200

# READ tag by id
@tags_bp.route('/tags/<int:id>', methods=['GET'])
@jwt_required()
def get_tag(id):
    tag = Tags.query.get(id)
    if not tag:
        return jsonify({'message': 'Tag not found'}), 404
    return jsonify(serialize_tag(tag)), 200

# UPDATE a tag
@tags_bp.route('/tags/<int:id>', methods=['PUT'])
@jwt_required()
def update_tag(id):
    tag = Tags.query.get(id)
    if not tag:
        return jsonify({'message': 'Tag not found'}), 404

    data = request.get_json()
    tag.name = data.get('name', tag.name)
    tag.type = data.get('type', tag.type)

    db.session.commit()
    return jsonify({'message': 'Tag updated', 'tag': serialize_tag(tag)}), 200

# DELETE a tag
@tags_bp.route('/tags/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_tag(id):
    tag = Tags.query.get(id)
    if not tag:
        return jsonify({'message': 'Tag not found'}), 404

    db.session.delete(tag)
    db.session.commit()
    return jsonify({'message': 'Tag deleted'}), 200
