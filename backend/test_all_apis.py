import requests
from fastapi.testclient import TestClient

BASE_URL = "http://127.0.0.1:8000"

class ApiTestClient:
    def __init__(self):
        self.use_live = False
        try:
            res = requests.get(f"{BASE_URL}/", timeout=1)
            if res.status_code == 200:
                self.use_live = True
        except Exception:
            pass

        if not self.use_live:
            from app.main import app
            self.client = TestClient(app)

    def post(self, url, json=None, headers=None):
        if self.use_live:
            return requests.post(f"{BASE_URL}{url}", json=json, headers=headers)
        else:
            return self.client.post(url, json=json, headers=headers)

    def get(self, url, headers=None):
        if self.use_live:
            return requests.get(f"{BASE_URL}{url}", headers=headers)
        else:
            return self.client.get(url, headers=headers)

def run_tests():
    print("--- TESTING AGRICHAIN API ENDPOINTS ---")
    client = ApiTestClient()
    mode = "Live Server" if client.use_live else "FastAPI TestClient"
    print(f"Running tests via: {mode}\n")

    # 1. Login Admin
    admin_login_res = client.post("/api/auth/login", json={
        "email": "admin@agrichain.com",
        "password": "admin123"
    })
    assert admin_login_res.status_code == 200, f"Admin login failed: {admin_login_res.text}"
    admin_login = admin_login_res.json()
    assert "access_token" in admin_login, "Admin login failed"
    admin_token = admin_login["access_token"]
    print("✔ Admin Login Success")

    # 2. Admin Analytics
    analytics_res = client.get("/api/admin/analytics", headers={"Authorization": f"Bearer {admin_token}"})
    assert analytics_res.status_code == 200, "Analytics failed"
    analytics = analytics_res.json()
    assert analytics["total_users"] > 0, "Analytics failed"
    print(f"✔ Admin Analytics Verified: {analytics['total_batches']} total batches, {analytics['total_users']} users")

    # 3. Login Farmer & Get Batches
    farmer_login_res = client.post("/api/auth/login", json={
        "email": "farmer@agrichain.com",
        "password": "farmer123",
        "role": "farmer"
    })
    assert farmer_login_res.status_code == 200, "Farmer login failed"
    farmer_login = farmer_login_res.json()
    farmer_token = farmer_login["access_token"]

    batches_res = client.get("/api/farmer/my-batches", headers={"Authorization": f"Bearer {farmer_token}"})
    assert batches_res.status_code == 200, "Farmer batches request failed"
    batches = batches_res.json()
    assert len(batches) > 0, "Farmer batches empty"
    print(f"✔ Farmer Dashboard Verified: {len(batches)} batches found")

    # 4. Login Transport
    transport_login_res = client.post("/api/auth/login", json={
        "email": "transport@agrichain.com",
        "password": "transport123",
        "role": "transport"
    })
    assert transport_login_res.status_code == 200, "Transport login failed"
    transport_login = transport_login_res.json()
    transport_token = transport_login["access_token"]

    shipments_res = client.get("/api/transport/active-shipments", headers={"Authorization": f"Bearer {transport_token}"})
    assert shipments_res.status_code == 200, "Active shipments failed"
    shipments = shipments_res.json()
    print(f"✔ Transport Dashboard Verified: {len(shipments)} active shipments")

    # 5. Public Consumer Verification
    sample_id = batches[0]["batch_id"]
    verification_res = client.get(f"/api/consumer/verify/{sample_id}")
    assert verification_res.status_code == 200, "Consumer verify failed"
    verification = verification_res.json()
    assert verification["is_authentic"] is True, "Consumer verification failed"
    print(f"✔ Consumer Public Verification Verified for Batch '{sample_id}' (Authentic = True)")

    # 6. Blockchain Explorer
    blocks_res = client.get("/api/blockchain/blocks")
    assert blocks_res.status_code == 200, "Blockchain blocks failed"
    blocks = blocks_res.json()
    assert len(blocks) > 0, "Blockchain blocks empty"

    search_res_obj = client.get(f"/api/blockchain/search?query={sample_id}")
    assert search_res_obj.status_code == 200, "Blockchain search failed"
    search_res = search_res_obj.json()
    assert search_res["batch"]["batch_id"] == sample_id, "Blockchain search failed"
    print(f"✔ Blockchain Explorer Verified: {len(blocks)} blocks total, search for '{sample_id}' matched")

    print("\nALL API ENDPOINT INTEGRATION TESTS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    run_tests()

