import Configs "../../library/Configs";

module {
    public type Assets = actor {
        shiftToMidnight : shared (Nat) -> async ();
        setConfigs : shared ([(Configs.Key, Configs.SharableValue)]) -> async ();
        putConfigs : shared ([(Configs.Key, Configs.SharableValue)]) -> async ();
        getConfig : query (Configs.Key) -> async Configs.SharableValue;
        getConfigs : query () -> async Configs.Sharable;
    };
};