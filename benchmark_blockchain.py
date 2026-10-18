"""Reproducible AgriChain EVM benchmark.

This script writes raw per-transaction CSV plus aggregate summaries. It performs
real contract calls only; it does not benchmark the Python legacy hash ledger.

Environment: WEB3_PROVIDER_URL, CONTRACT_ADDRESS, WEB3_PRIVATE_KEY
Examples:
  python benchmark_blockchain.py --mode write --rates 1,2,5 --tx-per-rate 20
  python benchmark_blockchain.py --mode read --batch-id AGRI-2026-ABCD1234 --requests 200

Use a test network / isolated contract. Write mode creates benchmark batches.
"""
import argparse
import csv
import json
import os
import statistics
import time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

from web3 import Web3

ROOT = Path(__file__).resolve().parent
ABI_PATH = ROOT / "blockchain" / "AgriChainABI.json"
OUT_DIR = ROOT / "benchmark_results"
OUT_DIR.mkdir(exist_ok=True)


def percentile(values, p):
    if not values:
        return None
    values = sorted(values)
    pos = (len(values) - 1) * p
    lo, hi = int(pos), min(int(pos) + 1, len(values) - 1)
    return values[lo] + (values[hi] - values[lo]) * (pos - lo)


def write_csv(path, rows):
    if not rows:
        return
    fieldnames = list(dict.fromkeys(key for row in rows for key in row.keys()))
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def setup():
    missing = [k for k in ("WEB3_PROVIDER_URL", "CONTRACT_ADDRESS", "WEB3_PRIVATE_KEY") if not os.getenv(k)]
    if missing:
        raise RuntimeError("Missing required environment variables: " + ", ".join(missing))
    w3 = Web3(Web3.HTTPProvider(os.environ["WEB3_PROVIDER_URL"], request_kwargs={"timeout": 30}))
    if not w3.is_connected():
        raise RuntimeError("Cannot connect to configured EVM provider")
    with open(ABI_PATH, encoding="utf-8") as f:
        abi = json.load(f)
    account = w3.eth.account.from_key(os.environ["WEB3_PRIVATE_KEY"])
    address = w3.to_checksum_address(os.environ["CONTRACT_ADDRESS"])
    if not w3.eth.get_code(address):
        raise RuntimeError(f"No contract bytecode at {address}; check network and address")
    return w3, account, w3.eth.contract(address=address, abi=abi)


def send_create(w3, account, contract, batch_id, nonce):
    data_hash = Web3.keccak(text=f"agrichain-benchmark|{batch_id}|{time.time_ns()}").hex()
    fn = contract.functions.createBatch(batch_id, "BenchmarkCrop", 10000, "BenchmarkFarm", data_hash)
    gas_estimate = fn.estimate_gas({"from": account.address})
    tx = fn.build_transaction({"from": account.address, "nonce": nonce, "gas": int(gas_estimate * 1.25),
                               "gasPrice": w3.eth.gas_price, "chainId": w3.eth.chain_id})
    started = time.perf_counter()
    signed = account.sign_transaction(tx)
    submitted = time.perf_counter()
    raw_transaction = getattr(signed, "raw_transaction", None)
    if raw_transaction is None:  # eth-account/Web3 v6 compatibility
        raw_transaction = signed.rawTransaction
    tx_hash = w3.eth.send_raw_transaction(raw_transaction)
    accepted = time.perf_counter()
    return {"tx_hash": tx_hash.hex(), "batch_id": batch_id, "signing_s": submitted-started,
            "rpc_submit_s": accepted-submitted, "submit_started_perf": started, "submit_finished_perf": accepted,
            "submit_wall_time": time.time()}


def benchmark_writes(w3, account, contract, rates, tx_per_rate):
    raw_rows, summary = [], []
    for rate in rates:
        print(f"Running write benchmark: target={rate:g} tx/s, count={tx_per_rate}")
        nonce = w3.eth.get_transaction_count(account.address, "pending")
        interval = 1.0 / rate
        next_send = time.perf_counter()
        pending = []
        run_start = time.perf_counter()
        for i in range(tx_per_rate):
            if i and time.perf_counter() < next_send:
                time.sleep(max(0, next_send - time.perf_counter()))
            batch_id = f"BENCH-{int(time.time())}-{os.getpid()}-{rate:g}-{i}"
            try:
                row = send_create(w3, account, contract, batch_id, nonce)
                nonce += 1
                row.update({"target_rate_tps": rate, "status": "submitted", "error": ""})
                pending.append(row)
            except Exception as exc:
                row = {"tx_hash":"", "batch_id":batch_id, "target_rate_tps":rate, "status":"submit_error",
                       "error":str(exc), "signing_s":None, "rpc_submit_s":None, "submit_started_perf":None,
                       "submit_finished_perf":None, "submit_wall_time":time.time()}
                raw_rows.append(row)
            next_send += interval
        def collect_receipt(item):
            try:
                receipt_start = time.perf_counter()
                receipt = w3.eth.wait_for_transaction_receipt(item["tx_hash"], timeout=180)
                receipt_end = time.perf_counter()
                # Receipt waits run concurrently so one slow transaction does not
                # inflate the measured latency of all later transactions.
                item.update({"status":"success" if int(receipt.status)==1 else "reverted",
                             "receipt_status":int(receipt.status), "block_number":int(receipt.blockNumber),
                             "gas_used":int(receipt.gasUsed), "receipt_wait_s":receipt_end-receipt_start,
                             "end_to_end_latency_s":receipt_end-item["submit_finished_perf"],
                             "error":"" if int(receipt.status)==1 else "transaction reverted"})
            except Exception as exc:
                item.update({"status":"receipt_error", "receipt_status":None, "block_number":None, "gas_used":None,
                             "receipt_wait_s":None, "end_to_end_latency_s":None, "error":str(exc)})
            item.pop("submit_started_perf", None); item.pop("submit_finished_perf", None)
            return item
        with ThreadPoolExecutor(max_workers=min(32, max(1, len(pending)))) as pool:
            futures = [pool.submit(collect_receipt, item) for item in pending]
            for future in as_completed(futures): raw_rows.append(future.result())
        elapsed = time.perf_counter() - run_start
        rows = [r for r in raw_rows if r.get("target_rate_tps")==rate]
        successful = [r for r in rows if r.get("status")=="success"]
        lat = [r["end_to_end_latency_s"] for r in successful if r.get("end_to_end_latency_s") is not None]
        summary.append({"target_rate_tps":rate, "requested_tx":tx_per_rate, "submitted_tx":len(pending),
                        "successful_tx":len(successful), "failed_or_error_tx":tx_per_rate-len(successful),
                        "throughput_tps":len(successful)/elapsed if elapsed else 0, "avg_latency_s":statistics.mean(lat) if lat else None,
                        "p50_latency_s":percentile(lat,.50), "p95_latency_s":percentile(lat,.95), "p99_latency_s":percentile(lat,.99),
                        "avg_gas_used":statistics.mean([r["gas_used"] for r in successful]) if successful else None,
                        "total_elapsed_s":elapsed, "chain_id":w3.eth.chain_id, "contract_address":contract.address})
    write_csv(OUT_DIR/"write_transactions.csv", raw_rows)
    write_csv(OUT_DIR/"write_summary.csv", summary)
    for r in summary: print(r)

def benchmark_reads(w3, contract, batch_id, requests, concurrency):
    if not contract.functions.batchExists(batch_id).call():
        raise ValueError(f"Batch {batch_id!r} does not exist on this contract")
    def one(i):
        start = time.perf_counter()
        try:
            result = contract.functions.getBatchHistory(batch_id).call()
            return {"request_id":i, "status":"success", "latency_s":time.perf_counter()-start, "history_entries":len(result), "error":""}
        except Exception as exc:
            return {"request_id":i, "status":"error", "latency_s":time.perf_counter()-start, "history_entries":None, "error":str(exc)}
    wall_start = time.perf_counter()
    if concurrency == 1:
        rows = [one(i) for i in range(requests)]
    else:
        rows = []
        with ThreadPoolExecutor(max_workers=concurrency) as pool:
            futures = [pool.submit(one, i) for i in range(requests)]
            for future in as_completed(futures): rows.append(future.result())
        rows.sort(key=lambda r:r["request_id"])
    elapsed = time.perf_counter()-wall_start
    lat = [r["latency_s"] for r in rows if r["status"]=="success"]
    summary = [{"batch_id":batch_id, "requests":requests, "concurrency":concurrency,
                "successful_requests":sum(r["status"]=="success" for r in rows),
                "failed_requests":sum(r["status"]!="success" for r in rows),
                "throughput_tps":sum(r["status"]=="success" for r in rows)/elapsed if elapsed else 0,
                "avg_latency_s":statistics.mean(lat) if lat else None, "p50_latency_s":percentile(lat,.50),
                "p95_latency_s":percentile(lat,.95), "p99_latency_s":percentile(lat,.99),
                "total_elapsed_s":elapsed, "chain_id":w3.eth.chain_id, "contract_address":contract.address}]
    write_csv(OUT_DIR/"read_requests.csv", rows); write_csv(OUT_DIR/"read_summary.csv", summary)
    print(summary[0])

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["write", "read"], required=True)
    ap.add_argument("--rates", default="1,2,5")
    ap.add_argument("--tx-per-rate", type=int, default=20)
    ap.add_argument("--batch-id")
    ap.add_argument("--requests", type=int, default=200)
    ap.add_argument("--concurrency", type=int, default=1)
    args = ap.parse_args()
    if args.requests < 1 or args.concurrency < 1 or args.tx_per_rate < 1:
        ap.error("request counts, concurrency, and tx-per-rate must be positive")
    w3, account, contract = setup()
    print(f"chain_id={w3.eth.chain_id}; account={account.address}; contract={contract.address}")
    if args.mode == "write": benchmark_writes(w3, account, contract, [float(x) for x in args.rates.split(",")], args.tx_per_rate)
    else:
        if not args.batch_id: ap.error("--batch-id is required for read mode")
        benchmark_reads(w3, contract, args.batch_id, args.requests, args.concurrency)

if __name__ == "__main__": main()
