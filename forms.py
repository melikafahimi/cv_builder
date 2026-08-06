from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, SelectField, SubmitField
from wtforms.validators import DataRequired, Email, Optional

class ResumeForm(FlaskForm):
    title = StringField('Resume Title', validators=[Optional()])
    full_name = StringField('Full Name', validators=[DataRequired()])
    job_title = StringField('Job Title', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    phone = StringField('Phone Number', validators=[Optional()])
    address = StringField('Address', validators=[Optional()])
    about = TextAreaField('Profile Summary', validators=[Optional()])
    template = SelectField('Resume Template', choices=[
        ('modern', 'Modern (Two Column)'),
        ('classic', 'Classic (Single Column)'),
        ('creative', 'Creative (Colorful)'),
        ('professional', 'Professional (Clean)'),
        ('executive', 'Executive (Bold)'),
        ('safety', 'Safety (Industrial)')
    ], default='classic')
    submit = SubmitField('Save Resume')

class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = StringField('Password', validators=[DataRequired()])

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = StringField('Password', validators=[DataRequired()])