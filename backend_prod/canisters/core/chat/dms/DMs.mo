import DM "DM";

import E "../../../common/Errors";

import Iter "../../../library/Iter";
import Map "../../../library/Map";

import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Char "mo:base/Char";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Map<K, V> = Map.Map<K, V>;

    private type DM = DM.DM;
    private type PrivateSharableDM = DM.PrivateSharable;

    private let Key = Map.TextKey;

    /// CHAT ////// CHANNELS ////////////

    private type Self = DMs;

    public type DMs = Map<Text, DM>;

    public func init() : Self = Map.new();

    /// PUBLIC ////// MODIFIERS ////////////

    public func create(__ : Self, creator : Principal, to : Principal) : Text {
        let key = DM.key(creator, to);
        Map.put(__, Key(key), DM.init(creator, to));
        key
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func dm(__ : Self, a : Principal, b : Principal) : DM = switch (Map.get(__, Key(DM.key(a, b)))) {
        case (?dm) dm;
        case (null) E.f(#NOT_EXISTED("DM"), "Attempted to retrieve a non-existent DM between " # debug_show a # " and " # debug_show b)
    };

    public func getPrivateDM(__ : Self, from : Principal, to : (Principal, Text)) : PrivateSharableDM {
        DM.toPrivateSharable(dm(__, from, to.0), from, to.1)
    }
}
