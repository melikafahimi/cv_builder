from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, TextAreaField, SelectField
from wtforms.validators import DataRequired, Email, EqualTo, Length, Optional

class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=80)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Sign Up')

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    submit = SubmitField('Login')

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
        ('classic', 'Classic'),
        ('creative', 'Creative'),
    ])
    submit = SubmitField('Save Resume')