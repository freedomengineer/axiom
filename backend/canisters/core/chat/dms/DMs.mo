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

    private let Key = Map.TextKey;

    func _key(a : Principal, b : Principal) : Text {
        var key = "";
        for ((ca, cb) in Iter.parallel<Char, Char>(Principal.toText(a).chars(), Principal.toText(b).chars())) {
            let xa = switch (ca) {
                case (?'-') null;
                case (_) ca
            };
            let xb = switch (cb) {
                case (?'-') null;
                case (_) cb
            };
            switch (xa, xb) {
                case (null, ?cb) key #= Char.toText(cb);
                case (?ca, null) key #= Char.toText(ca);
                case ((?ca, ?cb)) switch (ca < cb) {
                    case (true) key #= Char.toText(ca) # Char.toText(cb);
                    case (false) key #= Char.toText(cb) # Char.toText(ca)
                };
                case (null, null) {}
            }
        };
        key
    };

    /// CHAT ////// CHANNELS ////////////

    private type Self = DMs;

    public type DMs = Map<Text, DM>;

    public func init() : Self = Map.new();

    /// PUBLIC ////// MODIFIERS ////////////

    public func create(__ : Self, creator : Principal, to : Principal, getNow : () -> Int) : Text {
        let key = _key(creator, to);
        Map.put(__, Key(key), DM.init(creator, to, getNow));
        key
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func dm(__ : Self, a : Principal, b : Principal) : DM = switch (Map.get(__, Key(_key(a, b)))) {
        case (?dm) dm;
        case (null) E.f(#NOT_EXISTED("DM"), "Attempted to retrieve a non-existent DM between " # Principal.toText(a) # " and " # Principal.toText(b))
    }
}
