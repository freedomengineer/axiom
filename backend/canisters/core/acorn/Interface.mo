import Types "Types";

module {
    public type ACORN = actor {
        icrc1_name : query () -> async (Text);
        icrc1_symbol : query () -> async (Text);
        icrc1_decimals : query () -> async (Nat8);
        icrc1_total_supply : query () -> async (Nat);
        icrc1_fee : query () -> async (Nat);
        icrc1_minting_account : query () -> async (?Types.Account);
        icrc1_balance_of : query (Types.Account) -> async (Nat);
        icrc1_transfer : (Types.TransferArgs) -> async (Types.TransferResult);

        icrc2_approve : (Types.ApproveArgs) -> async (Types.ApproveResult);
        icrc2_allowance : query (Types.AllowanceArgs) -> async (Types.Allowance);
        icrc2_transfer_from : (Types.TransferFromArgs) -> async (Types.TransferFromResult)
    }
}
