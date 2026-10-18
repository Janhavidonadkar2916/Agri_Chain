
## Research benchmarking and integrity verification

See [`BENCHMARK_AND_SECURITY_CHANGES.md`](BENCHMARK_AND_SECURITY_CHANGES.md) for the benchmark procedure, environment variables, security changes, and interpretation limits. After collecting real EVM benchmark CSVs, run `python generate_benchmark_graphs.py` to create publication-quality plots. Do not use the benchmark script in production because write mode creates test batches; use a test network or isolated contract.
