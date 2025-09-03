from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from server.main import app, create_access_token
from server.database import Base, get_db


SQLALCHEMY_DATABASE_URL = "sqlite+pysqlite:///./test_spendwise.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Ensure fresh schema
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_settings_default_and_update():
    r = client.get("/settings")
    assert r.status_code == 200
    data = r.json()
    assert data["income"] == 0
    assert data["budget"] == 0

    r = client.put("/settings", json={"income": 1000, "budget": 500})
    if r.status_code == 401:
        token = create_access_token("test")
        r = client.put("/settings", json={"income": 1000, "budget": 500}, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    data = r.json()
    assert data["income"] == 1000
    assert data["budget"] == 500


def test_expense_crud():
    expense = {
        "id": "e1",
        "name": "Lunch",
        "category": "Food",
        "amount": 10.5,
        "date": "2024-01-01T12:00:00Z"
    }
    r = client.post("/expenses", json=expense)
    if r.status_code == 401:
        token = create_access_token("test")
        r = client.post("/expenses", json=expense, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200

    r = client.get("/expenses")
    assert r.status_code == 200
    assert any(e["id"] == "e1" for e in r.json())

    r = client.put("/expenses/e1", json={**expense, "amount": 12.0})
    if r.status_code == 401:
        token = create_access_token("test")
        r = client.put("/expenses/e1", json={**expense, "amount": 12.0}, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["amount"] == 12.0

    r = client.delete("/expenses/e1")
    if r.status_code == 401:
        token = create_access_token("test")
        r = client.delete("/expenses/e1", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200

