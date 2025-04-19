module {
    public type ICPUSD = actor {
        exchange : shared (Bool, Nat) -> async Nat
    }
}
