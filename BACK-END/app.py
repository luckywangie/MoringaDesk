from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from models import db  # db is already created in models.py

# Factory function for the Flask application
def create_app():
    app = Flask(__name__)

    # Configurations
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'  # Change to PostgreSQL/MySQL URI in production
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize database and migrations
    db.init_app(app)
    migrate = Migrate(app, db)

    @app.route('/')
    def home():
        return "Flask App with SQLAlchemy and Migrations is running!"

    return app

# Allow running the app directly with python app.py
if __name__ == '_main_':
    app = create_app()
    app.run(debug=True)