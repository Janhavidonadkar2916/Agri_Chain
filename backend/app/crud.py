from sqlalchemy.orm import Session
from app import models, schemas
from app.auth import hash_password
from app.blockchain import blockchain_engine
from datetime import datetime

# --- USER CRUD ---
def create_user(db: Session, user_data: schemas.UserRegister):
    hashed_pwd = hash_password(user_data.password)
    # Automatically approve farmer, consumer, admin by default; transport/warehouse/retailer can be auto-approved or approved by admin
    is_approved = True if user_data.role.lower() in ["farmer", "consumer", "admin"] else True
    
    db_user = models.User(
        name=user_data.name,
        email=user_data.email.lower(),
        password_hash=hashed_pwd,
        role=user_data.role.lower(),
        phone=user_data.phone,
        address=user_data.address,
        is_approved=is_approved
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email.lower()).first()

def get_user_by_id(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_all_users(db: Session):
    return db.query(models.User).order_by(models.User.id.desc()).all()

def update_user_approval(db: Session, user_id: int, approved: bool):
    user = get_user_by_id(db, user_id)
    if user:
        user.is_approved = approved
        db.commit()
        db.refresh(user)
    return user

def delete_user(db: Session, user_id: int):
    user = get_user_by_id(db, user_id)
    if user:
        db.delete(user)
        db.commit()
        return True
    return False

# --- BATCH CRUD ---
def create_farmer_batch(db: Session, batch_data: schemas.CreateBatchRequest, farmer_id: int, farmer_name: str, image_url: str = None, batch_id: str = None):
    if not batch_id:
        batch_id = blockchain_engine.generate_batch_id()
    block_hash, tx_hash, block_num = blockchain_engine.create_genesis_block(
        batch_id=batch_id,
        crop_name=batch_data.crop_name,
        quantity=batch_data.quantity,
        farmer_name=farmer_name
    )

    db_batch = models.FarmerBatch(
        batch_id=batch_id,
        crop_name=batch_data.crop_name,
        quantity=batch_data.quantity,
        harvest_date=batch_data.harvest_date,
        village=batch_data.village,
        district=batch_data.district,
        state=batch_data.state,
        description=batch_data.description,
        image_url=image_url or "https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=600&q=80",
        farmer_id=farmer_id,
        current_owner=f"Farmer ({farmer_name})",
        status="Created",
        blockchain_hash=block_hash,
        tx_hash=tx_hash,
        block_number=block_num
    )
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)

    # Record Initial Transaction History
    tx = models.TransactionHistory(
        batch_id=batch_id,
        action="Batch Created at Farm",
        from_role="None",
        to_role="Farmer",
        actor_id=farmer_id,
        actor_name=farmer_name,
        timestamp=datetime.utcnow(),
        tx_hash=tx_hash,
        block_number=block_num
    )
    db.add(tx)

    # Record Initial Blockchain Block
    block = models.BlockchainBlock(
        batch_id=batch_id,
        block_number=block_num,
        current_hash=block_hash,
        prev_hash="0x0000000000000000000000000000000000000000000000000000000000000000",
        tx_hash=tx_hash,
        merkle_root=block_hash,
        owner=f"Farmer ({farmer_name})",
        timestamp=datetime.utcnow()
    )
    db.add(block)
    db.commit()

    return db_batch

def get_batch_by_id(db: Session, batch_id: str):
    return db.query(models.FarmerBatch).filter(models.FarmerBatch.batch_id == batch_id).first()

def get_farmer_batches(db: Session, farmer_id: int):
    return db.query(models.FarmerBatch).filter(models.FarmerBatch.farmer_id == farmer_id).order_by(models.FarmerBatch.id.desc()).all()

def get_all_batches(db: Session):
    return db.query(models.FarmerBatch).order_by(models.FarmerBatch.id.desc()).all()

# --- TRANSPORT OPERATIONS ---
def start_transport(db: Session, req: schemas.TransportStartRequest, user_id: int, actor_name: str):
    batch = get_batch_by_id(db, req.batch_id)
    if not batch:
        return None, "Batch ID not found"

    batch.status = "In Transit"
    batch.current_owner = f"Transport ({req.transport_company})"

    # Get previous block hash
    last_block = db.query(models.BlockchainBlock).filter(models.BlockchainBlock.batch_id == req.batch_id).order_by(models.BlockchainBlock.block_number.desc()).first()
    prev_hash = last_block.current_hash if last_block else batch.blockchain_hash
    prev_num = last_block.block_number if last_block else 1

    current_hash, tx_hash, block_num = blockchain_engine.create_next_block(
        batch_id=req.batch_id,
        prev_hash=prev_hash,
        prev_block_num=prev_num,
        action=f"Pickup for transport to {req.destination}",
        actor_role="Transport",
        owner=batch.current_owner
    )

    batch.blockchain_hash = current_hash
    batch.tx_hash = tx_hash
    batch.block_number = block_num

    log = models.TransportLog(
        batch_id=req.batch_id,
        transport_company=req.transport_company,
        driver_name=req.driver_name,
        vehicle_no=req.vehicle_no,
        pickup_location=req.pickup_location,
        destination=req.destination,
        pickup_time=datetime.utcnow(),
        status="In Transit",
        updated_by=user_id
    )
    db.add(log)

    tx = models.TransactionHistory(
        batch_id=req.batch_id,
        action=f"Picked up by {req.transport_company} ({req.driver_name})",
        from_role="Farmer",
        to_role="Transport",
        actor_id=user_id,
        actor_name=actor_name,
        timestamp=datetime.utcnow(),
        tx_hash=tx_hash,
        block_number=block_num
    )
    db.add(tx)

    block = models.BlockchainBlock(
        batch_id=req.batch_id,
        block_number=block_num,
        current_hash=current_hash,
        prev_hash=prev_hash,
        tx_hash=tx_hash,
        merkle_root=current_hash,
        owner=batch.current_owner,
        timestamp=datetime.utcnow()
    )
    db.add(block)
    db.commit()
    db.refresh(batch)
    return batch, None

def complete_transport(db: Session, req: schemas.TransportCompleteRequest, user_id: int, actor_name: str):
    batch = get_batch_by_id(db, req.batch_id)
    if not batch:
        return None, "Batch ID not found"

    transport_log = db.query(models.TransportLog).filter(models.TransportLog.batch_id == req.batch_id).order_by(models.TransportLog.id.desc()).first()
    if transport_log:
        transport_log.status = "Delivered"
        transport_log.delivery_time = datetime.utcnow()

    batch.status = "Delivered"
    batch.current_owner = "Warehouse Depot"

    # Get previous block hash
    last_block = db.query(models.BlockchainBlock).filter(models.BlockchainBlock.batch_id == req.batch_id).order_by(models.BlockchainBlock.block_number.desc()).first()
    prev_hash = last_block.current_hash if last_block else batch.blockchain_hash
    prev_num = last_block.block_number if last_block else 1

    current_hash, tx_hash, block_num = blockchain_engine.create_next_block(
        batch_id=req.batch_id,
        prev_hash=prev_hash,
        prev_block_num=prev_num,
        action="Delivery Completed at Warehouse Hub",
        actor_role="Transport",
        owner=batch.current_owner
    )

    batch.blockchain_hash = current_hash
    batch.tx_hash = tx_hash
    batch.block_number = block_num

    tx = models.TransactionHistory(
        batch_id=req.batch_id,
        action="Transport Delivery Completed",
        from_role="Transport",
        to_role="Warehouse",
        actor_id=user_id,
        actor_name=actor_name,
        timestamp=datetime.utcnow(),
        tx_hash=tx_hash,
        block_number=block_num
    )
    db.add(tx)

    block = models.BlockchainBlock(
        batch_id=req.batch_id,
        block_number=block_num,
        current_hash=current_hash,
        prev_hash=prev_hash,
        tx_hash=tx_hash,
        merkle_root=current_hash,
        owner=batch.current_owner,
        timestamp=datetime.utcnow()
    )
    db.add(block)
    db.commit()
    db.refresh(batch)
    return batch, None

# --- WAREHOUSE OPERATIONS ---
def receive_warehouse(db: Session, req: schemas.WarehouseReceiveRequest, user_id: int, actor_name: str):
    batch = get_batch_by_id(db, req.batch_id)
    if not batch:
        return None, "Batch ID not found"

    batch.status = "Stored"
    batch.current_owner = f"Warehouse ({req.warehouse_name})"

    last_block = db.query(models.BlockchainBlock).filter(models.BlockchainBlock.batch_id == req.batch_id).order_by(models.BlockchainBlock.block_number.desc()).first()
    prev_hash = last_block.current_hash if last_block else batch.blockchain_hash
    prev_num = last_block.block_number if last_block else 1

    current_hash, tx_hash, block_num = blockchain_engine.create_next_block(
        batch_id=req.batch_id,
        prev_hash=prev_hash,
        prev_block_num=prev_num,
        action=f"Stored at {req.warehouse_name} (Rack {req.rack_location})",
        actor_role="Warehouse",
        owner=batch.current_owner
    )

    batch.blockchain_hash = current_hash
    batch.tx_hash = tx_hash
    batch.block_number = block_num

    log = models.WarehouseLog(
        batch_id=req.batch_id,
        warehouse_name=req.warehouse_name,
        rack_location=req.rack_location,
        quantity=batch.quantity,
        status="Stored",
        received_date=datetime.utcnow(),
        updated_by=user_id
    )
    db.add(log)

    tx = models.TransactionHistory(
        batch_id=req.batch_id,
        action=f"Stored in Warehouse {req.warehouse_name} (Rack {req.rack_location})",
        from_role="Transport",
        to_role="Warehouse",
        actor_id=user_id,
        actor_name=actor_name,
        timestamp=datetime.utcnow(),
        tx_hash=tx_hash,
        block_number=block_num
    )
    db.add(tx)

    block = models.BlockchainBlock(
        batch_id=req.batch_id,
        block_number=block_num,
        current_hash=current_hash,
        prev_hash=prev_hash,
        tx_hash=tx_hash,
        merkle_root=current_hash,
        owner=batch.current_owner,
        timestamp=datetime.utcnow()
    )
    db.add(block)
    db.commit()
    db.refresh(batch)
    return batch, None

def dispatch_warehouse(db: Session, req: schemas.WarehouseDispatchRequest, user_id: int, actor_name: str):
    batch = get_batch_by_id(db, req.batch_id)
    if not batch:
        return None, "Batch ID not found"

    wh_log = db.query(models.WarehouseLog).filter(models.WarehouseLog.batch_id == req.batch_id).order_by(models.WarehouseLog.id.desc()).first()
    if wh_log:
        wh_log.status = "Dispatched"
        wh_log.dispatched_date = datetime.utcnow()

    last_block = db.query(models.BlockchainBlock).filter(models.BlockchainBlock.batch_id == req.batch_id).order_by(models.BlockchainBlock.block_number.desc()).first()
    prev_hash = last_block.current_hash if last_block else batch.blockchain_hash
    prev_num = last_block.block_number if last_block else 1

    current_hash, tx_hash, block_num = blockchain_engine.create_next_block(
        batch_id=req.batch_id,
        prev_hash=prev_hash,
        prev_block_num=prev_num,
        action=f"Dispatched from Warehouse to {req.destination_retailer}",
        actor_role="Warehouse",
        owner=batch.current_owner
    )

    batch.blockchain_hash = current_hash
    batch.tx_hash = tx_hash
    batch.block_number = block_num

    tx = models.TransactionHistory(
        batch_id=req.batch_id,
        action=f"Dispatched to Retailer {req.destination_retailer}",
        from_role="Warehouse",
        to_role="Retailer",
        actor_id=user_id,
        actor_name=actor_name,
        timestamp=datetime.utcnow(),
        tx_hash=tx_hash,
        block_number=block_num
    )
    db.add(tx)

    block = models.BlockchainBlock(
        batch_id=req.batch_id,
        block_number=block_num,
        current_hash=current_hash,
        prev_hash=prev_hash,
        tx_hash=tx_hash,
        merkle_root=current_hash,
        owner=batch.current_owner,
        timestamp=datetime.utcnow()
    )
    db.add(block)
    db.commit()
    db.refresh(batch)
    return batch, None

# --- RETAILER OPERATIONS ---
def receive_retailer(db: Session, req: schemas.RetailerReceiveRequest, user_id: int, actor_name: str):
    batch = get_batch_by_id(db, req.batch_id)
    if not batch:
        return None, "Batch ID not found"

    batch.status = "Available"
    batch.current_owner = f"Retail Store ({req.store_name})"

    last_block = db.query(models.BlockchainBlock).filter(models.BlockchainBlock.batch_id == req.batch_id).order_by(models.BlockchainBlock.block_number.desc()).first()
    prev_hash = last_block.current_hash if last_block else batch.blockchain_hash
    prev_num = last_block.block_number if last_block else 1

    current_hash, tx_hash, block_num = blockchain_engine.create_next_block(
        batch_id=req.batch_id,
        prev_hash=prev_hash,
        prev_block_num=prev_num,
        action=f"Received at Retail Store {req.store_name} @ ₹{req.price}/kg",
        actor_role="Retailer",
        owner=batch.current_owner
    )

    batch.blockchain_hash = current_hash
    batch.tx_hash = tx_hash
    batch.block_number = block_num

    log = models.RetailerLog(
        batch_id=req.batch_id,
        store_name=req.store_name,
        price=req.price,
        quantity=batch.quantity,
        status="Available",
        received_date=datetime.utcnow(),
        updated_by=user_id
    )
    db.add(log)

    tx = models.TransactionHistory(
        batch_id=req.batch_id,
        action=f"Product Available at Retail Store ({req.store_name})",
        from_role="Warehouse",
        to_role="Retailer",
        actor_id=user_id,
        actor_name=actor_name,
        timestamp=datetime.utcnow(),
        tx_hash=tx_hash,
        block_number=block_num
    )
    db.add(tx)

    block = models.BlockchainBlock(
        batch_id=req.batch_id,
        block_number=block_num,
        current_hash=current_hash,
        prev_hash=prev_hash,
        tx_hash=tx_hash,
        merkle_root=current_hash,
        owner=batch.current_owner,
        timestamp=datetime.utcnow()
    )
    db.add(block)
    db.commit()
    db.refresh(batch)
    return batch, None

def sell_retailer(db: Session, req: schemas.RetailerSellRequest, user_id: int, actor_name: str):
    batch = get_batch_by_id(db, req.batch_id)
    if not batch:
        return None, "Batch ID not found"

    batch.status = "Sold"
    batch.current_owner = "Consumer"

    ret_log = db.query(models.RetailerLog).filter(models.RetailerLog.batch_id == req.batch_id).order_by(models.RetailerLog.id.desc()).first()
    if ret_log:
        ret_log.status = "Sold"
        ret_log.sold_date = datetime.utcnow()

    last_block = db.query(models.BlockchainBlock).filter(models.BlockchainBlock.batch_id == req.batch_id).order_by(models.BlockchainBlock.block_number.desc()).first()
    prev_hash = last_block.current_hash if last_block else batch.blockchain_hash
    prev_num = last_block.block_number if last_block else 1

    current_hash, tx_hash, block_num = blockchain_engine.create_next_block(
        batch_id=req.batch_id,
        prev_hash=prev_hash,
        prev_block_num=prev_num,
        action="Product Purchased by Consumer",
        actor_role="Retailer",
        owner="Consumer"
    )

    batch.blockchain_hash = current_hash
    batch.tx_hash = tx_hash
    batch.block_number = block_num

    tx = models.TransactionHistory(
        batch_id=req.batch_id,
        action="Sold to End Consumer",
        from_role="Retailer",
        to_role="Consumer",
        actor_id=user_id,
        actor_name=actor_name,
        timestamp=datetime.utcnow(),
        tx_hash=tx_hash,
        block_number=block_num
    )
    db.add(tx)

    block = models.BlockchainBlock(
        batch_id=req.batch_id,
        block_number=block_num,
        current_hash=current_hash,
        prev_hash=prev_hash,
        tx_hash=tx_hash,
        merkle_root=current_hash,
        owner="Consumer",
        timestamp=datetime.utcnow()
    )
    db.add(block)
    db.commit()
    db.refresh(batch)
    return batch, None
