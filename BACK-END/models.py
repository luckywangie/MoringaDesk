from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy(app)
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    is_admin = db.Column(db.Boolean, default=False)
    
    # Relationships
    questions = db.relationship('Question', backref='user', cascade='all, delete-orphan')
    answers = db.relationship('Answers', backref='user', cascade='all, delete-orphan')
    votes = db.relationship('Vote', backref='user', cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='user', cascade='all, delete-orphan')
    follow_up = db.relationship('Follow_Up', backref='user', cascade='all, delete-orphan')
    reports = db.relationship('Report', backref='user', cascade='all, delete-orphan')
    faqs = db.relationship('FAQ', backref='user', cascade='all, delete-orphan')
    tags = db.relationship('Tag', backref='user', cascade='all, delete-orphan')
    
  
class Question (db.Model):
    __tablename__ = 'questions'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    is_solved = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    language = db.Column(db.String(50), nullable=False)
    
    # Relationships
    related_questions = db.relationship('RelatedQuestions', foreign_keys='RelatedQuestions.question_id', backref='question', lazy=True)
    answer =db.relationship('Answers', backref='question', cascade='all, delete-orphan')
    user = db.relationship('User', backref='questions')
    question_tags = db.relationship('QuestionTag', backref='question', cascade='all, delete-orphan')
    category = db.relationship('Category', backref='questions')
    
    
class Answers (db.Model):
    __tablename__ = 'answers'
    id = db.Column(db.Integer, primary_key=True)
    question_id = db.Column(db.Integer, db.ForeignKey('questions.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    content = db.Column(db.Text, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    is_approved = db.Column(db.Boolean, default=False)
    
    # Relationships
    user = db.relationship('User', backref='answers')
    question = db.relationship('Question', backref='answers')




    
    

