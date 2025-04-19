import Management "../../../library/Management";
import Map "../../../library/Map";

import Hash "mo:base/Hash";
import Principal "mo:base/Principal";
import Text "mo:base/Text";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Hash = Hash.Hash;
    private type Key<K> = Map.Key<K>;

    private type InstallCodeArgs = Management.InstallCodeArgs;

    private func _configurableVariantEqual(a : ConfigurableVariant, b : ConfigurableVariant) : Bool = a == b;
    private func _configurableVariantHash(x : ConfigurableVariant) : Hash = Text.hash(debug_show x);

    private func _deployableVariantEqual(a : DeployableVariant, b : DeployableVariant) : Bool = a == b;
    private func _deployableVariantHash(x : DeployableVariant) : Hash = Text.hash(debug_show x);

    private func _variantEqual(a : Variant, b : Variant) : Bool = a == b;
    private func _variantHash(x : Variant) : Hash = Text.hash(debug_show x);

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Info = {
        status : { #stopped; #stopping; #running };
        memorySize : Nat;
        cycles : Nat;
        args : [Nat8];
        moduleHash : Text;
        commitHash : Text
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
        var commitHash : Text
    };
    public func init(principal : Principal) : Self = {
        principal;
        var args = [];
        var commitHash = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func update(__ : Self, args : [Nat8], commitHash : Text) {
        __.args := args;
        __.commitHash := commitHash
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func principal(__ : Self) : Principal = __.principal;

    public func constructInstallCodeArgs(__ : Self, arg : [Nat8], wasm_module : [Nat8], mode : Management.InstallMode) : InstallCodeArgs = {
        arg;
        wasm_module;
        mode;
        canister_id = __.principal
    }
}
