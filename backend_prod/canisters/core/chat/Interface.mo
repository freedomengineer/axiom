import Configs "../../library/Configs";

module {
    public type Chat = actor {
        initialize : shared () -> async ();
        setConfigs : shared ([(Configs.Key, Configs.SharableValue)]) -> async ();
        putConfigs : shared ([(Configs.Key, Configs.SharableValue)]) -> async ();
        register : shared (Principal, Nat) -> async ();
        getConfig : query (Configs.Key) -> async Configs.SharableValue;
        getConfigs : query () -> async Configs.Sharable;
        expectUserNotFound : query (Principal) -> async ();
    };
};