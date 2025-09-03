from sqlalchemy.orm import Session
from typing import List, Optional
from . import models, schemas


# Expenses
def create_expense(db: Session, expense: schemas.ExpenseCreate) -> models.Expense:
    db_exp = models.Expense(
        id=expense.id,
        name=expense.name,
        category=expense.category,
        amount=expense.amount,
        date=expense.date,
    )
    db.add(db_exp)
    db.commit()
    db.refresh(db_exp)
    return db_exp


def list_expenses(db: Session) -> List[models.Expense]:
    return db.query(models.Expense).order_by(models.Expense.date.desc()).all()


def get_expense(db: Session, expense_id: str) -> Optional[models.Expense]:
    return db.query(models.Expense).filter(models.Expense.id == expense_id).first()


def update_expense(db: Session, expense: schemas.ExpenseUpdate) -> Optional[models.Expense]:
    db_exp = get_expense(db, expense.id)
    if not db_exp:
        return None
    db_exp.name = expense.name
    db_exp.category = expense.category
    db_exp.amount = expense.amount
    db_exp.date = expense.date
    db.commit()
    db.refresh(db_exp)
    return db_exp


def delete_expense(db: Session, expense_id: str) -> bool:
    db_exp = get_expense(db, expense_id)
    if not db_exp:
        return False
    db.delete(db_exp)
    db.commit()
    return True


# Settings (single row)
def get_settings(db: Session) -> models.Settings:
    settings = db.query(models.Settings).first()
    if not settings:
        settings = models.Settings(income=0, budget=0)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def update_settings(db: Session, data: schemas.SettingsBase) -> models.Settings:
    settings = get_settings(db)
    settings.income = data.income
    settings.budget = data.budget
    db.commit()
    db.refresh(settings)
    return settings


# Profile (single row)
def get_profile(db: Session) -> models.Profile:
    profile = db.query(models.Profile).first()
    if not profile:
        profile = models.Profile()
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


def update_profile(db: Session, data: schemas.ProfileBase) -> models.Profile:
    profile = get_profile(db)
    for field, value in data.dict(exclude_unset=True).items():
        setattr(profile, field, value)
    db.commit()
    db.refresh(profile)
    return profile


