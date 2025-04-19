#!/bin/bash

function show_usage {
echo "Usage: $0 <recipient_principal> [amount]"
echo "  <recipient_principal>: The principal ID of the recipient (required)"
echo "  [amount]: Amount of tokens to transfer (optional, default: 100.0)"
echo ""
echo "Example: $0 \"aaaaa-aa\" 50.5"
exit 1
}

if [ $# -lt 1 ]; then
echo "Error: Recipient principal ID is required."
show_usage
fi

RECIPIENT="$1"
AMOUNT="${2:-100.0}"

if ! [[ $AMOUNT =~ ^[0-9]+(\.[0-9]{1,8})?$ ]]; then
  echo "Error: Amount must be a valid number with at most 8 decimal places."
  show_usage
fi
AMOUNT_E8S=$(echo "$AMOUNT * 100000000 / 1" | bc)

echo "Preparing to transfer $AMOUNT tokens ($AMOUNT_E8S e8s) to principal: $RECIPIENT"

dfx canister call acorn_ledger_prod --network=ic icrc1_transfer "(record { 
  to = record { owner = principal \"$RECIPIENT\" };
  amount = $AMOUNT_E8S;
})"

if [ $? -eq 0 ]; then
echo "Transfer completed successfully."
else
echo "Transfer failed. Please check the error message above."
fi
