import User "User";

import E "../../../common/Errors";

import Array "../../../library/Array";
import Base "../../../library/Base";
import Configs "../../../library/Configs";
import Format "../../../library/Format";
import Map "../../../library/Map";

import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Option "mo:base/Option";
import Order "mo:base/Order";
import Int "mo:base/Int";
import Nat "mo:base/Nat";
import Text "mo:base/Text";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Time = Time.Time;
    private type Configs = Configs.Configs;
    private type Map<K, V> = Map.Map<K, V>;
    private type Compare<T> = Base.Compare<T>;
    private type Sorted<T> = Base.Sort<T>;
    private type Order = Base.Order;
    private type Ordered = Order.Order;
    private type Hyperlink = Format.Hyperlink;

    private type User = User.User;
    private type SharableUser = User.Sharable;
    private type Identifier = User.Identifier;
    private type IdentifierVariant = User.IdentifierVariant;

    private type Entry = (Principal, User);

    private let { PrincipalKey } = Map;

    private func _recent(orderBy : Order) : Compare<Entry> = switch (orderBy) {
        case (#ascending) func((_, a) : Entry, (_, b) : Entry) = Int.compare(a.creationDate, b.creationDate);
        case (#descending) func((_, a) : Entry, (_, b) : Entry) = Int.compare(b.creationDate, a.creationDate)
    };
    private func _capitalRaised(orderBy : Order) : Compare<Entry> = switch (orderBy) {
        case (#ascending) func((_, a) : Entry, (_, b) : Entry) = Nat.compare(a.capitalRaised, b.capitalRaised);
        case (#descending) func((_, a) : Entry, (_, b) : Entry) = Nat.compare(b.capitalRaised, a.capitalRaised)
    };
    private func _alphabetical(orderBy : Order) : Compare<Entry> = switch (orderBy) {
        case (#ascending) func((_, a) : Entry, (_, b) : Entry) = Text.compare(a.username, b.username);
        case (#descending) func((_, a) : Entry, (_, b) : Entry) = Text.compare(b.username, a.username)
    };

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Filter = {
        capitalRaised : ?Nat;
        q : ?Text
    };
    public type Sort = {
        #recent;
        #capitalRaised;
        #alphabetical;
        #followers;
        #followings
    };

    /// FACADE ////// USERS ////////////

    private type Self = Users;

    public type Users = Map.Map<Principal, User>;
    public type Sharable = [SharableUser];

    public func init() : Self = Map.new<Principal, User>();

    /// PRIVATE ////// ACCESSORS ////////////

    private func _fromIdentifier(__ : Self, from : IdentifierVariant) : ?(Principal, User) {
        switch (from) {
            case (#Principal(p)) Map.getEntry(__, PrincipalKey(p));
            case (#Username(username)) Map.findEntry<Principal, User>(__, func(_, user) = user.username == username)
        }
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func addFounder(__ : Self, founder : Principal, getNow : () -> Int) {
        Map.put(__, PrincipalKey(founder), User.init("axiom_founder", 0, getNow))
    };

    public func register(__ : Self, principal : Principal, username : Text, capitalRaised : Nat, getNow : () -> Int) {
        Map.put(__, PrincipalKey(principal), User.init(username, capitalRaised, getNow))
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func usernameValid(username : Text, configs : Configs) : Bool {
        let MIN_USERNAME_LENGTH : Nat = Configs.Nat(configs, "MIN_USERNAME_LENGTH");
        let MAX_USERNAME_LENGTH : Nat = Configs.Nat(configs, "MAX_USERNAME_LENGTH");
        let USERNAME_SPECIAL_CHARACTERS : Text = Configs.Text(configs, "USERNAME_SPECIAL_CHARACTERS");

        let length : Nat = username.size();
        if (length < MIN_USERNAME_LENGTH or length > MAX_USERNAME_LENGTH) return false;
        if (Text.contains(username, #text(USERNAME_SPECIAL_CHARACTERS))) return false;

        true
    };
    public func locationValid(location : ?Text, configs : Configs) : Bool {
        switch (location) {
            case (null) return true;
            case (?location) {
                let MIN_LOCATION_LENGTH : Nat = Configs.Nat(configs, "MIN_LOCATION_LENGTH");
                let MAX_LOCATION_LENGTH : Nat = Configs.Nat(configs, "MAX_LOCATION_LENGTH");

                let length : Nat = location.size();
                if (length < MIN_LOCATION_LENGTH or length > MAX_LOCATION_LENGTH) return false;

                true
            }
        }
    };
    public func linksValid(links : [Hyperlink], configs : Configs) : Bool {
        let MAX_HYPERLINKS : Nat = Configs.Nat(configs, "MAX_HYPERLINKS");
        for (link in links.vals()) Format.validateHyperlink(link, configs);
        links.size() <= MAX_HYPERLINKS
    };

    public func getIdentifier(__ : Self, from : IdentifierVariant) : Identifier {
        switch (_fromIdentifier(__, from)) {
            case (null) E.f(#NOT_TOBE("User"), "Attempted to derive Identifier from " # debug_show from # " who has not registered yet");
            case (?(principal, user))({
                principal;
                username = user.username;
                capitalRaised = user.capitalRaised
            })
        }
    };
    public func getCount(__ : Self) : Nat = Map.size(__);

    public func found(__ : Self, principal : Principal) : Bool = Map.includes(__, PrincipalKey(principal));
    public func usernameTaken(__ : Self, username : Text) : Bool = Option.isSome(_fromIdentifier(__, #Username(username)));

    public func user(__ : Self, principal : Principal) : User {
        switch (Map.get(__, PrincipalKey(principal))) {
            case (?user) user;
            case (null) E.f(#NOT_TOBE("User"), "User " # debug_show principal # " has not registered in Facade")
        }
    };
    public func getUser(__ : Self, principal : Principal) : SharableUser {
        User.toSharable(user(__, principal), principal)
    };
    public func getUsers(__ : Self, filter : Filter, sort : Sorted<Sort>) : Sharable {
        var filtered : ?[Entry] = null;
        let toSharable : (Entry) -> SharableUser = func(principal, user) = User.toSharable(user, principal);

        switch (filter.capitalRaised) {
            case (null) {};
            case (?capitalRaised) filtered := ?Map.getEntriesFilterMap<Principal, User, Entry>(
                __,
                func(i, e) = switch (e.capitalRaised >= capitalRaised) {
                    case (true) ?(i, e);
                    case (false) null
                },
            )
        };
        switch (filter.q, filtered) {
            case (null, _) {};
            case (?pattern, null) {
                let patternIns = #text(Text.toLowercase(pattern));
                filtered := ?Map.getEntriesFilterMap<Principal, User, Entry>(
                    __,
                    func(i, e) = switch (User.containsPattern(e, patternIns)) {
                        case (true) ?(i, e);
                        case (false) null
                    },
                )
            };
            case (?pattern, ?prev) {
                let patternIns = #text(Text.toLowercase(pattern));
                filtered := ?Array.filter<Entry>(prev, func(_, e) = User.containsPattern(e, patternIns))
            }
        };

        switch (sort.by, sort.order, filtered) {
            case (#recent, order, null) Array.map<Entry, SharableUser>(Array.sort(Map.getEntries(__), _recent(order)), toSharable);
            case (#capitalRaised, order, null) Array.map<Entry, SharableUser>(Array.sort(Map.getEntries(__), _capitalRaised(order)), toSharable);
            case (#alphabetical, order, null) Array.map<Entry, SharableUser>(Array.sort(Map.getEntries(__), _alphabetical(order)), toSharable);
            case (#recent, order, ?unsorted) Array.map<Entry, SharableUser>(Array.sort(unsorted, _recent(order)), toSharable);
            case (#capitalRaised, order, ?unsorted) Array.map<Entry, SharableUser>(Array.sort(unsorted, _capitalRaised(order)), toSharable);
            case (#alphabetical, order, ?unsorted) Array.map<Entry, SharableUser>(Array.sort(unsorted, _alphabetical(order)), toSharable)
        }
    };

    public func getPrincipals(__ : Self) : [Principal] {
        Map.getKeys(__)
    };
    public func getIdentifiers(__ : Self) : [Identifier] {
        Map.getEntriesMap<Principal, User, Identifier>(__, func(i, e) = ({ principal = i; username = e.username; capitalRaised = e.capitalRaised }))
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectNotFound(__ : Self, principal : Principal) : () {
        if (not found(__, principal)) return;
        E.f(#ALREADY_EXISTED("User"), "User " # debug_show principal # " has already existed in Facade")
    };
    public func expectFound(__ : Self, principal : Principal) : () {
        if (found(__, principal)) return;
        E.f(#NOT_EXISTED("User"), "User " # debug_show principal # " has not registered in Facade")
    };
    public func expectUsernameNotTaken(__ : Self, username : Text) : () {
        if (not usernameTaken(__, username)) return;
        E.f(#ALREADY_EXISTED("Username"), "Username " # debug_show username # " has already existed in Facade")
    };
    public func expectUsernameTaken(__ : Self, username : Text) : () {
        if (usernameTaken(__, username)) return;
        E.f(#NOT_EXISTED("Username"), "Username " # debug_show username # " has not registered in Facade")
    };

    public func expectUsernameValid(username : Text, configs : Configs) : () {
        if (usernameValid(username, configs)) return;
        E.f(#NOT_VALID("Username"), "Username " # debug_show username # " is invalid")
    };
    public func expectLocationValid(location : ?Text, configs : Configs) : () {
        if (locationValid(location, configs)) return;
        E.f(#NOT_VALID("Location"), "Location is invalid")
    };
    public func expectLinksValid(links : [Hyperlink], configs : Configs) : () {
        if (linksValid(links, configs)) return;
        E.f(#NOT_VALID("Links"), "Links are invalid")
    }
}
