from models import db, RelatedQuestions
from flask import jsonify, request, Blueprint
from flask_jwt_extended import jwt_required
from sqlalchemy.exc import IntegrityError

related_questions_bp = Blueprint('related_questions', __name__)

# Create a new related question association
@related_questions_bp.route('/api/related-questions', methods=['POST'])
@jwt_required()
def create_related_question():
    data = request.get_json()

    if not data or 'question_id' not in data or 'related_question_id' not in data:
        return jsonify({'error': 'Both question_id and related_question_id are required'}), 400

    if data['question_id'] == data['related_question_id']:
        return jsonify({'error': 'A question cannot be related to itself'}), 400

    # Prevent duplicate relation
    existing = RelatedQuestions.query.filter_by(
        question_id=data['question_id'], 
        related_question_id=data['related_question_id']
    ).first()
    if existing:
        return jsonify({'error': 'Relation already exists'}), 409

    try:
        related_question = RelatedQuestions(
            question_id=data['question_id'],
            related_question_id=data['related_question_id']
        )
        db.session.add(related_question)
        db.session.commit()
        return jsonify({
            'success': 'Related question created successfully', 
            'id': related_question.id
        }), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Invalid question IDs'}), 400

# Get related questions for a given question
@related_questions_bp.route('/api/related-questions/<int:question_id>', methods=['GET'])
def get_related_questions(question_id):
    related = RelatedQuestions.query.filter_by(question_id=question_id).all()
    return jsonify([
        {'id': r.id, 'related_question_id': r.related_question_id}
        for r in related
    ]), 200

# Delete a specific related question association
@related_questions_bp.route('/api/related-questions/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_related_question(id):
    rq = RelatedQuestions.query.get_or_404(id)
    db.session.delete(rq)
    db.session.commit()
    return jsonify({'success': 'Related question deleted successfully'}), 200
