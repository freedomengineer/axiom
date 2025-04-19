import Allocation "allocations/Allocation";
import Allocations "allocations/Allocations";
import Actor "../../periphery/indicator/actors/Actor";
import Configs "../../library/Configs";
import E8S "../../library/E8S";

module {
    public type Treasury = actor {
        setConfigs : shared ([(Configs.Key, Configs.SharableValue)]) -> async ();
        putConfigs : shared ([(Configs.Key, Configs.SharableValue)]) -> async ();
        internalMint : shared (Actor.Variant, Nat) -> async ();
        internalTransfer : shared (Actor.Variant, Nat) -> async ();
        externalMint : shared (Principal, Nat) -> async ();
        externalTransfer : shared (Principal, Nat) -> async ();
        delegatedExternalTransfer : shared (Actor.Variant, Principal, Nat) -> async ();
        claim : shared (Principal, Nat) -> async ();
        delegatedClaim : shared (Actor.Variant, Principal, Nat) -> async ();
        getConfig : query (Configs.Key) -> async Configs.SharableValue;
        getConfigs : query () -> async Configs.Sharable;
        getAllocation : query (Actor.Variant) -> async Allocation.Sharable;
        getAllocations : query () -> async Allocations.Sharable;
        getBalance : query (Actor.Variant) -> async E8S.Sharable;
        getAllocated : query (Actor.Variant) -> async E8S.Sharable;
        getTotalSupply : query () -> async E8S.Sharable;
        getReserveSupply : query () -> async E8S.Sharable;
        getCirculatingSupply : query () -> async E8S.Sharable;
    };
};