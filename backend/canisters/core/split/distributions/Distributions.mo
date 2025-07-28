import Distribution "Distribution";
import Actor "../../../periphery/indicator/actors/Actor";

import E "../../../common/Errors";

import Configs "../../../library/Configs";
import E8S "../../../library/E8S";
import Earning "../../../library/Earning";
import Iter "../../../library/Iter";
import Map "../../../library/Map";
import Proportion "../../../library/Proportion";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Iter<T> = Iter.Iter<T>;
    private type Map<K, V> = Map.Map<K, V>;
    private type Configs = Configs.Configs;
    private type E8S = E8S.E8S;
    private type Proportion = Proportion.Proportion;
    private type SharableProportion = Proportion.Sharable;
    private type SharableE8S = E8S.Sharable;

    private type ActorVariant = Actor.Variant;
    private type Distribution = Distribution.Distribution;
    private type SharableDistribution = Distribution.Sharable;

    private let { VariantKey } = Actor;

    public func getProportion(actorVariant : ActorVariant, configs : Configs) : Proportion = switch (actorVariant) {
        case (#Affiliate) Configs.Proportion(configs, "AFFILIATE_PROPORTION");
        case (#DAO) Configs.Proportion(configs, "DAO_PROPORTION");
        case (#Founder) Configs.Proportion(configs, "FOUNDER_PROPORTION");
        case (_) E.f(#NOT_EXISTED("Distributed Actor"), debug_show actorVariant # " has no distribution proportion in Split")
    };

    /// SPLIT ////// DISTRIBUTIONS ////////////

    public type Self = Distributions;

    public type Distributions = Map<ActorVariant, Distribution>;
    public type Sharable = [SharableDistribution];

    public func init(getNow : () -> Int) : Self = Map.fromEntries<ActorVariant, Distribution>([
        (VariantKey(#Affiliate), Distribution.init(getNow)),
        (VariantKey(#DAO), Distribution.init(getNow)),
        (VariantKey(#Founder), Distribution.init(getNow)),
    ]);

    /// PRIVATE ////// ACCESSORS ////////////

    private func _actors(__ : Self) : [ActorVariant] = Map.getKeys(__);

    /// PUBLIC ////// MODIFIERS ////////////

    public func deposit(__ : Self, depositAmount : E8S, configs : Configs) {
        for ((actorVariant, distribution) in Map.entries(__)) {
            let proportion : Proportion = getProportion(actorVariant, configs);
            let proportionalAmount : E8S = E8S.getScaleBy(depositAmount, proportion);
            Distribution.deposit(distribution, proportionalAmount)
        }
    };

    public func affiliateDeposit(__ : Self, splitAmounts : [(ActorVariant, Nat)]) {
        for ((actorVariant, amount) in splitAmounts.vals()) {
            let amountE8S : E8S = E8S.make(amount);
            Distribution.deposit(distribution(__, actorVariant), amountE8S)
        }
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func distribution(__ : Self, actorVariant : ActorVariant) : Distribution {
        switch (Map.get(__, VariantKey(actorVariant))) {
            case (null) E.f(#NOT_EXISTED("Distributed Actor"), debug_show actorVariant # " has no distribution proportion in Split, Distributed Actors: " # debug_show _actors(__));
            case (?x) x
        }
    };
    public func getDistribution(__ : Self, actorVariant : ActorVariant, configs : Configs) : SharableDistribution {
        Distribution.toSharable(distribution(__, actorVariant), actorVariant, getProportion(actorVariant, configs))
    };
    public func getDistributions(__ : Self, configs : Configs) : Sharable {
        Map.getEntriesMap<ActorVariant, Distribution, SharableDistribution>(__, func(i, e) = Distribution.toSharable(e, i, getProportion(i, configs)))
    };

    public func totalRevenue(__ : Self) : E8S {
        Map.foldVals<ActorVariant, Distribution, E8S>(__, E8S.new(), func(acc, cur) = E8S.getAdd(acc, cur.earning.revenue))
    };
    public func getTotalRevenue(__ : Self) : SharableE8S {
        E8S.toSharable(totalRevenue(__))
    };

    public func totalBalance(__ : Self) : E8S {
        Map.foldVals<ActorVariant, Distribution, E8S>(__, E8S.new(), func(acc, cur) = E8S.getAdd(acc, Earning.balance(cur.earning)))
    };
    public func getTotalBalance(__ : Self) : SharableE8S {
        E8S.toSharable(totalBalance(__))
    }
}
