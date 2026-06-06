import httpx, random, sys
BASE = "http://127.0.0.1:8001/api"
email = f"conv_{random.randint(100000,999999)}@x.com"
ok = True
with httpx.Client(timeout=20) as c:
    tok = c.post(BASE + "/auth/register", json={"email": email, "password": "secret123", "name": "C"}).json()["token"]
    H = {"Authorization": "Bearer " + tok}

    csv_bytes = "name,qty,price\nЦемент,40,18500\nАрматур,455,3200\n".encode("utf-8")
    r = c.post(BASE + "/convert", headers=H, files={"file": ("data.csv", csv_bytes, "text/csv")})
    print("CSV ->", r.status_code, r.headers.get("content-type", "")[:45], len(r.content), "bytes, rows=", r.headers.get("x-rows"))
    ok &= r.status_code == 200 and "spreadsheetml" in r.headers.get("content-type", "") and r.headers.get("x-rows") == "3"

    js = b'[{"name":"A","price":100},{"name":"B","price":200,"note":"x"}]'
    r = c.post(BASE + "/convert", headers=H, files={"file": ("data.json", js, "application/json")})
    print("JSON ->", r.status_code, len(r.content), "bytes, rows=", r.headers.get("x-rows"))
    ok &= r.status_code == 200 and r.headers.get("x-rows") == "3"  # header + 2

    tsv = b"a\tb\tc\n1\t2\t3\n4\t5\t6\n"
    r = c.post(BASE + "/convert", headers=H, files={"file": ("data.tsv", tsv, "text/tab-separated-values")})
    print("TSV ->", r.status_code, "rows=", r.headers.get("x-rows"))
    ok &= r.status_code == 200 and r.headers.get("x-rows") == "3"

    r = c.post(BASE + "/convert", headers=H, files={"file": ("e.csv", b"", "text/csv")})
    print("empty ->", r.status_code, "(expect 400)")
    ok &= r.status_code == 400

    r = c.post(BASE + "/convert", files={"file": ("data.csv", csv_bytes, "text/csv")})
    print("no-auth ->", r.status_code, "(expect 401)")
    ok &= r.status_code == 401

    r = c.post(BASE + "/convert", headers=H, files={"file": ("book.xlsx", b"PK\x03\x04junk", "application/octet-stream")})
    print("xlsx-input ->", r.status_code, "(expect 400)")
    ok &= r.status_code == 400

print("\nRESULT:", "PASS" if ok else "FAIL")
sys.exit(0 if ok else 1)
