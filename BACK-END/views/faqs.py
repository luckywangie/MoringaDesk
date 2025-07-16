from flask import Blueprint, request, jsonify
from models import db, FAQs
from views.auth import token_required

faqs_bp = Blueprint('faqs', __name__, url_prefix='/faqs')


# Create FAQ (Admin only)
@faqs_bp.route('/', methods=['POST'])
@token_required
def create_faq(current_user):
    if not current_user.is_admin:
        return jsonify({'message': 'Admin privileges required'}), 403

    data = request.get_json()
    question = data.get('question')
    answer = data.get('answer')
    category = data.get('category')

    if not question or not answer or not category:
        return jsonify({'error': 'All fields (question, answer, category) are required'}), 400

    faq = FAQs(
        question=question,
        answer=answer,
        category=category,
        created_by=current_user.id
    )
    db.session.add(faq)
    db.session.commit()

    return jsonify({'message': 'FAQ created', 'id': faq.id}), 201


# Get all FAQs
@faqs_bp.route('/', methods=['GET'])
def get_all_faqs():
    faqs = FAQs.query.all()
    return jsonify([
        {
            'id': faq.id,
            'question': faq.question,
            'answer': faq.answer,
            'category': faq.category,
            'created_at': faq.created_at
        } for faq in faqs
    ]), 200


# Get FAQ by ID
@faqs_bp.route('/<int:faq_id>', methods=['GET'])
def get_faq_by_id(faq_id):
    faq = FAQs.query.get(faq_id)
    if not faq:
        return jsonify({'message': 'FAQ not found'}), 404

    return jsonify({
        'id': faq.id,
        'question': faq.question,
        'answer': faq.answer,
        'category': faq.category,
        'created_at': faq.created_at
    }), 200


# Update FAQ (Admin only)
@faqs_bp.route('/<int:faq_id>', methods=['PUT'])
@token_required
def update_faq(current_user, faq_id):
    if not current_user.is_admin:
        return jsonify({'message': 'Admin privileges required'}), 403

    faq = FAQs.query.get(faq_id)
    if not faq:
        return jsonify({'message': 'FAQ not found'}), 404

    data = request.get_json()
    faq.question = data.get('question', faq.question)
    faq.answer = data.get('answer', faq.answer)
    faq.category = data.get('category', faq.category)

    db.session.commit()
    return jsonify({'message': 'FAQ updated'}), 200


# Delete FAQ (Admin only)
@faqs_bp.route('/<int:faq_id>', methods=['DELETE'])
@token_required
def delete_faq(current_user, faq_id):
    if not current_user.is_admin:
        return jsonify({'message': 'Admin privileges required'}), 403

    faq = FAQs.query.get(faq_id)
    if not faq:
        return jsonify({'message': 'FAQ not found'}), 404

    db.session.delete(faq)
    db.session.commit()
    return jsonify({'message': 'FAQ deleted'}), 200
