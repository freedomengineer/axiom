module {
    public type Settings = {
        controllers : ?[Principal];
        compute_allocation : ?Nat;
        memory_allocation : ?Nat;
        freezing_threshold : ?Nat;
        reserved_cycles_limit : ?Nat;
        log_visibility : ?{
            #controllers;
            // #public;
            #allowed_viewers : [Principal]
        };
        wasm_memory_limit : ?Nat;
        wasm_memory_threshold : ?Nat;
        environment_variables : ?[{ name : Text; value : Text }]
    };
    public type InstallMode = {
        #reinstall;
        #upgrade : ?{
            skip_pre_upgrade : ?Bool;
            wasm_memory_persistence : ?{ #keep; #replace }
        };
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

    public type StartCanisterArgs = {
        canister_id : Principal
    };
    public type StopCanisterArgs = {
        canister_id : Principal
    };

    public type Snapshot = {
        id : Blob;
        taken_at_timestamp : Nat64;
        total_size : Nat64
    };
    public type TakeCanisterSnapshotArgs = {
        canister_id : Principal;
        replace_snapshot : ?Blob
    };
    public type TakeCanisterSnapshotResult = Snapshot;

    public type LoadCanisterSnapshotArgs = {
        canister_id : Principal;
        snapshot_id : Blob;
        sender_canister_version : ?Nat64
    };

    public type ListCanisterSnapshotsArgs = {
        canister_id : Principal
    };

    public type ListCanisterSnapshotsResult = [Snapshot];

    public type DeleteCanisterSnapshotArgs = {
        canister_id : Principal;
        snapshot_id : Blob
    };

    public type ActorManagement = actor {
        create_canister : CreateCanisterArgs -> async CreateCanisterResult;
        install_code : InstallCodeArgs -> async ();
        update_settings : UpdateSettingsArgs -> async ();
        canister_status : CanisterStatusArgs -> async CanisterStatusResult;
        deposit_cycles : DepositCyclesArgs -> async ();

        start_canister : StartCanisterArgs -> async ();
        stop_canister : StopCanisterArgs -> async ();

        take_canister_snapshot : TakeCanisterSnapshotArgs -> async TakeCanisterSnapshotResult;
        load_canister_snapshot : (LoadCanisterSnapshotArgs) -> async ();
        list_canister_snapshots : ListCanisterSnapshotsArgs -> async ListCanisterSnapshotsResult;
        delete_canister_snapshot : DeleteCanisterSnapshotArgs -> async ()
    };

    public let IC0 : ActorManagement = actor ("aaaaa-aa")
}
