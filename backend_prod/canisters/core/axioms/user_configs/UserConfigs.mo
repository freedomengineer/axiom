import Config "UserConfig";

import E "../../../common/Errors";

import Array "../../../library/Array";
import List "../../../library/List";
import Map "../../../library/Map";
import Set "../../../library/Set";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type List<T> = List.List<T>;
    private type Map<K, V> = Map.Map<K, V>;
    private type Set<T> = Set.Set<T>;

    private type Variant = Config.Variant;
    private type Config = Config.Config;
    private type SharableConfig = Config.Sharable;

    private let { PrincipalVal; TextVal } = Set;
    private let { VariantKey } = Config;

    private func _default() : Map<Variant, SharableConfig> = Map.fromEntries<Variant, SharableConfig>([
        (VariantKey(#ExcludedPublishers), #ExcludedPublishers([])),
        (VariantKey(#ExcludedFields), #ExcludedFields([])),
    ]);
    private func _isDefault(config : Config) : Bool = switch (config) {
        case (#ExcludedPublishers(value)) value.size() == 0;
        case (#ExcludedFields(value)) value.size() == 0
    };
    private func _fromSharable(config : SharableConfig) : Config = switch (config) {
        case (#ExcludedPublishers(value)) #ExcludedPublishers(Set.fromArray(Array.map(value, PrincipalVal)));
        case (#ExcludedFields(value)) #ExcludedFields(Set.fromArray(Array.map(value, TextVal)))
    };

    /// AXIOMS ////// USER CONFIGS ////////////

    private type Self = Configs;

    public type Configs = {
        var configs : List<Config>
    };
    public type Sharable = [SharableConfig];

    public func init() : Self = {
        var configs = List.nil()
    };

    /// PRIVATE ////// MODIFIERS ////////////

    private func _delete(__ : Self, variant : Variant) {
        __.configs := List.deleteFirst<Config>(__.configs, func(x) = Config.is(x, variant))
    };
    private func _update(__ : Self, config : Config) {
        __.configs := List.smartPush<Config>(__.configs, config, func(x) = Config.equal(x, config), 100).0
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func set(__ : Self, config : SharableConfig) {
        let c : Config = _fromSharable(config);
        switch (_isDefault(c)) {
            case (true) _delete(__, Config.variant(c));
            case (false) _update(__, c)
        }
    };
    public func setBatch(__ : Self, configs : [SharableConfig]) {
        for (config in configs.vals()) set(__, config)
    };
    public func setAll(__ : Self, configs : [SharableConfig]) {
        __.configs := List.nil();
        for (config in configs.vals()) set(__, config)
    };

    public func restore(__ : Self, variant : Variant) {
        _delete(__, variant)
    };
    public func restoreAll(__ : Self) {
        __.configs := List.nil()
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func getConfig(__ : Self, variant : Variant) : ?Config {
        List.find<Config>(__.configs, func(x) = Config.is(x, variant))
    };
    public func getConfigs(__ : Self) : [Config] {
        List.toArray(__.configs)
    };

    public func ExcludedPublishers(__ : Self) : ?Set<Principal> = switch (getConfig(__, #ExcludedPublishers)) {
        case (? #ExcludedPublishers(value)) ?value;
        case (_) null
    };
    public func ExcludedFields(__ : Self) : ?Set<Text> = switch (getConfig(__, #ExcludedFields)) {
        case (? #ExcludedFields(value)) ?value;
        case (_) null
    };

    public func toSharable(__ : Self) : Sharable {
        let defaultConfigs : Map<Variant, SharableConfig> = _default();
        for (config in List.toIter<Config>(__.configs)) {
            let variant : Variant = Config.variant(config);
            Map.put<Variant, SharableConfig>(defaultConfigs, VariantKey(variant), Config.toSharable(config))
        };
        Map.getVals<Variant, SharableConfig>(defaultConfigs)
    }
}
