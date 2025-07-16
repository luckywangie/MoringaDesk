from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, FAQs

faqs_bp = Blueprint('faqs_bp', __name__, url_prefix='/api')

# Serializer
def serialize_faq(faq):
    return {
        'id': faq.id,
        'question': faq.question,
        'answer': faq.answer,
        'created_by': faq.created_by,
        'created_at': faq.created_at.strftime('%a, %d %b %Y %H:%M:%S GMT')
    }

# CREATE FAQ
@faqs_bp.route('/faqs', methods=['POST'])
@jwt_required()
def create_faq():
    data = request.get_json()
    user_id = get_jwt_identity()

    question = data.get('question')
    answer = data.get('answer')

    if not question or not answer:
        return jsonify({'message': 'Both question and answer are required'}), 400

    faq = FAQs(question=question, answer=answer, created_by=str(user_id))
    db.session.add(faq)
    db.session.commit()
    return jsonify({'message': 'FAQ created successfully', 'faq': serialize_faq(faq)}), 201

# READ all FAQs
@faqs_bp.route('/faqs', methods=['GET'])
def get_faqs():
    faqs = FAQs.query.order_by(FAQs.created_at.desc()).all()
    return jsonify([serialize_faq(f) for f in faqs]), 200

# READ one FAQ
@faqs_bp.route('/faqs/<int:id>', methods=['GET'])
def get_faq(id):
    faq = FAQs.query.get(id)
    if not faq:
        return jsonify({'message': 'FAQ not found'}), 404
    return jsonify(serialize_faq(faq)), 200

# UPDATE FAQ
@faqs_bp.route('/faqs/<int:id>', methods=['PUT'])
@jwt_required()
def update_faq(id):
    faq = FAQs.query.get(id)
    if not faq:
        return jsonify({'message': 'FAQ not found'}), 404

    data = request.get_json()
    question = data.get('question')
    answer = data.get('answer')

    if question:
        faq.question = question
    if answer:
        faq.answer = answer

    db.session.commit()
    return jsonify({'message': 'FAQ updated successfully', 'faq': serialize_faq(faq)}), 200

# DELETE FAQ
@faqs_bp.route('/faqs/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_faq(id):
    faq = FAQs.query.get(id)
    if not faq:
        return jsonify({'message': 'FAQ not found'}), 404

    db.session.delete(faq)
    db.session.commit()
    return jsonify({'message': 'FAQ deleted successfully'}), 200
