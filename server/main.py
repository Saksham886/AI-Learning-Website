from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from pymongo import MongoClient
from config import Config

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

# JWT and mongo setup
jwt = JWTManager(app)
mongo = MongoClient(app.config["MONGO_URI"])
db = mongo["edugenie"]

# Register Route
from app.routes.auth_routes import auth_bp
app.register_blueprint(auth_bp, url_prefix="/auth")
# Tools Route
from app.routes.ai_routes import ai_bp
app.register_blueprint(ai_bp, url_prefix="/ai")
#Dashboard Route
from app.routes.dashboard_routes import dashboard_bp
app.register_blueprint(dashboard_bp, url_prefix="/dashboard")


if __name__ == "__main__":
    app.run(debug=True)