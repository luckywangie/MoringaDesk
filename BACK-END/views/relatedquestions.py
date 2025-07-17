from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models import db, RelatedQuestions, Question  

related_questions_bp = Blueprint('related_questions_bp', __name__, url_prefix='/api')

# Serializer
def serialize_related_question(rq):
    return {
        'id': rq.id,
        'question_id': rq.question_id,
        'related_question_id': rq.related_question_id
    }

# CREATE a related question
@related_questions_bp.route('/relatedquestions', methods=['POST'])
@jwt_required()
def create_related_question():
    data = request.get_json()
    question_id = data.get('question_id')
    related_question_id = data.get('related_question_id')

    if not question_id or not related_question_id:
        return jsonify({'message': 'Both question_id and related_question_id are required'}), 400

    related = RelatedQuestions(question_id=question_id, related_question_id=related_question_id)
    db.session.add(related)
    db.session.commit()

    return jsonify({'message': 'Related question created', 'related_question': serialize_related_question(related)}), 201

# GET all related questions
@related_questions_bp.route('/relatedquestions', methods=['GET'])
@jwt_required()
def get_all_related_questions():
    related_questions = RelatedQuestions.query.all()
    return jsonify([serialize_related_question(rq) for rq in related_questions]), 200

# GET related question by ID
@related_questions_bp.route('/relatedquestions/<int:id>', methods=['GET'])
@jwt_required()
def get_related_question(id):
    rq = RelatedQuestions.query.get(id)
    if not rq:
        return jsonify({'message': 'Related question not found'}), 404
    return jsonify(serialize_related_question(rq)), 200

# UPDATE related question
@related_questions_bp.route('/relatedquestions/<int:id>', methods=['PUT'])
@jwt_required()
def update_related_question(id):
    rq = RelatedQuestions.query.get(id)
    if not rq:
        return jsonify({'message': 'Related question not found'}), 404

    data = request.get_json()
    rq.question_id = data.get('question_id', rq.question_id)
    rq.related_question_id = data.get('related_question_id', rq.related_question_id)

    db.session.commit()
    return jsonify({'message': 'Related question updated', 'related_question': serialize_related_question(rq)}), 200

# DELETE related question
@related_questions_bp.route('/relatedquestions/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_related_question(id):
    rq = RelatedQuestions.query.get(id)
    if not rq:
        return jsonify({'message': 'Related question not found'}), 404

    db.session.delete(rq)
    db.session.commit()
    return jsonify({'message': 'Related question deleted'}), 200
