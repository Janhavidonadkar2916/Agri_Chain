"""Generate paper-ready plots from measured AgriChain benchmark CSV files.

Run after benchmark_blockchain.py. No sample or synthetic measurements are created.
"""
import csv
from pathlib import Path
import matplotlib.pyplot as plt

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "benchmark_results"
PLOTS = DATA / "plots"
PLOTS.mkdir(parents=True, exist_ok=True)


def read_csv(name):
    path = DATA / name
    if not path.exists():
        print(f"Skipping {name}: file not found")
        return []
    with path.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def numeric(rows, key):
    result=[]
    for row in rows:
        try:
            val=float(row[key])
            if val == val:
                result.append((row,val))
        except (KeyError, TypeError, ValueError):
            pass
    return result


def line_plot(rows, x_key, y_key, x_label, y_label, title, filename, log_y=False):
    points=[]
    for row in rows:
        try:
            x=float(row[x_key]); y=float(row[y_key])
            if x == x and y == y: points.append((x,y))
        except (KeyError, TypeError, ValueError): pass
    if not points:
        print(f"Skipping {filename}: no valid numeric measurements")
        return
    points.sort()
    fig, ax = plt.subplots(figsize=(7.2,4.5))
    ax.plot([p[0] for p in points], [p[1] for p in points], marker="o", linewidth=1.8)
    ax.set_xlabel(x_label); ax.set_ylabel(y_label); ax.set_title(title)
    ax.grid(True, alpha=0.3)
    if log_y: ax.set_yscale("log")
    fig.tight_layout(); fig.savefig(PLOTS/filename, dpi=300, bbox_inches="tight"); plt.close(fig)
    print(f"Wrote {PLOTS/filename}")


def main():
    write=read_csv("write_summary.csv")
    line_plot(write,"target_rate_tps","throughput_tps","Target submission rate (transactions/s)",
              "Successful throughput (transactions/s)","AgriChain write throughput vs offered load","write_throughput.png")
    line_plot(write,"target_rate_tps","avg_latency_s","Target submission rate (transactions/s)",
              "Mean end-to-end latency (s)","AgriChain mean write latency vs offered load","write_latency_mean.png")
    line_plot(write,"target_rate_tps","p95_latency_s","Target submission rate (transactions/s)",
              "95th-percentile latency (s)","AgriChain p95 write latency vs offered load","write_latency_p95.png")
    line_plot(write,"target_rate_tps","avg_gas_used","Target submission rate (transactions/s)",
              "Mean gas used (gas units)","AgriChain mean gas per successful write","write_gas.png")
    read=read_csv("read_summary.csv")
    if read:
        line_plot(read,"concurrency","throughput_tps","Concurrent workers","Successful read throughput (requests/s)",
                  "AgriChain read throughput vs concurrency","read_throughput.png")
        line_plot(read,"concurrency","p95_latency_s","Concurrent workers","95th-percentile read latency (s)",
                  "AgriChain p95 read latency vs concurrency","read_latency_p95.png")
    if not write and not read:
        print("No benchmark summaries found. Run the EVM benchmark first; no data was fabricated.")

if __name__ == "__main__": main()
