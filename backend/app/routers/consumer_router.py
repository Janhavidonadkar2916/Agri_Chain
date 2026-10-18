from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import schemas, crud, models
from app.blockchain import blockchain_engine, ZERO_HASH

router = APIRouter(prefix="/api/consumer", tags=["Consumer Public Verification"])


def check_database_ledger(batch, blocks, txs):
    """Check stored chain links and DB cross-references (not a cryptographic proof)."""
    if not blocks:
        return False, "No ledger blocks are recorded for this batch."
    # The DB block_number is an EVM block height in web3 mode, not a unique
    # per-batch sequence number. Use insertion order (id) for the local chain.
    blocks = sorted(blocks, key=lambda b: b.id)
    transaction_hashes = {tx.tx_hash for tx in txs}
    expected_prev = ZERO_HASH
    for block in blocks:
        if block.prev_hash != expected_prev:
            return False, f"Previous-hash link mismatch at ledger record {block.id}."
        if block.tx_hash not in transaction_hashes:
            return False, f"Transaction/block mismatch at ledger record {block.id}."
        expected_prev = block.current_hash
    last = blocks[-1]
    if batch.blockchain_hash != last.current_hash or batch.tx_hash != last.tx_hash:
        return False, "Batch head does not match the latest recorded ledger block."
    return True, "Stored block links and transaction references are internally consistent."


@router.get("/verify/{batch_id}", response_model=schemas.VerificationResponse)
def verify_batch_provenance(batch_id: str, db: Session = Depends(get_db)):
    batch = crud.get_batch_by_id(db, batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail=f"Batch ID '{batch_id}' not found in AgriChain registry")

    farmer = crud.get_user_by_id(db, batch.farmer_id)
    txs = (db.query(models.TransactionHistory)
           .filter(models.TransactionHistory.batch_id == batch_id)
           .order_by(models.TransactionHistory.block_number.asc(), models.TransactionHistory.id.asc()).all())
    blocks = (db.query(models.BlockchainBlock)
              .filter(models.BlockchainBlock.batch_id == batch_id)
              .order_by(models.BlockchainBlock.id.asc()).all())

    integrity_valid, note = check_database_ledger(batch, blocks, txs)
    on_chain_confirmed = False
    if blockchain_engine.mode == "web3" and integrity_valid:
        try:
            onchain = blockchain_engine.contract.functions.batches(batch_id).call()
            onchain_history = blockchain_engine.contract.functions.getBatchHistory(batch_id).call()
            status_names = {0: "Created", 1: "In Transit", 2: "Stored", 3: "Available", 4: "Sold"}
            local_status = (batch.status or "").strip().lower()
            chain_status = status_names.get(int(onchain[5]), "Unknown").lower()
            on_chain_confirmed = bool(onchain[0]) and len(onchain_history) == len(txs) and local_status == chain_status
            if not on_chain_confirmed:
                note = "Database ledger is linked, but it does not match the contract state/history."
            else:
                note = "Database ledger links and contract batch state/history are consistent."
        except Exception as exc:
            note = f"On-chain verification could not be completed: {type(exc).__name__}."

    # The application does not currently persist a trusted Merkle root/proof anchor.
    # Therefore never claim that a Merkle proof is valid merely because a root was computed.
    return {
        "is_authentic": bool(integrity_valid and on_chain_confirmed),
        "integrity_valid": bool(integrity_valid),
        "verification_note": note,
        "batch": batch,
        "farmer_info": farmer,
        "timeline": txs,
        "blockchain_hash": batch.blockchain_hash,
        "tx_hash": batch.tx_hash,
        "block_number": batch.block_number,
        "merkle_proof_valid": False,
    }
