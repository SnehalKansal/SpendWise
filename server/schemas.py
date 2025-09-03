from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class ExpenseBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    category: str = Field(min_length=1, max_length=100)
    amount: float = Field(ge=0)
    date: datetime


class ExpenseCreate(ExpenseBase):
    id: str


class ExpenseUpdate(ExpenseBase):
    id: str


class ExpenseOut(ExpenseBase):
    id: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class SettingsBase(BaseModel):
    income: float = Field(default=0, ge=0)
    budget: float = Field(default=0, ge=0)


class SettingsOut(SettingsBase):
    id: int

    class Config:
        from_attributes = True


class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    profile_picture: Optional[str] = None


class ProfileOut(ProfileBase):
    id: int

    class Config:
        from_attributes = True


