from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    resumes = db.relationship('Resume', backref='author', lazy=True, cascade='all, delete-orphan')

class Resume(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False, default='My Resume')
    template = db.Column(db.String(20), default='modern')
    
    full_name = db.Column(db.String(100), nullable=False, default='')
    job_title = db.Column(db.String(100), nullable=False, default='')
    email = db.Column(db.String(100), nullable=False, default='')
    phone = db.Column(db.String(20), default='')
    address = db.Column(db.String(200), default='')
    about = db.Column(db.Text, default='')
    
    experiences = db.Column(db.Text, default='[]')
    educations = db.Column(db.Text, default='[]')
    skills = db.Column(db.Text, default='[]')
    certifications = db.Column(db.Text, default='[]')
    languages = db.Column(db.Text, default='[]')
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)