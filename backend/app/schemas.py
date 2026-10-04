from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# --- AUTH SCHEMAS ---
class UserRegister(BaseModel):
    name: str = Field(..., example="Ramesh Kumar")
    email: str = Field(..., example="farmer@agrichain.com")
    password: str = Field(..., min_length=4)
    role: str = Field(..., example="farmer") # farmer, transport, warehouse, retailer, consumer, admin
    phone: Optional[str] = Field(None, example="+91 9876543210")
    address: Optional[str] = Field(None, example="Green Valley Farm, Punjab")

class UserLogin(BaseModel):
    email: str
    password: str
    role: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    phone: Optional[str]
    address: Optional[str]
    is_approved: bool
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- FARMER SCHEMAS ---
class CreateBatchRequest(BaseModel):
    crop_name: str = Field(..., example="Organic Wheat (HD-2967)")
    quantity: float = Field(..., example=500.0) # in kg/quintals
    harvest_date: str = Field(..., example="2026-07-20")
    village: str = Field(..., example="Ludhiana Rural")
    district: str = Field(..., example="Ludhiana")
    state: str = Field(..., example="Punjab")
    description: Optional[str] = Field(None, example="Grade A Organic Harvest without synthetic pesticides")

class BatchResponse(BaseModel):
    id: int
    batch_id: str
    crop_name: str
    quantity: float
    harvest_date: str
    village: str
    district: str
    state: str
    description: Optional[str]
    image_url: Optional[str]
    farmer_id: int
    current_owner: str
    status: str
    blockchain_hash: str
    tx_hash: str
    block_number: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- TRANSPORT SCHEMAS ---
class TransportStartRequest(BaseModel):
    batch_id: str
    transport_company: str
    driver_name: str
    vehicle_no: str
    pickup_location: str
    destination: str

class TransportCompleteRequest(BaseModel):
    batch_id: str

# --- WAREHOUSE SCHEMAS ---
class WarehouseReceiveRequest(BaseModel):
    batch_id: str
    warehouse_name: str
    rack_location: str

class WarehouseDispatchRequest(BaseModel):
    batch_id: str
    destination_retailer: str

# --- RETAILER SCHEMAS ---
class RetailerReceiveRequest(BaseModel):
    batch_id: str
    store_name: str
    price: float

class RetailerSellRequest(BaseModel):
    batch_id: str

# --- HISTORY & TIMELINE SCHEMAS ---
class HistoryItem(BaseModel):
    id: int
    batch_id: str
    action: str
    from_role: str
    to_role: str
    actor_name: str
    timestamp: datetime
    tx_hash: str
    block_number: int

    class Config:
        from_attributes = True

class VerificationResponse(BaseModel):
    is_authentic: bool
    batch: BatchResponse
    farmer_info: Optional[UserResponse]
    timeline: List[HistoryItem]
    blockchain_hash: str
    tx_hash: str
    block_number: int
    merkle_proof_valid: bool

# --- BLOCKCHAIN EXPLORER SCHEMAS ---
class BlockResponse(BaseModel):
    id: int
    batch_id: str
    block_number: int
    current_hash: str
    prev_hash: str
    tx_hash: str
    merkle_root: str
    owner: str
    timestamp: datetime

    class Config:
        from_attributes = True

# --- ADMIN METRICS SCHEMAS ---
class AdminAnalytics(BaseModel):
    total_users: int
    total_batches: int
    pending_approvals: int
    in_transit_count: int
    warehouse_stored_count: int
    retail_available_count: int
    total_transactions: int
    role_distribution: dict
    status_distribution: dict
