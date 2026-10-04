from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app import schemas, models

router = APIRouter(prefix="/api/blockchain", tags=["Blockchain Explorer"])

@router.get("/blocks", response_model=List[schemas.BlockResponse])
def get_blockchain_blocks(limit: int = 50, db: Session = Depends(get_db)):
    blocks = db.query(models.BlockchainBlock).order_by(models.BlockchainBlock.id.desc()).limit(limit).all()
    return blocks

@router.get("/search")
def search_blockchain(query: str, db: Session = Depends(get_db)):
    query = query.strip()
    
    # 1. Search block by exact Batch ID
    block = db.query(models.BlockchainBlock).filter(models.BlockchainBlock.batch_id == query).order_by(models.BlockchainBlock.id.desc()).first()
    batch = db.query(models.FarmerBatch).filter(models.FarmerBatch.batch_id == query).first()
    
    # 2. Search block by Tx Hash or Block Hash
    if not block:
        block = db.query(models.BlockchainBlock).filter(
            (models.BlockchainBlock.tx_hash == query) | (models.BlockchainBlock.current_hash == query)
        ).first()
        if block:
            batch = db.query(models.FarmerBatch).filter(models.FarmerBatch.batch_id == block.batch_id).first()

    if not block and not batch:
        raise HTTPException(status_code=404, detail="No blockchain block or transaction found matching query")

    all_blocks = db.query(models.BlockchainBlock).filter(models.BlockchainBlock.batch_id == (batch.batch_id if batch else block.batch_id)).order_by(models.BlockchainBlock.block_number.asc()).all()
    
    return {
        "block": block,
        "batch": batch,
        "chain_history": all_blocks
    }
