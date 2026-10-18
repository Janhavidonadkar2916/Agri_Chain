import hashlib
import json
import secrets
import time
from typing import Tuple

from web3 import Web3
from web3.exceptions import TransactionNotFound

from app.config import (
    WEB3_PROVIDER_URL,
    CONTRACT_ADDRESS,
    WEB3_PRIVATE_KEY,
    BLOCKCHAIN_MODE,
)


ZERO_HASH = "0x" + "0" * 64
ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"


class AgriChainLedgerEngine:
    """Blockchain adapter.

    In ``web3`` mode the hashes/block numbers come from a real EVM transaction
    receipt. The legacy mode is retained so the existing UI can still run when
    blockchain credentials have not yet been configured.
    """

    def __init__(self):
        self.provider_url = WEB3_PROVIDER_URL
        self.contract_address = CONTRACT_ADDRESS
        self.mode = BLOCKCHAIN_MODE.lower()
        self.w3 = None
        self.account = None
        self.contract = None

        if self.mode == "web3":
            if not WEB3_PRIVATE_KEY:
                raise RuntimeError("BLOCKCHAIN_MODE=web3 requires WEB3_PRIVATE_KEY")
            self.w3 = Web3(Web3.HTTPProvider(self.provider_url, request_kwargs={"timeout": 30}))
            if not self.w3.is_connected():
                raise RuntimeError(f"Unable to connect to WEB3_PROVIDER_URL: {self.provider_url}")
            self.account = self.w3.eth.account.from_key(WEB3_PRIVATE_KEY)

            abi_path = __import__("pathlib").Path(__file__).resolve().parents[2] / ".." / "blockchain" / "AgriChainABI.json"
            # In Vercel, use the ABI bundled with the repository if the path above
            # does not resolve from the package layout.
            if not abi_path.exists():
                abi_path = __import__("pathlib").Path(__file__).resolve().parents[2] / "blockchain" / "AgriChainABI.json"
            if not abi_path.exists():
                raise RuntimeError("AgriChainABI.json not found in the deployed project")
            with open(abi_path, "r", encoding="utf-8") as f:
                abi = json.load(f)

            self.contract_address = self.w3.to_checksum_address(self.contract_address)
            code = self.w3.eth.get_code(self.contract_address)
            if code in (b"", b"0x", None):
                raise RuntimeError(f"No contract bytecode found at CONTRACT_ADDRESS={self.contract_address}")
            self.contract = self.w3.eth.contract(address=self.contract_address, abi=abi)

    def generate_batch_id(self) -> str:
        random_suffix = secrets.token_hex(4).upper()
        return f"AGRI-{time.strftime('%Y')}-{random_suffix}"

    def compute_sha256(self, payload: str) -> str:
        h = hashlib.sha256(payload.encode("utf-8")).hexdigest()
        return f"0x{h}"

    def _metadata_hash(self, *parts: object) -> str:
        payload = "|".join(str(p) for p in parts)
        return self.compute_sha256(payload)

    def _send(self, fn):
        """Sign, submit and wait for a real blockchain transaction."""
        assert self.w3 is not None and self.account is not None
        nonce = self.w3.eth.get_transaction_count(self.account.address, "pending")
        gas_estimate = fn.estimate_gas({"from": self.account.address})
        gas_price = self.w3.eth.gas_price
        tx = fn.build_transaction({
            "from": self.account.address,
            "nonce": nonce,
            "gas": int(gas_estimate * 1.20),
            "gasPrice": gas_price,
            "chainId": self.w3.eth.chain_id,
        })
        signed = self.account.sign_transaction(tx)
        raw_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)
        receipt = self.w3.eth.wait_for_transaction_receipt(raw_hash, timeout=180)
        if receipt.status != 1:
            raise RuntimeError(f"Blockchain transaction reverted: {raw_hash.hex()}")
        return receipt

    def _real_block_result(self, receipt, data_hash: str) -> Tuple[str, str, int]:
        block = self.w3.eth.get_block(receipt.blockNumber)
        block_hash = block.hash.hex()
        tx_hash = receipt.transactionHash.hex()
        return block_hash, tx_hash, int(receipt.blockNumber)

    def create_genesis_block(
        self,
        batch_id: str,
        crop_name: str,
        quantity: float,
        farmer_name: str,
    ) -> Tuple[str, str, int]:
        if self.mode == "web3":
            data_hash = self._metadata_hash(batch_id, crop_name, quantity, farmer_name, time.time_ns())
            quantity_uint = max(0, int(round(quantity * 100)))
            receipt = self._send(
                self.contract.functions.createBatch(
                    batch_id,
                    crop_name,
                    quantity_uint,
                    farmer_name,
                    data_hash,
                )
            )
            return self._real_block_result(receipt, data_hash)

        timestamp = int(time.time())
        raw_payload = f"{batch_id}:{crop_name}:{quantity}:{farmer_name}:{timestamp}"
        tx_hash = self.compute_sha256(f"TX:{raw_payload}")
        block_content = f"BLOCK:1:{batch_id}:{tx_hash}:{ZERO_HASH}:{timestamp}"
        current_hash = self.compute_sha256(block_content)
        return current_hash, tx_hash, 1

    def _status_code(self, action: str, actor_role: str) -> int:
        a = action.lower()
        if "sold" in a or "purchased" in a:
            return 4
        if "retail" in a or "available" in a:
            return 3
        if "warehouse" in a or "stored" in a or "delivery completed" in a:
            return 2
        if "transport" in a or "pickup" in a or "dispatched" in a:
            return 1
        return 0

    def create_next_block(
        self,
        batch_id: str,
        prev_hash: str,
        prev_block_num: int,
        action: str,
        actor_role: str,
        owner: str,
    ) -> Tuple[str, str, int]:
        if self.mode == "web3":
            status_code = self._status_code(action, actor_role)
            data_hash = self._metadata_hash(batch_id, action, actor_role, owner, time.time_ns())
            # Contract-level provenance links metadata hashes, while the SQL
            # explorer maintains its own block-hash chain. Read the last committed
            # metadata hash from the contract to satisfy its previous-state check.
            onchain_batch = self.contract.functions.batches(batch_id).call()
            previous_data_hash = onchain_batch[7]
            receipt = self._send(
                self.contract.functions.updateBatchStatus(
                    batch_id,
                    status_code,
                    action,
                    actor_role,
                    ZERO_ADDRESS,
                    data_hash,
                    previous_data_hash,
                )
            )
            return self._real_block_result(receipt, data_hash)

        block_num = prev_block_num + 1
        timestamp = int(time.time())
        raw_tx = f"TX:{batch_id}:{action}:{actor_role}:{owner}:{timestamp}"
        tx_hash = self.compute_sha256(raw_tx)
        block_payload = f"BLOCK:{block_num}:{batch_id}:{tx_hash}:{prev_hash}:{timestamp}"
        current_hash = self.compute_sha256(block_payload)
        return current_hash, tx_hash, block_num

    def get_batch_history(self, batch_id: str):
        if self.mode != "web3":
            return []
        return self.contract.functions.getBatchHistory(batch_id).call()

    def get_total_batches(self) -> int:
        if self.mode != "web3":
            return 0
        return int(self.contract.functions.getTotalBatches().call())

    def compute_merkle_root(self, hashes: list) -> str:
        if not hashes:
            return ZERO_HASH
        if len(hashes) == 1:
            return hashes[0]
        new_level = []
        for i in range(0, len(hashes), 2):
            left = hashes[i]
            right = hashes[i + 1] if i + 1 < len(hashes) else left
            new_level.append(self.compute_sha256(left + right))
        return self.compute_merkle_root(new_level)


blockchain_engine = AgriChainLedgerEngine()
