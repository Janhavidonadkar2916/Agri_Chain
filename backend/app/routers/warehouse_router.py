from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import schemas, crud, models
from app.auth import require_role

router = APIRouter(prefix="/api/warehouse", tags=["Warehouse"])

@router.post("/receive", response_model=schemas.BatchResponse)
def receive_warehouse_batch(
    req: schemas.WarehouseReceiveRequest,
    current_user: models.User = Depends(require_role(["warehouse"])),
    db: Session = Depends(get_db)
):
    batch, error = crud.receive_warehouse(db, req, user_id=current_user.id, actor_name=current_user.name)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return batch

@router.post("/dispatch", response_model=schemas.BatchResponse)
def dispatch_warehouse_batch(
    req: schemas.WarehouseDispatchRequest,
    current_user: models.User = Depends(require_role(["warehouse"])),
    db: Session = Depends(get_db)
):
    batch, error = crud.dispatch_warehouse(db, req, user_id=current_user.id, actor_name=current_user.name)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return batch

@router.get("/inventory", response_model=List[schemas.BatchResponse])
def get_warehouse_inventory(db: Session = Depends(get_db)):
    all_batches = crud.get_all_batches(db)
    return [b for b in all_batches if b.status in ["Stored", "In Transit"]]
