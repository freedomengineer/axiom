import User "users/User";
import Configs "../../library/Configs";
import Earning "../../library/Earning";
import Pagination "../../library/Pagination";

module {
    public type Affiliate = actor {
        initialize : shared () -> async ();
        setConfigs : shared ([(Configs.Key, Configs.SharableValue)]) -> async ();
        putConfigs : shared ([(Configs.Key, Configs.SharableValue)]) -> async ();
        fillReferrals : shared (Principal, Nat, ?Principal) -> async ();
        withdrawAll : shared () -> async ();
        getConfig : query (Configs.Key) -> async Configs.SharableValue;
        getConfigs : query () -> async Configs.Sharable;
        getTop : query ({ #Referrals }) -> async Pagination.TopNonPagination;
        getTopPagination : query ({ #Referrals }, Nat, Nat) -> async Pagination.TopPagination;
        getUser : query (Principal) -> async User.Sharable;
        getEarning : query (Principal) -> async Earning.Sharable;
        expectUserNotFound : query (Principal) -> async ();
    };
};