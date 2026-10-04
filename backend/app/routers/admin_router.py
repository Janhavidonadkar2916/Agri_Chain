from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import schemas, crud, models
from app.auth import require_role

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/users", response_model=List[schemas.UserResponse])
def list_all_users(
    current_user: models.User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    return crud.get_all_users(db)

@router.put("/users/{user_id}/approve", response_model=schemas.UserResponse)
def approve_user(
    user_id: int,
    approved: bool = True,
    current_user: models.User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    user = crud.update_user_approval(db, user_id, approved)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: models.User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")
    success = crud.delete_user(db, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

@router.get("/analytics", response_model=schemas.AdminAnalytics)
def get_admin_analytics(
    current_user: models.User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    users = db.query(models.User).all()
    batches = db.query(models.FarmerBatch).all()
    txs = db.query(models.TransactionHistory).all()

    role_counts = {}
    for u in users:
        role_counts[u.role] = role_counts.get(u.role, 0) + 1

    status_counts = {}
    for b in batches:
        status_counts[b.status] = status_counts.get(b.status, 0) + 1

    pending_approvals = sum(1 for u in users if not u.is_approved)
    in_transit_count = status_counts.get("In Transit", 0)
    warehouse_stored_count = status_counts.get("Stored", 0)
    retail_available_count = status_counts.get("Available", 0)

    return {
        "total_users": len(users),
        "total_batches": len(batches),
        "pending_approvals": pending_approvals,
        "in_transit_count": in_transit_count,
        "warehouse_stored_count": warehouse_stored_count,
        "retail_available_count": retail_available_count,
        "total_transactions": len(txs),
        "role_distribution": role_counts,
        "status_distribution": status_counts
    }
