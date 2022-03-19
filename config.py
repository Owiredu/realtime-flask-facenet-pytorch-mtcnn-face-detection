import os

base_dir = os.path.abspath(os.path.dirname(__file__))

class Config(object):

    # GENERAL CONFIGURATIONS
    SECRET_KEY = b'x\xb3\x10\xfad\xb0MYg0N\xe5\xdd\x0c\xa7\xee+\x1c\x0cb\x97e\xc3fT\x1d~\xbd\xc2\x0b\x06='
    SQLALCHEMY_TRACK_MODIFICATIONS = True

    # DO NOT CACHE
    SEND_FILE_MAX_AGE_DEFAULT = 0

    # SPECIFY UPLOADS FOLDER
    UPLOAD_FOLDER = os.path.join(base_dir, 'storage')

    # SET DEBUG TO TRUE
    DEVELOPMENT = True
    DEBUG = True
    
    # DATABASE CONFIGURATIONS
    # SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI') or ('sqlite:///' + os.path.join(base_dir, 'app.db'))
    # dialect+driver://username:password@host:port/database
    # SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI') or 'mysql+pymysql://root:@127.0.0.1:3306/alpha'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URI') or 'mysql+pymysql://copkad_admin:copkad_admin@www.db4free.net:3306/alpha'

    # EMAIL CONFIGURATIONS
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_PORT = 587
    MAIL_USE_TLS = True
    MAIL_USERNAME = ''
    MAIL_DEFAULT_SENDER = ''
    MAIL_PASSWORD = ''
