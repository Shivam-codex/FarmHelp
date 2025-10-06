import pymongo
import bcrypt
from datetime import datetime

# MongoDB connection
client = pymongo.MongoClient("mongodb://localhost:27017/")
# Use the existing database name with correct case to avoid case-sensitivity errors
db = client["FarmHelp"]
users_collection = db["users"]

def create_user(name, email, password):
    """Create a new user in the database"""
    # Check if user already exists
    if users_collection.find_one({"email": email}):
        return False
    
    # Hash the password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    # Create user document
    user = {
        "name": name,
        "email": email,
        "password": hashed_password,
        "created_at": datetime.now(),
        "last_login": None
    }
    
    # Insert user into database
    result = users_collection.insert_one(user)
    return result.acknowledged

def authenticate_user(email, password):
    """Authenticate a user by email and password"""
    user = users_collection.find_one({"email": email})
    
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        # Update last login time
        users_collection.update_one(
            {"_id": user["_id"]},
            {"$set": {"last_login": datetime.now()}}
        )
        return user
    return None

def get_user_by_id(user_id):
    """Get user by ID"""
    return users_collection.find_one({"_id": user_id})

def get_user_by_email(email):
    """Get user by email"""
    return users_collection.find_one({"email": email})