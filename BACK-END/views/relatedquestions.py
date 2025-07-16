from models import db, RelatedQuestions
from flask import jsonify, request, Blueprint

related_questions_bp = Blueprint('related_questions', __name__)
@related_questions_bp.route('/api/related-questions', methods=['POST'])
def create_related_question():
    data = request.get_json()
    
    if not data or 'question_id' not in data or 'related_question_id' not in data:
        return jsonify({'error': 'Invalid input'}), 400
    
    related_question = RelatedQuestions(
        question_id=data['question_id'],
        related_question_id=data['related_question_id']
    )
    
    db.session.add(related_question)
    db.session.commit()
    
    return jsonify({'success': 'Related question created successfully', 'id': related_question.id}), 201

@related_questions_bp.route('/related-questions/<int:question_id>', methods=['GET'])
def get_related_questions(question_id):
    related = RelatedQuestions.query.filter_by(question_id=question_id).all()
    return jsonify([
        {'id': r.id, 'related_question_id': r.related_question_id}
        for r in related
    ])

@related_questions_bp.route('/related-questions/<int:id>', methods=['DELETE'])
def delete_related_question(id):
    rq = RelatedQuestions.query.get_or_404(id)
    db.session.delete(rq)
    db.session.commit()
    return jsonify({'success': 'Related question deleted successfully'}), 200

