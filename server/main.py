from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from passlib.context import CryptContext
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware
import os
from sqlalchemy.orm import Session
from .database import Base, engine, get_db
from . import models, schemas, crud


# Migrations manage schema; avoid eager table creation here to support testing and Alembic

app = FastAPI(title="SpendWise API")
# Simple in-memory user for demo
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_ALGO = "HS256"

demo_user = {
    "username": os.getenv("DEMO_USERNAME", "admin"),
    "hashed_password": pwd_context.hash(os.getenv("DEMO_PASSWORD", "admin123")),
}

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_access_token(sub: str, expires_minutes: int = 60) -> str:
    expire = datetime.utcnow() + timedelta(minutes=expires_minutes)
    to_encode = {"sub": sub, "exp": expire}
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGO)

def require_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
        return payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/token")
def login(form: OAuth2PasswordRequestForm = Depends()):
    if form.username != demo_user["username"] or not verify_password(form.password, demo_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    token = create_access_token(sub=form.username)
    return {"access_token": token, "token_type": "bearer"}

origins_env = os.getenv("CORS_ORIGINS", "*")
allow_origins = [o.strip() for o in origins_env.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


# Expenses
@app.get("/expenses", response_model=list[schemas.ExpenseOut])
def list_expenses(db: Session = Depends(get_db)):
    return crud.list_expenses(db)


@app.post("/expenses", response_model=schemas.ExpenseOut)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db), user: str = Depends(require_user)):
    return crud.create_expense(db, expense)


@app.put("/expenses/{expense_id}", response_model=schemas.ExpenseOut)
def update_expense(expense_id: str, expense: schemas.ExpenseUpdate, db: Session = Depends(get_db), user: str = Depends(require_user)):
    if expense_id != expense.id:
        raise HTTPException(status_code=400, detail="ID mismatch")
    updated = crud.update_expense(db, expense)
    if not updated:
        raise HTTPException(status_code=404, detail="Expense not found")
    return updated


@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: str, db: Session = Depends(get_db), user: str = Depends(require_user)):
    ok = crud.delete_expense(db, expense_id)
    if not ok:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"deleted": True}


# Settings
@app.get("/settings", response_model=schemas.SettingsOut)
def get_settings(db: Session = Depends(get_db)):
    return crud.get_settings(db)


@app.put("/settings", response_model=schemas.SettingsOut)
def update_settings(settings: schemas.SettingsBase, db: Session = Depends(get_db), user: str = Depends(require_user)):
    return crud.update_settings(db, settings)


# Profile
@app.get("/profile", response_model=schemas.ProfileOut)
def get_profile(db: Session = Depends(get_db)):
    return crud.get_profile(db)


@app.put("/profile", response_model=schemas.ProfileOut)
def update_profile(profile: schemas.ProfileBase, db: Session = Depends(get_db), user: str = Depends(require_user)):
    return crud.update_profile(db, profile)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server.main:app", host="0.0.0.0", port=8000, reload=True)


