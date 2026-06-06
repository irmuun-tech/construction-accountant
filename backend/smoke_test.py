"""Quick end-to-end API smoke test. Run with the venv python while the server is up."""
import httpx, time, random, sys

BASE = "http://127.0.0.1:8001/api"
email = f"test_{random.randint(100000,999999)}@example.com"
results = []

def ok(name, cond, extra=""):
    results.append((name, cond, extra))
    print(("PASS" if cond else "FAIL"), name, extra)

with httpx.Client(timeout=20) as c:
    h = c.get(f"{BASE}/health").json()
    ok("health", h.get("status") == "ok", str(h))

    r = c.post(f"{BASE}/auth/register", json={"email": email, "password": "secret123", "name": "Тест Хэрэглэгч"})
    ok("register", r.status_code == 200, str(r.status_code))
    token = r.json()["token"]
    H = {"Authorization": f"Bearer {token}"}

    # duplicate register should 409
    r = c.post(f"{BASE}/auth/register", json={"email": email, "password": "secret123", "name": "x"})
    ok("register_dup_409", r.status_code == 409)

    # wrong password
    r = c.post(f"{BASE}/auth/login", json={"email": email, "password": "wrong"})
    ok("login_wrong_401", r.status_code == 401)

    # correct login
    r = c.post(f"{BASE}/auth/login", json={"email": email, "password": "secret123"})
    ok("login_ok", r.status_code == 200 and "token" in r.json())

    # unauthorized access
    r = c.get(f"{BASE}/materials")
    ok("materials_no_auth_401", r.status_code == 401)

    # create materials
    m1 = c.post(f"{BASE}/materials", headers=H, json={"name": "Цемент 500", "category": "Цемент / Cement", "supplier": "Хөтөл", "price": 18500, "unit": "уут", "min_stock": 20}).json()
    m2 = c.post(f"{BASE}/materials", headers=H, json={"name": "Арматур 12мм", "category": "Төмөр / Steel", "supplier": "Дархан", "price": 3200, "unit": "м", "min_stock": 100}).json()
    ok("create_materials", "material_id" in m1 and "material_id" in m2)

    mats = c.get(f"{BASE}/materials", headers=H).json()
    ok("list_materials", len(mats) == 2)

    search = c.get(f"{BASE}/materials", headers=H, params={"search": "цемент"}).json()
    ok("search_material", len(search) == 1 and search[0]["name"].startswith("Цемент"))

    pricef = c.get(f"{BASE}/materials", headers=H, params={"min_price": 5000}).json()
    ok("price_filter", len(pricef) == 1 and pricef[0]["name"].startswith("Цемент"))

    cats = c.get(f"{BASE}/materials/categories", headers=H).json()
    ok("categories", len(cats["categories"]) == 2)

    # update material
    upd = c.put(f"{BASE}/materials/{m1['material_id']}", headers=H, json={"name": "Цемент 500", "category": "Цемент / Cement", "supplier": "Хөтөл", "price": 19000, "unit": "уут", "min_stock": 20}).json()
    ok("update_material", upd["price"] == 19000)

    # stock entries
    s1 = c.post(f"{BASE}/stock", headers=H, json={"material_id": m1["material_id"], "quantity": 40, "date": "2026-06-01"}).json()
    s2 = c.post(f"{BASE}/stock", headers=H, json={"material_id": m2["material_id"], "quantity": 455, "date": "2026-06-01"}).json()
    ok("create_stock", "entry_id" in s1 and s1["month"] == 6 and s1["year"] == 2026)

    stock = c.get(f"{BASE}/stock", headers=H, params={"month": 6, "year": 2026}).json()
    ok("list_stock", len(stock) == 2)

    exp = c.get(f"{BASE}/stock/export", headers=H, params={"month": 6, "year": 2026})
    ok("excel_export", exp.status_code == 200 and "spreadsheetml" in exp.headers.get("content-type", ""), f"{len(exp.content)} bytes")

    # transactions
    c.post(f"{BASE}/transactions", headers=H, json={"type": "income", "category": "Борлуулалт / Sales", "amount": 5000000, "date": "2026-06-05", "description": "Гэрээ"})
    c.post(f"{BASE}/transactions", headers=H, json={"type": "outcome", "category": "Материал / Materials", "amount": 555000, "date": "2026-06-06", "description": "Цемент"})
    txns = c.get(f"{BASE}/transactions", headers=H).json()
    ok("list_txns", len(txns) == 2)

    summ = c.get(f"{BASE}/transactions/summary", headers=H, params={"month": 6, "year": 2026}).json()
    ok("txn_summary", summ["total_income"] == 5000000 and summ["total_outcome"] == 555000 and summ["net"] == 4445000)

    # loans
    loan = c.post(f"{BASE}/loans", headers=H, json={"name": "ХААН Банк", "amount": 10000000, "interest_rate": 18, "payment_amount": 2500000, "frequency": "monthly", "start_date": "2026-01-01"}).json()
    ok("create_loan", "loan_id" in loan and loan["status"] == "active" and loan["next_payment_date"] >= "2026-06-06")

    paid = c.post(f"{BASE}/loans/{loan['loan_id']}/pay", headers=H).json()
    ok("loan_pay", paid["amount"] == 7500000)

    loans = c.get(f"{BASE}/loans", headers=H).json()
    ok("list_loans", len(loans) == 1)

    # dashboard
    dash = c.get(f"{BASE}/dashboard", headers=H).json()
    ok("dashboard", dash["total_materials"] == 2 and dash["total_stock_entries"] == 2 and dash["monthly_income"] == 5000000 and dash["active_loans"] == 1)

    # cleanup: delete material -> 404 after
    c.delete(f"{BASE}/materials/{m2['material_id']}", headers=H)
    mats2 = c.get(f"{BASE}/materials", headers=H).json()
    ok("delete_material", len(mats2) == 1)

passed = sum(1 for _, c2, _ in results if c2)
print(f"\n{passed}/{len(results)} passed")
sys.exit(0 if passed == len(results) else 1)
