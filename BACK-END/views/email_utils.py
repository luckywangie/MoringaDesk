from flask_mail import Message
from extensions import mail  # make sure mail is globally imported from app.py
from flask import current_app

def send_reset_email(to_email, reset_token):
    msg = Message(
        subject="Password Reset - MoringaDesk",
        recipients=[to_email],
        body=f"""
        Hello,

        Click the link below to reset your password:

        http://localhost:5173/reset-password?token={reset_token}

        If you didn't request this, please ignore this email.

        Thanks,
        MoringaDesk Team
        """
    )
    with current_app.app_context():
        mail.send(msg)
