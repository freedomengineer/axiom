import CircularBuffer "../../../library/CircularBuffer";
import Hexadecimal "../../../library/Hexadecimal";
import Management "../../../library/Management";
import Map "../../../library/Map";

import Hash "mo:base/Hash";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Blob "mo:base/Blob";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Hash = Hash.Hash;
    private type Key<K> = Map.Key<K>;
    private type CircularBuffer<T> = CircularBuffer.CircularBuffer<T>;

    private type InstallCodeArgs = Management.InstallCodeArgs;
    private type Snapshot = Management.Snapshot;

    private func _configurableVariantEqual(a : ConfigurableVariant, b : ConfigurableVariant) : Bool = a == b;
    private func _configurableVariantHash(x : ConfigurableVariant) : Hash = Text.hash(debug_show x);

    private func _deployableVariantEqual(a : DeployableVariant, b : DeployableVariant) : Bool = a == b;
    private func _deployableVariantHash(x : DeployableVariant) : Hash = Text.hash(debug_show x);

    private func _variantEqual(a : Variant, b : Variant) : Bool = a == b;
    private func _variantHash(x : Variant) : Hash = Text.hash(debug_show x);

    /// PUBLIC ////// DECLARATIONS ////////////

    public type SnapshotFrom = {
        #BeforeProposal : Nat;
        #AfterProposal : Nat;
        #Arbitrary
    };
    public type SnapshotDetail = {
        id : Text;
        taken_at_timestamp : Nat64;
        total_size : Nat64;
        from : SnapshotFrom;
        moduleHash : Text
    };
    public type Info = {
        status : { #stopped; #stopping; #running };
        memorySize : Nat;
        cycles : Nat;
        args : [Nat8];
        moduleHash : Text;
        commitHash : Text;
        snapshots : [SnapshotDetail]
    };

    public type ConfigurableVariant = {
        #Treasury;
        #Split;
        #Affiliate;
        #Escrow;
        #Sales;
        #Axioms;
        #DAO;
        #Facade;
        #Encyclopedia;
        #Chat;
        #Assets;
        #Indicator
    };
    public type DeployableVariant = {
        #Treasury;
        #Split;
        #Affiliate;
        #Escrow;
        #Sales;
        #Axioms;
        #DAO;
        #Facade;
        #Encyclopedia;
        #Chat;
        #Assets;
        #Indicator;
        #ICPUSD;
        #Frontend;
        #ACORN
    };
    public type Variant = {
        #Treasury;
        #Split;
        #Affiliate;
        #Escrow;
        #Sales;
        #Axioms;
        #DAO;
        #Facade;
        #Encyclopedia;
        #Chat;
        #Assets;
        #Indicator;
        #ICPUSD;
        #Frontend;
        #ACORN;
        #Founder
    };

    public func ConfigurableVariantKey(variant : ConfigurableVariant) : Key<ConfigurableVariant> = {
        key = variant;
        equal = _configurableVariantEqual;
        hash = _configurableVariantHash
    };
    public func DeployableVariantKey(variant : DeployableVariant) : Key<DeployableVariant> = {
        key = variant;
        equal = _deployableVariantEqual;
        hash = _deployableVariantHash
    };
    public func VariantKey(variant : Variant) : Key<Variant> = {
        key = variant;
        equal = _variantEqual;
        hash = _variantHash
    };

    /// INDICATOR ////// ACTORS ////////////

    private type Self = Actor;

    public type Actor = {
        principal : Principal;
        var args : [Nat8];
        var commitHash : Text;
        snapshots : CircularBuffer<SnapshotDetail>
    };
    public func init(principal : Principal) : Self = {
        principal;
        var args = [];
        var commitHash = "593d4687448ceb4282a7493c51494e1fff17b460";
        snapshots = CircularBuffer.new(4)
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func update(__ : Self, args : [Nat8], commitHash : Text) {
        __.args := args;
        __.commitHash := commitHash
    };

    public func pushSnapshot(__ : Self, snapshot : SnapshotDetail) {
        CircularBuffer.push(__.snapshots, snapshot)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func principal(__ : Self) : Principal = __.principal;

    public func constructInstallCodeArgs(__ : Self, arg : [Nat8], wasm_module : [Nat8], mode : Management.InstallMode) : InstallCodeArgs = {
        arg;
        wasm_module;
        mode;
        canister_id = __.principal
    };

    public func replacedSnapshot(__ : Self) : ?Blob = switch (CircularBuffer.getRev(__.snapshots, 3)) {
        case (null) null;
        case (?snapshot) ?Blob.fromArray(Hexadecimal.decode(snapshot.id))
    };
    public func lastSnapshot(__ : Self) : ?Blob = switch (CircularBuffer.getRev(__.snapshots, 0)) {
        case (null) null;
        case (?snapshot) ?Blob.fromArray(Hexadecimal.decode(snapshot.id))
    }
}
