import E "../common/Errors";

import Range "Range";
import Map "Map";
import LProportion "Proportion";
import LE8S "E8S";
import LSet "Set";
import LDate "Date";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Map<K, V> = Map.Map<K, V>;
    private type Set<T> = LSet.Set<T>;
    private type Range<T> = Range.Range<T>;
    private type SharableRange<T> = Range.Sharable<T>;
    private type Proportion = LProportion.Proportion;
    private type SharableProportion = LProportion.Sharable;
    private type E8S = LE8S.E8S;
    private type SharableE8S = LE8S.Sharable;
    private type Date = LDate.Date;
    private type SharableDate = LDate.Sharable;

    private let { TextKey } = Map;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Key = Text;
    public type Value = {
        #Bool : Bool;
        #Nat : Nat;
        #Float : Float;
        #Text : Text;
        #E8S : E8S;
        #Duration : Nat;
        #Date : Date;
        #Proportion : Proportion;
        #RangeNat : Range<Nat>;
        #RangeInt : Range<Int>;
        #RangeFloat : Range<Float>
    };
    public type SharableValue = {
        #Bool : Bool;
        #Nat : Nat;
        #Float : Float;
        #Text : Text;
        #E8S : SharableE8S;
        #Duration : Nat;
        #Date : SharableDate;
        #Proportion : SharableProportion;
        #RangeNat : SharableRange<Nat>;
        #RangeInt : SharableRange<Int>;
        #RangeFloat : SharableRange<Float>
    };

    /// LIBRARY ////// CONFIGS ////////////

    private type Self = Configs;

    public type Configs = Map<Key, Value>;
    public type Sharable = [(Key, SharableValue)];

    public func make(entries : [(Key, Value)]) : Self {
        let __ = Map.new<Key, Value>();
        for ((key, value) in entries.vals()) Map.put(__, TextKey(key), value);
        __
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func set(__ : Self, key : Key, newValue : SharableValue) {
        let oldValue : Value = Map.unwrap(__, TextKey(key));
        switch (oldValue, newValue) {
            case (#Bool(_), #Bool(_)) {};
            case (#Nat(_), #Nat(_)) {};
            case (#Float(_), #Float(_)) {};
            case (#Text(_), #Text(_)) {};
            case (#E8S(_), #E8S(_)) {};
            case (#Duration(_), #Duration(_)) {};
            case (#Date(_), #Date(_)) {};
            case (#Proportion(_), #Proportion(_)) {};
            case (#RangeNat(_), #RangeNat(_)) {};
            case (#RangeInt(_), #RangeInt(_)) {};
            case (#RangeFloat(_), #RangeFloat(_)) {};
            case (old, new) E.f(#INTERNAL_FAILURE("Set Config"), "Type mismatch for config key " # key # ", expected " # debug_show old # ", got " # debug_show new)
        };
        Map.put(__, TextKey(key), _valueFromSharable(newValue))
    };
    public func put(__ : Self, key : Key, newValue : SharableValue) {
        Map.put(__, TextKey(key), _valueFromSharable(newValue))
    };
    public func setBatch(__ : Self, entries : [(Key, SharableValue)]) {
        for ((key, value) in entries.vals()) set(__, key, value)
    };
    public func putBatch(__ : Self, entries : [(Key, SharableValue)]) {
        for ((key, value) in entries.vals()) put(__, key, value)
    };

    /// PRIVATE ////// ACCESSORS ////////////

    private func _valueToSharable(value : Value) : SharableValue = switch value {
        case (#Bool(b)) #Bool(b);
        case (#Nat(n)) #Nat(n);
        case (#Float(f)) #Float(f);
        case (#Text(t)) #Text(t);
        case (#E8S(e)) #E8S(LE8S.toSharable(e));
        case (#Duration(t)) #Duration(t);
        case (#Date(d)) #Date(LDate.toSharable(d));
        case (#Proportion(p)) #Proportion(LProportion.toSharable(p));
        case (#RangeNat(r)) #RangeNat(Range.toSharable(r));
        case (#RangeInt(r)) #RangeInt(Range.toSharable(r));
        case (#RangeFloat(r)) #RangeFloat(Range.toSharable(r))
    };
    private func _valueFromSharable(value : SharableValue) : Value = switch value {
        case (#Bool(b)) #Bool(b);
        case (#Nat(n)) #Nat(n);
        case (#Float(f)) #Float(f);
        case (#Text(t)) #Text(t);
        case (#E8S(e)) #E8S(LE8S.make(e));
        case (#Duration(t)) #Duration(t);
        case (#Date(d)) #Date(LDate.make(d));
        case (#Proportion(p)) #Proportion(LProportion.make(p));
        case (#RangeNat(r)) #RangeNat(Range.make(r));
        case (#RangeInt(r)) #RangeInt(Range.make(r));
        case (#RangeFloat(r)) #RangeFloat(Range.make(r))
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func config(__ : Self, key : Key) : Value = switch (Map.get(__, TextKey(key))) {
        case (null) E.f(#INTERNAL_FAILURE("Get Config"), "Missing config key " # key);
        case (?v) v
    };
    public func getConfig(__ : Self, key : Key) : SharableValue = _valueToSharable(config(__, key));
    public func getConfigs(__ : Self) : Sharable = Map.getEntriesMap<Key, Value, (Key, SharableValue)>(__, func(key, value) = (key, _valueToSharable(value)));

    public func Bool(__ : Self, key : Key) : Bool = switch (Map.get(__, TextKey(key))) {
        case (? #Bool(b)) b;
        case (null) E.f(#INTERNAL_FAILURE("Get Config"), "Missing config key " # key);
        case (_) E.f(#INTERNAL_FAILURE("Get Config"), "Type mismatch for config key " # key # ", expected Bool")
    };
    public func Nat(__ : Self, key : Key) : Nat = switch (Map.get(__, TextKey(key))) {
        case (? #Nat(n)) n;
        case (null) E.f(#INTERNAL_FAILURE("Get Config"), "Missing config key " # key);
        case (_) E.f(#INTERNAL_FAILURE("Get Config"), "Type mismatch for config key " # key # ", expected Nat")
    };
    public func Float(__ : Self, key : Key) : Float = switch (Map.get(__, TextKey(key))) {
        case (? #Float(f)) f;
        case (null) E.f(#INTERNAL_FAILURE("Get Config"), "Missing config key " # key);
        case (_) E.f(#INTERNAL_FAILURE("Get Config"), "Type mismatch for config key " # key # ", expected Float")
    };
    public func Text(__ : Self, key : Key) : Text = switch (Map.get(__, TextKey(key))) {
        case (? #Text(t)) t;
        case (null) E.f(#INTERNAL_FAILURE("Get Config"), "Missing config key " # key);
        case (_) E.f(#INTERNAL_FAILURE("Get Config"), "Type mismatch for config key " # key # ", expected Text")
    };
    public func E8S(__ : Self, key : Key) : E8S = switch (Map.get(__, TextKey(key))) {
        case (? #E8S(e)) e;
        case (null) E.f(#INTERNAL_FAILURE("Get Config"), "Missing config key " # key);
        case (_) E.f(#INTERNAL_FAILURE("Get Config"), "Type mismatch for config key " # key # ", expected E8S")
    };
    public func Duration(__ : Self, key : Key) : Nat = switch (Map.get(__, TextKey(key))) {
        case (? #Duration(t)) t;
        case (null) E.f(#INTERNAL_FAILURE("Get Config"), "Missing config key " # key);
        case (_) E.f(#INTERNAL_FAILURE("Get Config"), "Type mismatch for config key " # key # ", expected Duration")
    };
    public func Date(__ : Self, key : Key) : Date = switch (Map.get(__, TextKey(key))) {
        case (? #Date(d)) d;
        case (null) E.f(#INTERNAL_FAILURE("Get Config"), "Missing config key " # key);
        case (_) E.f(#INTERNAL_FAILURE("Get Config"), "Type mismatch for config key " # key # ", expected Date")
    };
    public func Proportion(__ : Self, key : Key) : Proportion = switch (Map.get(__, TextKey(key))) {
        case (? #Proportion(p)) p;
        case (null) E.f(#INTERNAL_FAILURE("Get Config"), "Missing config key " # key);
        case (_) E.f(#INTERNAL_FAILURE("Get Config"), "Type mismatch for config key " # key # ", expected Proportion")
    };
    public func RangeNat(__ : Self, key : Key) : Range<Nat> = switch (Map.get(__, TextKey(key))) {
        case (? #RangeNat(r)) r;
        case (null) E.f(#INTERNAL_FAILURE("Get Config"), "Missing config key " # key);
        case (_) E.f(#INTERNAL_FAILURE("Get Config"), "Type mismatch for config key " # key # ", expected Range<Nat>")
    };
    public func RangeInt(__ : Self, key : Key) : Range<Int> = switch (Map.get(__, TextKey(key))) {
        case (? #RangeInt(r)) r;
        case (null) E.f(#INTERNAL_FAILURE("Get Config"), "Missing config key " # key);
        case (_) E.f(#INTERNAL_FAILURE("Get Config"), "Type mismatch for config key " # key # ", expected Range<Int>")
    };
    public func RangeFloat(__ : Self, key : Key) : Range<Float> = switch (Map.get(__, TextKey(key))) {
        case (? #RangeFloat(r)) r;
        case (null) E.f(#INTERNAL_FAILURE("Get Config"), "Missing config key " # key);
        case (_) E.f(#INTERNAL_FAILURE("Get Config"), "Type mismatch for config key " # key # ", expected Range<Float>")
    }
}
