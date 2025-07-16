from flask import Blueprint, request, jsonify
from models import db, Category
from views.auth import token_required

category_bp = Blueprint('category', __name__, url_prefix='/categories')


# Create a new category (Admin only)
@category_bp.route('/', methods=['POST'])
@token_required
def create_category(current_user):
    if not current_user.is_admin:
        return jsonify({'message': 'Admin privileges required'}), 403

    data = request.get_json()
    category_name = data.get('category_name')

    if not category_name:
        return jsonify({'error': 'Category name is required'}), 400

    category = Category(
        category_name=category_name,
        created_by=current_user.username
    )
    db.session.add(category)
    db.session.commit()

    return jsonify({'message': 'Category created', 'id': category.id}), 201


# Get all categories
@category_bp.route('/', methods=['GET'])
def get_all_categories():
    categories = Category.query.all()
    return jsonify([
        {
            'id': cat.id,
            'category_name': cat.category_name,
            'created_by': cat.created_by,
            'created_at': cat.created_at
        }
        for cat in categories
    ]), 200


# Get a specific category by ID
@category_bp.route('/<int:category_id>', methods=['GET'])
def get_category(category_id):
    category = Category.query.get(category_id)
    if not category:
        return jsonify({'message': 'Category not found'}), 404

    return jsonify({
        'id': category.id,
        'category_name': category.category_name,
        'created_by': category.created_by,
        'created_at': category.created_at
    }), 200


# Update a category (Admin only)
@category_bp.route('/<int:category_id>', methods=['PUT'])
@token_required
def update_category(current_user, category_id):
    if not current_user.is_admin:
        return jsonify({'message': 'Admin privileges required'}), 403

    category = Category.query.get(category_id)
    if not category:
        return jsonify({'message': 'Category not found'}), 404

    data = request.get_json()
    new_name = data.get('category_name')

    if new_name:
        category.category_name = new_name
        db.session.commit()
        return jsonify({'message': 'Category updated successfully'}), 200
    else:
        return jsonify({'error': 'Category name is required'}), 400


# Delete a category (Admin only)
@category_bp.route('/<int:category_id>', methods=['DELETE'])
@token_required
def delete_category(current_user, category_id):
    if not current_user.is_admin:
        return jsonify({'message': 'Admin privileges required'}), 403

    category = Category.query.get(category_id)
    if not category:
        return jsonify({'message': 'Category not found'}), 404

    db.session.delete(category)
    db.session.commit()
    return jsonify({'message': 'Category deleted'}), 200
