import shutil
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import schemas, crud, models
from app.auth import get_current_user, require_role
from app.config import UPLOAD_DIR

router = APIRouter(prefix="/api/farmer", tags=["Farmer"])

@router.post("/add-batch", response_model=schemas.BatchResponse)
def add_crop_batch(
    crop_name: str = Form(...),
    quantity: float = Form(...),
    harvest_date: str = Form(...),
    village: str = Form(...),
    district: str = Form(...),
    state: str = Form(...),
    description: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: models.User = Depends(require_role(["farmer"])),
    db: Session = Depends(get_db)
):
    image_url = None
    if image and image.filename:
        file_ext = Path(image.filename).suffix
        filename = f"batch_{current_user.id}_{int(Path(image.filename).stem or 0)}_{file_ext}"
        filepath = UPLOAD_DIR / filename
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = f"/uploads/{filename}"
    
    batch_req = schemas.CreateBatchRequest(
        crop_name=crop_name,
        quantity=quantity,
        harvest_date=harvest_date,
        village=village,
        district=district,
        state=state,
        description=description
    )
    
    new_batch = crud.create_farmer_batch(db, batch_req, farmer_id=current_user.id, farmer_name=current_user.name, image_url=image_url)
    return new_batch

@router.get("/my-batches", response_model=List[schemas.BatchResponse])
def get_my_batches(
    current_user: models.User = Depends(require_role(["farmer"])),
    db: Session = Depends(get_db)
):
    return crud.get_farmer_batches(db, current_user.id)

@router.get("/batch/{batch_id}", response_model=schemas.BatchResponse)
def get_batch_detail(batch_id: str, db: Session = Depends(get_db)):
    batch = crud.get_batch_by_id(db, batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch ID not found")
    return batch
