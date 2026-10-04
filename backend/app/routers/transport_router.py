from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import schemas, crud, models
from app.auth import require_role

router = APIRouter(prefix="/api/transport", tags=["Transport"])

@router.post("/start", response_model=schemas.BatchResponse)
def start_transport_shipment(
    req: schemas.TransportStartRequest,
    current_user: models.User = Depends(require_role(["transport"])),
    db: Session = Depends(get_db)
):
    batch, error = crud.start_transport(db, req, user_id=current_user.id, actor_name=current_user.name)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return batch

@router.post("/complete", response_model=schemas.BatchResponse)
def complete_transport_shipment(
    req: schemas.TransportCompleteRequest,
    current_user: models.User = Depends(require_role(["transport"])),
    db: Session = Depends(get_db)
):
    batch, error = crud.complete_transport(db, req, user_id=current_user.id, actor_name=current_user.name)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return batch

@router.get("/active-shipments", response_model=List[schemas.BatchResponse])
def get_active_shipments(db: Session = Depends(get_db)):
    all_batches = crud.get_all_batches(db)
    return [b for b in all_batches if b.status in ["In Transit", "Created", "Delivered"]]
