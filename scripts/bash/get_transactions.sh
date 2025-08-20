#!/bin/bash

CANISTER_ID="4f5ia-fiaaa-aaaap-qpzoq-cai"
TOTAL_TRANSACTIONS=10000
LIMIT=2000
OUTPUT_FILE="transactions.json"
TEMP_FILE="transactions_arrays.tmp"

> "$TEMP_FILE"


for ((start=0; start<TOTAL_TRANSACTIONS; start+=LIMIT)); do
  echo "Taking $LIMIT transactions from index $start..."

  dfx canister call --network ic "$CANISTER_ID" get_transactions "(record { start = $start; length = $LIMIT })" --output json | jq '.transactions' >> "$TEMP_FILE"

  if [ $? -ne 0 ]; then
    echo "Error when fetching or processing transactions from index $start. Stopping the script."
    rm "$TEMP_FILE"
    exit 1
  fi
done

jq -s 'add' "$TEMP_FILE" > "$OUTPUT_FILE"

rm "$TEMP_FILE"

echo "✅ Done! $TOTAL_TRANSACTIONS transactions have been saved to $OUTPUT_FILE"