import DIP721Types "../../dip721/Types";

import E "../../../common/Errors";

import Base "../../../library/Base";

import Option "mo:base/Option";

module {
    /// PUBLIC ////// DECLARATIONS ////////////

    public type ACORNToMint<T> = { liquid : T; buried : T };

    /// SALES ////// PACKAGES ////////////

    private type Self = Package;

    public type Package = {
        var principal : ?Principal;
        metadata : DIP721Types.Dip721NonFungibleToken
    };
    public type Sharable = {
        capitalRaised : Nat;
        principal : ?Principal;
        metadata : DIP721Types.Dip721NonFungibleToken
    };

    public func init(name : Text, symbol : Text, logoUri : Text) : Self = {
        var principal = null;
        metadata = {
            name;
            symbol;
            logo = { data = logoUri; logo_type = "image/png" };
            maxLimit = 0
        }
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func deploy(__ : Self, principal : Principal) {
        __.principal := ?principal
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func isDeployed(__ : Self) : Bool = Option.isSome(__.principal);
    public func principal(__ : Self) : Principal = Base.unwrap(__.principal);

    public func toSharable(__ : Self, capitalRaised : Nat) : Sharable = {
        __ with capitalRaised;
        principal = __.principal
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectDeployed(__ : Self) {
        if (isDeployed(__)) return;
        E.f(#NOT_VALID("Package"), "Package has not deployed yet")
    };
    public func expectNotDeployed(__ : Self) {
        if (not isDeployed(__)) return;
        E.f(#NOT_VALID("Package"), "Package has already deployed")
    }
}
