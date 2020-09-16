from sys import stdout
from config import Config
import logging
from flask import Flask
from flask_socketio import SocketIO
from engineio.payload import Payload
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_mail import Mail


app = Flask(__name__)
app.logger.addHandler(logging.StreamHandler(stdout))
app.config.from_object(Config)
db = SQLAlchemy(app)
migrate = Migrate(app, db)
mail = Mail(app)

Payload.max_decode_packets = 2097152 # 2MB
socketio = SocketIO(app)

import routes, models


if __name__ == '__main__':
    socketio.run(app)
