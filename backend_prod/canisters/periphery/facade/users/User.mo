import E "../../../common/Errors";

import Format "../../../library/Format";

import Time "mo:base/Time";
import Array "mo:base/Array";
import Text "mo:base/Text";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Time = Time.Time;
    private type Hyperlink = Format.Hyperlink;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Identifier = {
        principal : Principal;
        username : Text
    };
    public type IdentifierVariant = {
        #Principal : Principal;
        #Username : Text
    };

    /// FACADE ////// USER ////////////

    private type Self = User;

    public type User = {
        var avatar : ?Format.Picture;
        var username : Text;
        capitalRaised : Nat;
        creationDate : Time;
        var links : [Hyperlink];
        var location : ?Text
    };
    public type Sharable = {
        principal : Principal;
        avatar : ?Format.Picture;
        username : Text;
        capitalRaised : Nat;
        creationDate : Time;
        links : [Hyperlink];
        location : Text
    };

    public func init(username : Text, capitalRaised : Nat) : Self = {
        var username;
        var avatar = null;
        capitalRaised;
        creationDate = Time.now();
        var links = [];
        var location = null
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func updateUsername(__ : Self, username : Text) {
        __.username := username
    };
    public func updateLocation(__ : Self, location : ?Text) {
        __.location := location
    };
    public func updateAvatar(__ : Self, picture : ?Format.Picture) {
        __.avatar := picture
    };
    public func updateLinks(__ : Self, links : [Hyperlink]) {
        __.links := links
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func containsPattern(__ : Self, pattern : { #text : Text }) : Bool = Text.contains(Text.toLowercase(__.username), pattern);

    public func toSharable(__ : Self, principal : Principal) : Sharable = {
        __ with principal;
        avatar = __.avatar;
        username = __.username;
        links = __.links;
        location = switch (__.location) { case (?x) x; case (null) "" }
    }
}
