import Coupon "coupons/Coupon";
import Coupons "coupons/Coupons";
import User "users/User";
import Base "../../library/Base";
import Configs "../../library/Configs";
import Earning "../../library/Earning";
import Pagination "../../library/Pagination";

module {
    public type Affiliate = actor {
        shiftToMidnight : shared (Nat) -> async ();
        initialize : shared () -> async ();
        setConfigs : shared ([(Configs.Key, Configs.SharableValue)]) -> async ();
        putConfigs : shared ([(Configs.Key, Configs.SharableValue)]) -> async ();
        fillReferrals : shared (Principal, Nat, ?Principal) -> async ();
        lockCoupon : shared ([Nat8], Principal) -> async Coupon.Sharable;
        redeemCouponFailed : shared ([Nat8], Principal, Text) -> async ();
        redeemCoupon : shared ([Nat8], Principal) -> async ();
        createCoupon : shared (Nat) -> async [Nat8];
        withdrawAll : shared () -> async ();
        withdrawExpiredCoupons : shared () -> async ();
        getConfig : query (Configs.Key) -> async Configs.SharableValue;
        getConfigs : query () -> async Configs.Sharable;
        getCoupon : query (Text) -> async Coupon.Sharable;
        getCoupons : query (Coupons.Filter, Base.Sort<Coupons.Sort>) -> async Coupons.Sharable;
        getCouponsPagination : query (Coupons.Filter, Base.Sort<Coupons.Sort>, Nat, Nat) -> async Pagination.Pagination<Coupon.Sharable>;
        getPrivateCoupon : query (Text) -> async Coupon.Sharable;
        getPrivateCoupons : query (Coupons.PrivateFilter, Base.Sort<Coupons.PrivateSort>) -> async Coupons.PrivateSharable;
        getPrivateCouponsPagination : query (Coupons.PrivateFilter, Base.Sort<Coupons.PrivateSort>, Nat, Nat) -> async Pagination.Pagination<Coupon.Sharable>;
        getTop : query ({ #Referrers }) -> async Pagination.TopNonPagination;
        getTopPagination : query ({ #Referrers }, Nat, Nat) -> async Pagination.TopPagination;
        getUser : query (Principal) -> async User.Sharable;
        getEarning : query (Principal) -> async Earning.Sharable;
        getCouponsEarning : query (Principal) -> async Earning.Sharable;
        expectUserNotFound : query (Principal) -> async ();
    };
};