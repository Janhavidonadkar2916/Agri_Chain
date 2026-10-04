"""Real AgriChain EVM benchmark.

Run against a deployed AgriChain.sol contract. This script records raw
measurements; it does not invent throughput/latency values.

Required environment variables:
  WEB3_PROVIDER_URL
  CONTRACT_ADDRESS
  WEB3_PRIVATE_KEY

Examples:
  python benchmark_blockchain.py --mode write --rates 5,10,25,50 --tx-per-rate 50
  python benchmark_blockchain.py --mode read  --batch-id AGRI-2026-ABCD1234 --requests 500
"""
import argparse
import csv
import json
import os
import statistics
import time
from pathlib import Path

from web3 import Web3

ROOT = Path(__file__).resolve().parent
ABI_PATH = ROOT / "blockchain" / "AgriChainABI.json"
OUT_DIR = ROOT / "benchmark_results"
OUT_DIR.mkdir(exist_ok=True)


def setup():
    provider = os.environ["WEB3_PROVIDER_URL"]
    address = os.environ["CONTRACT_ADDRESS"]
    private_key = os.environ["WEB3_PRIVATE_KEY"]
    w3 = Web3(Web3.HTTPProvider(provider, request_kwargs={"timeout": 30}))
    if not w3.is_connected():
        raise RuntimeError(f"Cannot connect to {provider}")
    with open(ABI_PATH, encoding="utf-8") as f:
        abi = json.load(f)
    account = w3.eth.account.from_key(private_key)
    contract = w3.eth.contract(address=w3.to_checksum_address(address), abi=abi)
    return w3, account, contract


def make_batch_id(i):
    return f"BENCH-{int(time.time())}-{i}-{os.getpid()}"


def send_create(w3, account, contract, batch_id, nonce):
    data_hash = Web3.keccak(text=f"benchmark|{batch_id}|{time.time_ns()}").hex()
    fn = contract.functions.createBatch(batch_id, "BenchmarkCrop", 10000, "BenchmarkFarm", data_hash)
    gas = fn.estimate_gas({"from": account.address})
    tx = fn.build_transaction({
        "from": account.address,
        "nonce": nonce,
        "gas": int(gas * 1.2),
        "gasPrice": w3.eth.gas_price,
        "chainId": w3.eth.chain_id,
    })
    t0 = time.perf_counter()
    signed = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    sent_elapsed = time.perf_counter() - t0
    return tx_hash, sent_elapsed


def wait_receipts(w3, hashes, sent_times):
    rows = []
    for i, tx_hash in enumerate(hashes):
        t0 = time.perf_counter()
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash, timeout=180)
        confirmation_elapsed = time.perf_counter() - t0
        rows.append({
            "tx_hash": tx_hash.hex(),
            "status": int(receipt.status),
            "block_number": int(receipt.blockNumber),
            "gas_used": int(receipt.gasUsed),
            "send_time_s": sent_times[i],
            "confirmation_wait_s": confirmation_elapsed,
        })
    return rows


def benchmark_writes(w3, account, contract, rates, tx_per_rate):
    all_rows = []
    for rate in rates:
        hashes, sent_times = [], []
        start = time.perf_counter()
        nonce = w3.eth.get_transaction_count(account.address, "pending")
        interval = 1.0 / rate
        next_send = time.perf_counter()
        for i in range(tx_per_rate):
            now = time.perf_counter()
            if now < next_send:
                time.sleep(next_send - now)
            tx_hash, send_elapsed = send_create(w3, account, contract, make_batch_id(i), nonce)
            nonce += 1
            hashes.append(tx_hash)
            sent_times.append(send_elapsed)
            next_send += interval
        receipt_rows = wait_receipts(w3, hashes, sent_times)
        elapsed = time.perf_counter() - start
        success = sum(r["status"] == 1 for r in receipt_rows)
        throughput = success / elapsed if elapsed else 0
        latencies = [r["send_time_s"] + r["confirmation_wait_s"] for r in receipt_rows if r["status"] == 1]
        row = {
            "send_rate_tps": rate,
            "requested_tx": tx_per_rate,
            "successful_tx": success,
            "failed_tx": tx_per_rate - success,
            "throughput_tps": throughput,
            "min_latency_s": min(latencies) if latencies else None,
            "avg_latency_s": statistics.mean(latencies) if latencies else None,
            "max_latency_s": max(latencies) if latencies else None,
            "total_elapsed_s": elapsed,
        }
        print(row)
        all_rows.append(row)
    return all_rows


def benchmark_reads(w3, contract, batch_id, requests):
    latencies = []
    success = 0
    start = time.perf_counter()
    for _ in range(requests):
        t0 = time.perf_counter()
        try:
            contract.functions.getBatchHistory(batch_id).call()
            success += 1
        except Exception:
            pass
        latencies.append(time.perf_counter() - t0)
    elapsed = time.perf_counter() - start
    row = {
        "batch_id": batch_id,
        "requests": requests,
        "successful_requests": success,
        "throughput_tps": success / elapsed if elapsed else 0,
        "min_latency_s": min(latencies),
        "avg_latency_s": statistics.mean(latencies),
        "max_latency_s": max(latencies),
        "total_elapsed_s": elapsed,
    }
    print(row)
    return row


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["write", "read"], required=True)
    ap.add_argument("--rates", default="5,10,25,50")
    ap.add_argument("--tx-per-rate", type=int, default=50)
    ap.add_argument("--batch-id")
    ap.add_argument("--requests", type=int, default=500)
    args = ap.parse_args()

    w3, account, contract = setup()
    print(f"RPC chain_id={w3.eth.chain_id}")
    print(f"Benchmark account={account.address}")
    print(f"Contract={contract.address}")

    if args.mode == "write":
        rows = benchmark_writes(w3, account, contract, [float(x) for x in args.rates.split(",")], args.tx_per_rate)
        with open(OUT_DIR / "write_benchmark.csv", "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=rows[0].keys())
            writer.writeheader(); writer.writerows(rows)
    else:
        if not args.batch_id:
            raise SystemExit("--batch-id is required for read benchmark")
        row = benchmark_reads(w3, contract, args.batch_id, args.requests)
        with open(OUT_DIR / "read_benchmark.csv", "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=row.keys())
            writer.writeheader(); writer.writerow(row)


if __name__ == "__main__":
    main()
