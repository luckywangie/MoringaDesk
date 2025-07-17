from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity  
from models import db, QuestionTags, Question, Tags, User  

questiontags_bp = Blueprint('questiontags_bp', __name__, url_prefix='/api')

#  Serializer
def serialize_question_tag(qt):
    return {
        'id': qt.id,
        'question_id': qt.question_id,
        'tag_id': qt.tag_id
    }

#  CREATE a QuestionTag
@questiontags_bp.route('/questiontags', methods=['POST'])
@jwt_required()
def create_question_tag():
    data = request.get_json()
    question_id = data.get('question_id')
    tag_id = data.get('tag_id')

    if not question_id or not tag_id:
        return jsonify({'message': 'question_id and tag_id are required'}), 400

    # Optional: Check if relationship already exists
    existing = QuestionTags.query.filter_by(question_id=question_id, tag_id=tag_id).first()
    if existing:
        return jsonify({'message': 'This tag is already assigned to the question'}), 400

    qt = QuestionTags(question_id=question_id, tag_id=tag_id)
    db.session.add(qt)
    db.session.commit()

    return jsonify({'message': 'QuestionTag created', 'question_tag': serialize_question_tag(qt)}), 201

# READ all QuestionTags
@questiontags_bp.route('/questiontags', methods=['GET'])
@jwt_required()
def get_all_question_tags():
    qtags = QuestionTags.query.all()
    return jsonify([serialize_question_tag(qt) for qt in qtags]), 200

#  READ QuestionTag by ID
@questiontags_bp.route('/questiontags/<int:id>', methods=['GET'])
@jwt_required()
def get_question_tag(id):
    qt = QuestionTags.query.get(id)
    if not qt:
        return jsonify({'message': 'QuestionTag not found'}), 404
    return jsonify(serialize_question_tag(qt)), 200

# UPDATE QuestionTag
@questiontags_bp.route('/questiontags/<int:id>', methods=['PUT'])
@jwt_required()
def update_question_tag(id):
    qt = QuestionTags.query.get(id)
    if not qt:
        return jsonify({'message': 'QuestionTag not found'}), 404

    data = request.get_json()
    qt.question_id = data.get('question_id', qt.question_id)
    qt.tag_id = data.get('tag_id', qt.tag_id)

    db.session.commit()
    return jsonify({'message': 'QuestionTag updated', 'question_tag': serialize_question_tag(qt)}), 200

#  DELETE QuestionTag
@questiontags_bp.route('/questiontags/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_question_tag(id):
    qt = QuestionTags.query.get(id)
    if not qt:
        return jsonify({'message': 'QuestionTag not found'}), 404

    db.session.delete(qt)
    db.session.commit()
    return jsonify({'message': 'QuestionTag deleted'}), 200
