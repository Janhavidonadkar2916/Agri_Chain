import os
import sys

# Ensure backend path is importable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal, engine, Base
from app import models, schemas, crud

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(models.User).filter(models.User.email == "admin@agrichain.com").first():
        print("Database already seeded!")
        db.close()
        return

    print("Seeding initial AgriChain users...")

    # 1. Create Admin
    admin_user = crud.create_user(db, schemas.UserRegister(
        name="System Admin",
        email="admin@agrichain.com",
        password="admin123",
        role="admin",
        phone="+91 9999988888",
        address="AgriChain HQ, New Delhi"
    ))

    # 2. Create Farmer
    farmer_user = crud.create_user(db, schemas.UserRegister(
        name="Gurdeep Singh",
        email="farmer@agrichain.com",
        password="farmer123",
        role="farmer",
        phone="+91 9812345678",
        address="Green Acres Farm, Village Mullanpur, Ludhiana, Punjab"
    ))

    # 3. Create Transport
    transport_user = crud.create_user(db, schemas.UserRegister(
        name="AgriLogistics Express",
        email="transport@agrichain.com",
        password="transport123",
        role="transport",
        phone="+91 9876543210",
        address="GT Road Freight Hub, Ambala, Haryana"
    ))

    # 4. Create Warehouse
    warehouse_user = crud.create_user(db, schemas.UserRegister(
        name="Central Cold Storage Ltd",
        email="warehouse@agrichain.com",
        password="warehouse123",
        role="warehouse",
        phone="+91 9765432109",
        address="Industrial Park Sector 4, Gurgaon, Haryana"
    ))

    # 5. Create Retailer
    retailer_user = crud.create_user(db, schemas.UserRegister(
        name="Organic SuperMart",
        email="retailer@agrichain.com",
        password="retailer123",
        role="retailer",
        phone="+91 9654321098",
        address="Connaught Place Store #42, New Delhi"
    ))

    # 6. Create Consumer
    consumer_user = crud.create_user(db, schemas.UserRegister(
        name="Priya Sharma",
        email="consumer@agrichain.com",
        password="consumer123",
        role="consumer",
        phone="+91 9543210987",
        address="Vasant Kunj, New Delhi"
    ))

    print("Users created successfully!")
    print("Creating sample crop batches...")

    # Seed Sample Batch 1: Organic Sonalika Wheat
    batch1 = crud.create_farmer_batch(db, schemas.CreateBatchRequest(
        crop_name="Organic Sonalika Wheat",
        quantity=1200.0,
        harvest_date="2026-07-15",
        village="Mullanpur",
        district="Ludhiana",
        state="Punjab",
        description="Premium Grade A Non-GMO Sonalika Wheat harvested using organic compost."
    ), farmer_id=farmer_user.id, farmer_name=farmer_user.name, image_url="https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80", batch_id="AGRI-2026-A8F9")

    # Step through supply chain for Batch 1
    crud.start_transport(db, schemas.TransportStartRequest(
        batch_id=batch1.batch_id,
        transport_company="AgriLogistics Express",
        driver_name="Rajesh Kumar",
        vehicle_no="PB-10-AB-9876",
        pickup_location="Mullanpur Farm Depot",
        destination="Central Cold Storage, Gurgaon"
    ), user_id=transport_user.id, actor_name=transport_user.name)

    crud.complete_transport(db, schemas.TransportCompleteRequest(
        batch_id=batch1.batch_id
    ), user_id=transport_user.id, actor_name=transport_user.name)

    crud.receive_warehouse(db, schemas.WarehouseReceiveRequest(
        batch_id=batch1.batch_id,
        warehouse_name="Central Cold Storage Ltd",
        rack_location="Bay-B-Row-4"
    ), user_id=warehouse_user.id, actor_name=warehouse_user.name)

    crud.dispatch_warehouse(db, schemas.WarehouseDispatchRequest(
        batch_id=batch1.batch_id,
        destination_retailer="Organic SuperMart"
    ), user_id=warehouse_user.id, actor_name=warehouse_user.name)

    crud.receive_retailer(db, schemas.RetailerReceiveRequest(
        batch_id=batch1.batch_id,
        store_name="Organic SuperMart, Connaught Place",
        price=65.0
    ), user_id=retailer_user.id, actor_name=retailer_user.name)

    # Seed Sample Batch 2: Basmati Rice 1121
    batch2 = crud.create_farmer_batch(db, schemas.CreateBatchRequest(
        crop_name="Premium Basmati Rice 1121",
        quantity=850.0,
        harvest_date="2026-07-18",
        village="Karnal Rural",
        district="Karnal",
        state="Haryana",
        description="Aromatic long grain 1121 steam basmati rice."
    ), farmer_id=farmer_user.id, farmer_name=farmer_user.name, image_url="https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80")

    # Step through transport & warehouse for Batch 2
    crud.start_transport(db, schemas.TransportStartRequest(
        batch_id=batch2.batch_id,
        transport_company="AgriLogistics Express",
        driver_name="Harish Chander",
        vehicle_no="HR-05-XY-1234",
        pickup_location="Karnal Grain Market",
        destination="Central Cold Storage, Gurgaon"
    ), user_id=transport_user.id, actor_name=transport_user.name)

    crud.complete_transport(db, schemas.TransportCompleteRequest(
        batch_id=batch2.batch_id
    ), user_id=transport_user.id, actor_name=transport_user.name)

    crud.receive_warehouse(db, schemas.WarehouseReceiveRequest(
        batch_id=batch2.batch_id,
        warehouse_name="Central Cold Storage Ltd",
        rack_location="Aisle-3-Shelf-A"
    ), user_id=warehouse_user.id, actor_name=warehouse_user.name)

    # Seed Sample Batch 3: Fresh Alphonso Mangoes
    batch3 = crud.create_farmer_batch(db, schemas.CreateBatchRequest(
        crop_name="Ratnagiri Alphonso Mangoes",
        quantity=500.0,
        harvest_date="2026-07-22",
        village="Ratnagiri",
        district="Ratnagiri",
        state="Maharashtra",
        description="Naturally ripened export quality Alphonso Mangoes."
    ), farmer_id=farmer_user.id, farmer_name=farmer_user.name, image_url="https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80")

    b1_id = batch1.batch_id
    b2_id = batch2.batch_id
    b3_id = batch3.batch_id

    db.close()
    print("AgriChain database seeding complete!")
    print(f"Sample Batch 1 ID: {b1_id} (Full Supply Chain)")
    print(f"Sample Batch 2 ID: {b2_id} (Warehouse Stored)")
    print(f"Sample Batch 3 ID: {b3_id} (Newly Created)")

if __name__ == "__main__":
    seed()
