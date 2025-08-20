import Distribution "distributions/Distribution";
import Distributions "distributions/Distributions";
import Actor "../../periphery/indicator/actors/Actor";
import Configs "../../library/Configs";
import E8S "../../library/E8S";
import Earning "../../library/Earning";

module {
    public type Split = actor {
        shiftToMidnight : shared (Nat) -> async ();
        setConfigs : shared ([(Configs.Key, Configs.SharableValue)]) -> async ();
        putConfigs : shared ([(Configs.Key, Configs.SharableValue)]) -> async ();
        deposit : shared (Principal, Nat) -> async ();
        affiliateDeposit : shared (Principal, Nat) -> async Nat;
        internalTransfer : shared (Actor.Variant, Nat) -> async ();
        externalTransfer : shared (Principal, Nat) -> async ();
        getConfig : query (Configs.Key) -> async Configs.SharableValue;
        getConfigs : query () -> async Configs.Sharable;
        getDistribution : query (Actor.Variant) -> async Distribution.Sharable;
        getDistributions : query () -> async Distributions.Sharable;
        getEarning : query (Actor.Variant) -> async Earning.Sharable;
        getBalance : query (Actor.Variant) -> async E8S.Sharable;
        getTotalRevenue : query () -> async E8S.Sharable;
        getTotalBalance : query () -> async E8S.Sharable;
    };
};