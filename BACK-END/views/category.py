from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Category

categories_bp = Blueprint('categories_bp', __name__, url_prefix='/api')

# Serializer
def serialize_category(category):
    return {
        'id': category.id,
        'category_name': category.category_name,
        'created_by': category.created_by,
        'created_at': category.created_at.strftime('%a, %d %b %Y %H:%M:%S GMT')
    }

# CREATE
@categories_bp.route('/categories', methods=['POST'])
@jwt_required()
def create_category():
    data = request.get_json()
    user_id = get_jwt_identity()

    category_name = data.get('category_name')
    if not category_name:
        return jsonify({'message': 'Category name is required'}), 400

    category = Category(category_name=category_name, created_by=str(user_id))
    db.session.add(category)
    db.session.commit()
    return jsonify({'message': 'Category created successfully', 'category': serialize_category(category)}), 201

# READ all
@categories_bp.route('/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([serialize_category(c) for c in categories]), 200

# READ one
@categories_bp.route('/categories/<int:id>', methods=['GET'])
def get_category(id):
    category = Category.query.get(id)
    if not category:
        return jsonify({'message': 'Category not found'}), 404
    return jsonify(serialize_category(category)), 200

# UPDATE
@categories_bp.route('/categories/<int:id>', methods=['PUT'])
@jwt_required()
def update_category(id):
    category = Category.query.get(id)
    if not category:
        return jsonify({'message': 'Category not found'}), 404

    data = request.get_json()
    category_name = data.get('category_name')
    if category_name:
        category.category_name = category_name
        db.session.commit()
    return jsonify({'message': 'Category updated successfully', 'category': serialize_category(category)}), 200

# DELETE
@categories_bp.route('/categories/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_category(id):
    category = Category.query.get(id)
    if not category:
        return jsonify({'message': 'Category not found'}), 404

    # Prevent deletion if category has related questions
    if category.questions:  # assumes relationship exists: Category.questions
        return jsonify({'message': 'Cannot delete category. It is linked to existing questions.'}), 400

    db.session.delete(category)
    db.session.commit()
    return jsonify({'message': 'Category deleted successfully'}), 200
