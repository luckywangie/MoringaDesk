from flask import Flask
from flask_sqlalchemy import SQLAlchemy  # noqa: F401
from flask_migrate import Migrate  # noqa: F401
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from models import db

# Import all your blueprints
from views.auth import auth_bp
from views.question import question_bp
from views.answers import answers_bp
from views.votes import votes_bp
from views.followup import followup_bp
from views.notifications import notification_bp
from views.reports import reports_bp
from views.tags import tags_bp
from views.relatedquestions import related_questions_bp
from views.category import categories_bp

from views.faqs import faqs_bp
from views import user_bp  # ✅ Added for user management

def create_app():
    app = Flask(__name__)
    CORS(app)

    # 🔐 Use ONE shared secret for everything (dev only)
    shared_secret = 'moringa_secret_2025'
    app.config['SECRET_KEY'] = shared_secret
    app.config['JWT_SECRET_KEY'] = shared_secret  # ✅ match the SECRET_KEY
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hour in seconds

    # ✅ JWT setup
    JWTManager(app)

    # 📦 Database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)
    Migrate(app, db)

    # 📌 Register all blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(question_bp)
    app.register_blueprint(answers_bp)
    app.register_blueprint(votes_bp)
    app.register_blueprint(followup_bp)
    app.register_blueprint(notification_bp)
    app.register_blueprint(reports_bp)
    app.register_blueprint(tags_bp)
    app.register_blueprint(related_questions_bp)
    app.register_blueprint(categories_bp)
    app.register_blueprint(faqs_bp)
    app.register_blueprint(user_bp)

    @app.route('/')
    def home():
        return "MoringaDesk Flask API is running!"

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)
