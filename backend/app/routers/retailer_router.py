from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import schemas, crud, models
from app.auth import require_role

router = APIRouter(prefix="/api/retailer", tags=["Retailer"])

@router.post("/receive", response_model=schemas.BatchResponse)
def receive_retailer_product(
    req: schemas.RetailerReceiveRequest,
    current_user: models.User = Depends(require_role(["retailer"])),
    db: Session = Depends(get_db)
):
    batch, error = crud.receive_retailer(db, req, user_id=current_user.id, actor_name=current_user.name)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return batch

@router.post("/sell", response_model=schemas.BatchResponse)
def sell_retailer_product(
    req: schemas.RetailerSellRequest,
    current_user: models.User = Depends(require_role(["retailer"])),
    db: Session = Depends(get_db)
):
    batch, error = crud.sell_retailer(db, req, user_id=current_user.id, actor_name=current_user.name)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return batch

@router.get("/inventory", response_model=List[schemas.BatchResponse])
def get_retailer_inventory(db: Session = Depends(get_db)):
    all_batches = crud.get_all_batches(db)
    return [b for b in all_batches if b.status in ["Available", "Stored", "Sold"]]
