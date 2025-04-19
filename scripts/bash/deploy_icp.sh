#!/bin/bash

echo "\n\n===== STARTED ICP DEPLOYMENT ====="

dfx deploy icp_ledger --specified-id ryjl3-tyaaa-aaaaa-aaaba-cai --argument "(variant {
    Init = record {
        minting_account = \"$(dfx ledger account-id)\";
        initial_values = vec {
            record {
                \"$(dfx ledger account-id)\";
                record { e8s = 100_000_000_00_000_000 : nat64; };
            };
        };
        send_whitelist = vec {};
        transfer_fee = opt record {
            e8s = 10_000 : nat64;
        };
    }
})"

echo "===== FINISHED ICP DEPLOYMENT =====\n\n"