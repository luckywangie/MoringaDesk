from app import create_app
from models import (
    db, User, Question, Answers, Category, FollowUp, Votes,
    RelatedQuestions, Tags, QuestionTags, Reports, Notifications, FAQs
)
from werkzeug.security import generate_password_hash

app = create_app()

with app.app_context():
    # Drop and recreate all tables
    db.drop_all()
    db.create_all()

    # Seed categories
    cat1 = Category(category_name="Backend", created_by="admin")
    cat2 = Category(category_name="Frontend", created_by="admin")
    db.session.add_all([cat1, cat2])
    db.session.commit()

    # Seed users
    user1 = User(username="john Berry", email="john@gmail.com", password=generate_password_hash("1234"))
    user2 = User(username="jane Samuel", email="jane@gmail.com", password=generate_password_hash("1234"))
    admin = User(username="admin", email="admin@gmail.com", password=generate_password_hash("1234"), is_admin=True)
    db.session.add_all([user1, user2, admin])
    db.session.commit()

    # Seed questions
    q1 = Question(
        title="How to use Flask with SQLAlchemy?",
        description="I need help setting up Flask with SQLAlchemy.",
        category_id=cat1.id,
        user_id=user1.id,
        language="Python"
    )
    q2 = Question(
        title="Best frontend framework?",
        description="Should I use React or Vue?",
        category_id=cat2.id,
        user_id=user2.id,
        language="JavaScript"
    )
    db.session.add_all([q1, q2])
    db.session.commit()

    # Seed answers
    a1 = Answers(content="Use Flask-Migrate for migrations.", question_id=q1.id, user_id=user2.id, is_approved=True)
    a2 = Answers(content="React is widely used in industry.", question_id=q2.id, user_id=user1.id)
    db.session.add_all([a1, a2])
    db.session.commit()

    # Seed follow-ups
    f1 = FollowUp(content="Thanks! How do I install it?", answer_id=a1.id, user_id=user1.id, question_id=q1.id)
    db.session.add(f1)
    db.session.commit()

    # Seed votes
    v1 = Votes(user_id=user1.id, answer_id=a1.id, vote_type="up")
    v2 = Votes(user_id=user2.id, answer_id=a2.id, vote_type="down")
    db.session.add_all([v1, v2])
    db.session.commit()

    # Seed related questions
    rq = RelatedQuestions(question_id=q1.id, related_question_id=q2.id)
    db.session.add(rq)
    db.session.commit()

    # Seed tags
    tag1 = Tags(name="flask", type="backend")
    tag2 = Tags(name="react", type="frontend")
    tag3 = Tags(name="sqlalchemy", type="orm")
    db.session.add_all([tag1, tag2, tag3])
    db.session.commit()

    # Assign tags to users (many-to-many)
    user1.tags.extend([tag1, tag3])
    user2.tags.append(tag2)
    db.session.commit()

    # Seed question tags
    qt1 = QuestionTags(question_id=q1.id, tag_id=tag1.id)
    qt2 = QuestionTags(question_id=q1.id, tag_id=tag3.id)
    qt3 = QuestionTags(question_id=q2.id, tag_id=tag2.id)
    db.session.add_all([qt1, qt2, qt3])
    db.session.commit()

    # Seed reports
    report = Reports(
        user_id=user2.id,
        category_id=cat1.id
    )
    db.session.add(report)
    db.session.commit()

    # Seed notifications
    notif = Notifications(
        user_id=user1.id,
        type="vote",
        message="Your answer received a vote!",
        is_read=False
    )
    db.session.add(notif)
    db.session.commit()

    # Seed FAQs
    faq1 = FAQs(
        question="How do I reset my password?",
        answer="Use the forgot password link on the login page.",
        category="Account",
        created_by=user1.id
    )
    faq2 = FAQs(
        question="Can I edit my question after posting?",
        answer="Yes, click the edit icon next to your post.",
        category="Questions",
        created_by=user2.id
    )
    db.session.add_all([faq1, faq2])
    db.session.commit()

    print("✅ Fully seeded the database successfully.")
