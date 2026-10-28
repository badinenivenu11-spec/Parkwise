#!/usr/bin/env python3
"""Generate sensor check-ins and check-outs against the parking API."""

import argparse
import random
import time

import requests


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--base-url",
        default="http://127.0.0.1:8000",
        help="Backend base URL (default: %(default)s)",
    )
    parser.add_argument(
        "--vehicles",
        type=int,
        default=3,
        help="Number of parking sessions to simulate (default: %(default)s)",
    )
    parser.add_argument(
        "--min-stay",
        type=float,
        default=5,
        help="Minimum simulated parking duration in seconds (default: %(default)s)",
    )
    parser.add_argument(
        "--max-stay",
        type=float,
        default=15,
        help="Maximum simulated parking duration in seconds (default: %(default)s)",
    )
    parser.add_argument(
        "--retry-delay",
        type=float,
        default=2,
        help="Seconds to wait when no bay is available (default: %(default)s)",
    )
    args = parser.parse_args()
    if args.vehicles < 1:
        parser.error("--vehicles must be at least 1")
    if args.min_stay < 0 or args.max_stay < args.min_stay:
        parser.error("stay durations must be non-negative and max-stay must be >= min-stay")
    if args.retry_delay <= 0:
        parser.error("--retry-delay must be greater than 0")
    return args


def main() -> None:
    args = parse_args()
    base_url = args.base_url.rstrip("/")
    completed = 0
    plate_number = random.randint(1000, 9999)
    print(f"Connecting to parking API at {base_url}")

    while completed < args.vehicles:
        bays_response = requests.get(f"{base_url}/api/bays", timeout=10)
        bays_response.raise_for_status()
        available = [
            bay for bay in bays_response.json() if bay["status"] == "available"
        ]
        random.shuffle(available)
        if not available:
            print("No available bays; waiting for a bay to become free.")
            time.sleep(args.retry_delay)
            continue

        bay = available[0]
        plate = f"KA-01-SN-{plate_number:04d}"
        plate_number = (plate_number + 1) % 10000
        check_in_response = requests.post(
            f"{base_url}/api/bays/{bay['id']}/check-in",
            json={"vehicle_plate": plate, "source": "sensor"},
            timeout=10,
        )
        if check_in_response.status_code == 409:
            print(f"{bay['id']} changed before check-in; selecting another bay.")
            continue
        check_in_response.raise_for_status()
        print(f"Sensor detected {plate} entering {bay['id']}.")

        try:
            stay_seconds = random.uniform(args.min_stay, args.max_stay)
            time.sleep(stay_seconds)
            check_out_response = requests.post(
                f"{base_url}/api/bays/{bay['id']}/check-out", timeout=10
            )
            check_out_response.raise_for_status()
            receipt = check_out_response.json()["receipt"]
            print(
                f"{plate} departed {bay['id']} after "
                f"{receipt['duration_minutes']} min; charge INR {receipt['amount_inr']}."
            )
            completed += 1
        except BaseException:
            try:
                requests.post(
                    f"{base_url}/api/bays/{bay['id']}/check-out", timeout=10
                ).raise_for_status()
            except requests.RequestException:
                pass
            raise

    print(f"Simulation complete: {completed} parking session(s).")


if __name__ == "__main__":
    main()
