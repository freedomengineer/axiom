module {
    public type Settings = {
        controllers : ?[Principal];
        compute_allocation : ?Nat;
        memory_allocation : ?Nat;
        freezing_threshold : ?Nat
    };
    public type InstallMode = {
        #reinstall;
        #upgrade;
        #install
    };

    public type CreateCanisterArgs = {
        settings : ?Settings
    };
    public type CreateCanisterResult = {
        canister_id : Principal
    };

    public type DepositCyclesArgs = {
        canister_id : Principal
    };

    public type InstallCodeArgs = {
        arg : [Nat8];
        wasm_module : [Nat8];
        mode : InstallMode;
        canister_id : Principal
    };

    public type UpdateSettingsArgs = {
        settings : Settings;
        canister_id : Principal
    };

    public type CanisterStatusArgs = {
        canister_id : Principal
    };
    public type CanisterStatusResult = {
        status : { #stopped; #stopping; #running };
        memory_size : Nat;
        cycles : Nat;
        settings : Settings;
        module_hash : ?[Nat8]
    };

    public type ActorManagement = actor {
        create_canister : CreateCanisterArgs -> async CreateCanisterResult;
        install_code : InstallCodeArgs -> async ();
        update_settings : UpdateSettingsArgs -> async ();
        canister_status : CanisterStatusArgs -> async CanisterStatusResult;
        deposit_cycles : DepositCyclesArgs -> async ()
    };

    public let IC0 : ActorManagement = actor ("aaaaa-aa")
}
