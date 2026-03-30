import DM "DM";
import Message "../messages/Message";

import E "../../../common/Errors";

import Iter "../../../library/Iter";
import Map "../../../library/Map";

import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Char "mo:base/Char";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Map<K, V> = Map.Map<K, V>;

    private type EncryptedDEK = Message.EncryptedDEK;
    private type DM = DM.DM;
    private type PrivateSharableDM = DM.PrivateSharable;

    private let Key = Map.TextKey;

    /// CHAT ////// CHANNELS ////////////

    private type Self = DMs;

    public type DMs = Map<Text, DM>;

    public func init() : Self = Map.new();

    /// PUBLIC ////// MODIFIERS ////////////

    public func create(__ : Self, creator : (Principal, EncryptedDEK), to : (Principal, EncryptedDEK)) : Text {
        let key = DM.key(creator.0, to.0);
        Map.put(__, Key(key), DM.init(creator, to));
        key
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func found(__ : Self, a : Principal, b : Principal) : Bool = Map.includes(__, Key(DM.key(a, b)));

    public func dm(__ : Self, a : Principal, b : Principal) : DM = switch (Map.get(__, Key(DM.key(a, b)))) {
        case (?dm) dm;
        case (null) E.f(#NOT_EXISTED("DM"), "Attempted to retrieve a non-existent DM between " # debug_show a # " and " # debug_show b)
    };

    public func getPrivateDM(__ : Self, to : (Principal, Text), caller : Principal) : PrivateSharableDM {
        DM.toPrivateSharable(dm(__, caller, to.0), to, caller)
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectFound(__ : Self, a : Principal, b : Principal) {
        if (found(__, a, b)) return;
        E.f(#NOT_EXISTED("DM"), "Attempted to retrieve a non-existent DM between " # debug_show a # " and " # debug_show b)
    };
    public func expectNotFound(__ : Self, a : Principal, b : Principal) {
        if (not found(__, a, b)) return;
        E.f(#ALREADY_EXISTED("DM"), "DM between " # debug_show a # " and " # debug_show b # " already exists")
    }
}
