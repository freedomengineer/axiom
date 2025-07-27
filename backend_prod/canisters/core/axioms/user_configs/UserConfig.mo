import Map "../../../library/Map";
import Set "../../../library/Set";

import Hash "mo:base/Hash";
import Text "mo:base/Text";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Hash = Hash.Hash;
    private type Key<K> = Map.Key<K>;
    private type Set<T> = Set.Set<T>;

    private func _variantEqual(a : Variant, b : Variant) : Bool = a == b;
    private func _variantHash(x : Variant) : Hash = Text.hash(debug_show x);

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Variant = {
        #ExcludedPublishers;
        #ExcludedFields
    };

    public func VariantKey(variant : Variant) : Key<Variant> = {
        key = variant;
        equal = _variantEqual;
        hash = _variantHash
    };

    /// AXIOMS ////// CONFIG ////////////

    private type Self = Config;

    public type Config = {
        #ExcludedPublishers : Set<Principal>;
        #ExcludedFields : Set<Text>
    };
    public type Sharable = {
        #ExcludedPublishers : [Principal];
        #ExcludedFields : [Text]
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func equal(__ : Self, x : Self) : Bool = switch (__, x) {
        case (#ExcludedPublishers(_), #ExcludedPublishers(_)) true;
        case (#ExcludedFields(_), #ExcludedFields(_)) true;
        case (_) false
    };
    public func is(__ : Self, x : Variant) : Bool = switch (__, x) {
        case (#ExcludedPublishers(_), #ExcludedPublishers) true;
        case (#ExcludedFields(_), #ExcludedFields) true;
        case (_) false
    };
    public func variant(config : Self) : Variant = switch (config) {
        case (#ExcludedPublishers(_)) #ExcludedPublishers;
        case (#ExcludedFields(_)) #ExcludedFields
    };

    public func toSharable(config : Self) : Sharable = switch (config) {
        case (#ExcludedPublishers(publishers)) #ExcludedPublishers(Set.toArray(publishers));
        case (#ExcludedFields(fields)) #ExcludedFields(Set.toArray(fields))
    }
}
