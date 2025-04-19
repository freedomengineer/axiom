import DIP721Types "../../dip721/Types";

import E "../../../common/Errors";

import Base "../../../library/Base";
import Map "../../../library/Map";

import Option "mo:base/Option";
import Hash "mo:base/Hash";
import Text "mo:base/Text";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Hash = Hash.Hash;
    private type Key<K> = Map.Key<K>;

    private func _achievementEqual(a : Achievement, b : Achievement) : Bool = a == b;
    private func _achievementHash(x : Achievement) : Hash = Text.hash(debug_show x);

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Achievement = {
        #Referral;
        #OctupleBurial
    };
    public func AchievementKey(achievement : Achievement) : Key<Achievement> = {
        key = achievement;
        equal = _achievementEqual;
        hash = _achievementHash
    };

    /// SALES ////// PACKAGES ////////////

    private type Self = AchievementPackage;

    public type AchievementPackage = {
        var principal : ?Principal;
        metadata : DIP721Types.Dip721NonFungibleToken
    };
    public type Sharable = {
        achievement : Achievement;
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

    public func toSharable(__ : Self, achievement : Achievement) : Sharable = {
        __ with achievement;
        principal = __.principal
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectDeployed(__ : Self) {
        if (isDeployed(__)) return;
        E.f(#NOT_VALID("Achievement Package"), "Achievement Package has not deployed yet")
    };
    public func expectNotDeployed(__ : Self) {
        if (not isDeployed(__)) return;
        E.f(#NOT_VALID("Achievement Package"), "Achievement Package has already deployed")
    }
}
