from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from models import db  # importing the db instance from your models.py

def create_app():
    app = Flask(__name__)

    # Configuration for the database
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///app.db'  # You can change this to PostgreSQL or MySQL URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize app with SQLAlchemy
    db.init_app(app)

    # Register blueprints here if needed in the future
    # from yourapp.routes import main as main_blueprint
    # app.register_blueprint(main_blueprint)

    @app.route('/')
    def home():
        return "Flask App with Models is Running!"

    # Create database tables before the first request
    @app.before_first_request
    def create_tables():
        db.create_all()

    return app

if __name__ == '_main_':
    app = create_app()
    app.run(debug=True)