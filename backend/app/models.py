from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(30), nullable=False) # farmer, transport, warehouse, retailer, consumer, admin
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    is_approved = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    batches = relationship("FarmerBatch", back_populates="farmer")

class FarmerBatch(Base):
    __tablename__ = "farmer_batches"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(String(50), unique=True, index=True, nullable=False)
    crop_name = Column(String(100), nullable=False)
    quantity = Column(Float, nullable=False)
    harvest_date = Column(String(30), nullable=False)
    village = Column(String(100), nullable=False)
    district = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    current_owner = Column(String(100), nullable=False, default="Farmer")
    status = Column(String(30), nullable=False, default="Created") # Created, In Transit, Stored, Available, Sold
    blockchain_hash = Column(String(66), nullable=False)
    tx_hash = Column(String(66), nullable=False)
    block_number = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer = relationship("User", back_populates="batches")
    transport_logs = relationship("TransportLog", back_populates="batch", cascade="all, delete-orphan")
    warehouse_logs = relationship("WarehouseLog", back_populates="batch", cascade="all, delete-orphan")
    retailer_logs = relationship("RetailerLog", back_populates="batch", cascade="all, delete-orphan")
    transactions = relationship("TransactionHistory", back_populates="batch", cascade="all, delete-orphan")
    blocks = relationship("BlockchainBlock", back_populates="batch", cascade="all, delete-orphan")

class TransportLog(Base):
    __tablename__ = "transport_logs"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(String(50), ForeignKey("farmer_batches.batch_id"), nullable=False)
    transport_company = Column(String(100), nullable=False)
    driver_name = Column(String(100), nullable=False)
    vehicle_no = Column(String(50), nullable=False)
    pickup_location = Column(String(200), nullable=False)
    destination = Column(String(200), nullable=False)
    pickup_time = Column(DateTime, default=datetime.utcnow)
    delivery_time = Column(DateTime, nullable=True)
    status = Column(String(30), default="In Transit") # In Transit, Delivered
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    batch = relationship("FarmerBatch", back_populates="transport_logs")

class WarehouseLog(Base):
    __tablename__ = "warehouse_logs"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(String(50), ForeignKey("farmer_batches.batch_id"), nullable=False)
    warehouse_name = Column(String(100), nullable=False)
    rack_location = Column(String(50), nullable=False)
    quantity = Column(Float, nullable=False)
    status = Column(String(30), default="Stored") # Stored, Dispatched
    received_date = Column(DateTime, default=datetime.utcnow)
    dispatched_date = Column(DateTime, nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    batch = relationship("FarmerBatch", back_populates="warehouse_logs")

class RetailerLog(Base):
    __tablename__ = "retailer_logs"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(String(50), ForeignKey("farmer_batches.batch_id"), nullable=False)
    store_name = Column(String(100), nullable=False)
    price = Column(Float, nullable=False)
    quantity = Column(Float, nullable=False)
    status = Column(String(30), default="Available") # Available, Sold
    received_date = Column(DateTime, default=datetime.utcnow)
    sold_date = Column(DateTime, nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    batch = relationship("FarmerBatch", back_populates="retailer_logs")

class TransactionHistory(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(String(50), ForeignKey("farmer_batches.batch_id"), nullable=False)
    action = Column(String(100), nullable=False)
    from_role = Column(String(30), nullable=False)
    to_role = Column(String(30), nullable=False)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    actor_name = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    tx_hash = Column(String(66), nullable=False)
    block_number = Column(Integer, nullable=False)

    batch = relationship("FarmerBatch", back_populates="transactions")

class BlockchainBlock(Base):
    __tablename__ = "blockchain_blocks"

    id = Column(Integer, primary_key=True, index=True)
    batch_id = Column(String(50), ForeignKey("farmer_batches.batch_id"), nullable=False)
    block_number = Column(Integer, nullable=False)
    current_hash = Column(String(66), nullable=False)
    prev_hash = Column(String(66), nullable=False)
    tx_hash = Column(String(66), nullable=False)
    merkle_root = Column(String(66), nullable=False)
    owner = Column(String(100), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    batch = relationship("FarmerBatch", back_populates="blocks")
