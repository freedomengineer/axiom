import Burial "burials/Burial";
import Burials "burials/Burials";
import User "users/User";
import Configs "../../library/Configs";

module {
    public type Escrow = actor {
        shiftToMidnight : shared (Nat) -> async ();
        initialize : shared () -> async ();
        setConfigs : shared ([(Configs.Key, Configs.SharableValue)]) -> async ();
        putConfigs : shared ([(Configs.Key, Configs.SharableValue)]) -> async ();
        register : shared (Principal, Nat) -> async ();
        transferFounderBurial : shared (Principal, Principal) -> async ();
        bury : shared (Nat, Burial.Option) -> async ();
        withdrawAll : shared () -> async ();
        getConfig : query (Configs.Key) -> async Configs.SharableValue;
        getConfigs : query () -> async Configs.Sharable;
        getUser : query (Principal) -> async User.Sharable;
        getBurials : query (Principal) -> async Burials.Sharable;
        getVotingPower : query (Principal) -> async Nat;
        getBuriedAmount : query (Principal) -> async Nat;
        getInterestAmount : query (Principal) -> async Nat;
        getExpiredAmount : query (Principal) -> async Nat;
        getClaimableAmount : query (Principal) -> async Nat;
        expectUserNotFound : query (Principal) -> async ();
    };
};