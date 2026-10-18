# AgriChain benchmark and integrity changes

## What changed

1. `benchmark_blockchain.py` now writes per-transaction and aggregate CSV files. Write latency is measured from successful RPC submission to receipt detection using a monotonic clock, and receipt polling runs concurrently so a slow receipt does not inflate the latency of transactions processed later. Summaries include mean, p50, p95, p99, throughput, failures, block number, and gas used.
2. Read benchmarks support controlled concurrency and save one row per request plus aggregate summaries.
3. `generate_benchmark_graphs.py` creates 300-DPI PNG plots from real benchmark CSV files only. It does not generate example data.
4. Consumer verification checks database ledger linkage and transaction references. It no longer unconditionally reports a valid Merkle proof. `is_authentic` is true only when the database chain checks pass and the deployed EVM contract state/history also matches.
5. The Solidity contract now validates batch input, restricts status updates to the current batch owner, enforces sequential status transitions, and checks the supplied previous metadata hash.
6. In Web3 mode, the Python adapter supplies the current on-chain metadata hash as the previous-state reference. The ABI JSON includes the public mapping getters needed by this logic.
7. Production Vercel configuration now requires an explicit `SECRET_KEY` instead of silently using a known default.

## Important deployment steps

The Solidity source changed. **Redeploy the contract** to your chosen test network and update `CONTRACT_ADDRESS` and the matching ABI before using Web3 mode. A previously deployed contract will not gain the new checks automatically. Test on a test network or isolated environment first.

Set these backend environment variables only in the deployment's secret/environment settings:

- `BLOCKCHAIN_MODE=web3`
- `WEB3_PROVIDER_URL=...`
- `CONTRACT_ADDRESS=...`
- `WEB3_PRIVATE_KEY=...` (never commit this value)
- `SECRET_KEY=...` (a strong random secret)
- `DATABASE_URL=...` (a persistent database URL for production)

The configured account must own batches it updates because the contract now enforces `onlyBatchOwner`. The current adapter uses one signer account for all Web3 writes, so this remains a single-operator/on-chain-owner design; it is not yet per-user wallet signing or role-specific decentralized authorization.

## Running a benchmark

Install dependencies:

```bash
pip install -r requirements-benchmark.txt
```

Write benchmark (creates benchmark batches; use a test network / isolated contract):

```bash
python benchmark_blockchain.py --mode write --rates 1,2,5 --tx-per-rate 20
```

Read benchmark (the batch must already exist on the configured contract):

```bash
python benchmark_blockchain.py --mode read --batch-id YOUR_EXISTING_BATCH_ID --requests 200 --concurrency 1
python benchmark_blockchain.py --mode read --batch-id YOUR_EXISTING_BATCH_ID --requests 200 --concurrency 8
```

Generate plots:

```bash
python generate_benchmark_graphs.py
```

Results are written to `benchmark_results/`; PNG plots are placed in `benchmark_results/plots/`. Do not edit results by hand. Repeat runs and report the environment, chain/network, provider, contract version, request settings, and variability in the paper.

## Interpretation limits

- Legacy mode creates a database-backed hash ledger; it is not an EVM benchmark and must not be described as on-chain performance.
- The current SQL ledger stores hashes and links, but it does not persist a cryptographically anchored Merkle root/proof. The API therefore returns `merkle_proof_valid=false` until a trusted root and proof scheme are implemented.
- Local database link consistency is not equivalent to proof against a malicious database administrator. In Web3 mode, contract-state/history checks provide an additional anchor, but the API still does not independently verify every receipt against a chain indexer.
- Graphs will not be produced until actual CSV measurements exist. No measurements are included or fabricated in this source package.
- `BLOCKCHAIN_MODE=web3` requires a redeployed contract for the new Solidity access checks. Run API tests and test-network transactions before production deployment.
