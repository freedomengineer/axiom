import User "users/User";
import Users "users/Users";
import Coupon "coupons/Coupon";
import Coupons "coupons/Coupons";

import ICPUSDInterface "../icpusd/Interface";
import SalesInterface "../sales/Interface";
import SplitInterface "../split/Interface";
import FacadeInterface "../../periphery/facade/Interface";
import IndicatorInterface "../../periphery/indicator/Interface";
import IndicatorInterfaceOld "../../periphery/indicator/InterfaceOld";

import C "../../common/Constants";
import E "../../common/Errors";

import Array "../../library/Array";
import Base "../../library/Base";
import Configs "../../library/Configs";
import E8S "../../library/E8S";
import Earning "../../library/Earning";
import Iter "../../library/Iter";
import List "../../library/List";
import Pagination "../../library/Pagination";
import Proportion "../../library/Proportion";
import SHA256 "../../library/SHA256";

import Blob "mo:base/Blob";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Time "mo:base/Time";
import Random "mo:base/Random";
import Debug "mo:base/Debug";

(
    with migration = func(
        old : {
            var Indicator : IndicatorInterfaceOld.Indicator
        }
    ) : {
    } { {} }
) shared ({ caller = indicator }) persistent actor class Affiliate() = this {
        private transient let Indicator : IndicatorInterface.Indicator = actor (Principal.toText(indicator));

    private stable let users : Users.Users = Users.init();
    private stable let coupons : Coupons.Coupons = Coupons.init();

    private stable let configs : Configs.Configs = Configs.make([]);

    /// PROTECTED ////// MODIFIERS ////////////

    public shared ({ caller }) func initialize() : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        await Indicator.expectUnreleased();

        let founder : Principal = await Indicator.getPrincipal(#Founder);
        Users.addFounder(users, founder)
    };
    public shared ({ caller }) func setConfigs(entries : [(Configs.Key, Configs.SharableValue)]) : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        Configs.setBatch(configs, entries)
    };
    public shared ({ caller }) func putConfigs(entries : [(Configs.Key, Configs.SharableValue)]) : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        Configs.putBatch(configs, entries)
    };

    public shared ({ caller }) func fillReferrals(principal : Principal, icpPaid : Nat, referrer : ?Principal) : async () {
        await Indicator.expectAuthorized(caller, [#Facade]);
        await expectUserNotFound(principal);

        let icpPaidE8S : E8S.E8S = E8S.make(icpPaid);
        let Split : SplitInterface.Split = await Indicator.Split();

        let affiliateProportion : Proportion.Proportion = switch (await Split.getConfig("AFFILIATE_PROPORTION")) {
            case (#Proportion(p)) Proportion.make(p);
            case (_) E.f(#NOT_EXISTED("AFFILIATE_PROPORTION"), "AFFILIATE_PROPORTION is not found in Split configs")
        };
        let affiliatePayout : E8S.E8S = E8S.getScaleBy(icpPaidE8S, affiliateProportion);

        switch (referrer) {
            case (?r) switch (Users.userOpt(users, r)) {
                case (?u) {
                    User.deposit(u, affiliatePayout);
                    User.referred(u);
                    Users.register(users, principal, referrer);

                    ignore (
                        func() : async () {
                            let Facade : FacadeInterface.Facade = await Indicator.Facade();
                            await Facade.postUserNotification((r, #NewReferrals({ user = principal; claimable = affiliatePayout.val; timestamp = Time.now() })))
                        }
                    )();

                    return
                };
                case (null) {}
            };
            case (null) {}
        };
        await Split.internalTransfer(#Founder, affiliatePayout.val);
        Users.register(users, principal, referrer)
    };

    public shared ({ caller }) func lockCoupon(code : [Nat8], principal : Principal) : async Coupon.Sharable {
        await Indicator.expectAuthorized(caller, [#Facade]);
        await expectUserNotFound(principal);

        let key : Text = SHA256.fromBytes(code);
        let coupon : Coupon.Coupon = Coupons.coupon(coupons, key);
        Coupon.locked(coupon, principal);
        Coupon.toSharable(coupon, key)
    };
    public shared ({ caller }) func redeemCouponFailed(code : [Nat8], principal : Principal, reason : Text) : async () {
        await Indicator.expectAuthorized(caller, [#Facade]);
        await expectUserNotFound(principal);

        let key : Text = SHA256.fromBytes(code);
        let coupon : Coupon.Coupon = Coupons.coupon(coupons, key);
        Coupon.failed(coupon, principal, reason)
    };
    public shared ({ caller }) func redeemCoupon(code : [Nat8], principal : Principal) : async () {
        await Indicator.expectAuthorized(caller, [#Facade]);
        await expectUserNotFound(principal);

        let key : Text = SHA256.fromBytes(code);
        let coupon : Coupon.Coupon = Coupons.coupon(coupons, key);
        let creator : User.User = Users.user(users, coupon.creator);

        Coupon.redeemed(coupon, principal);
        User.referred(creator);
        Users.register(users, principal, ?coupon.creator);

        ignore (
            func() : async () {
                let Facade : FacadeInterface.Facade = await Indicator.Facade();
                await Facade.postUserNotification((coupon.creator, #CouponRedeemed({ key; user = principal; timestamp = Time.now() })))
            }
        )();

    };

    /// PUBLIC ////// MODIFIERS ////////////

    public shared ({ caller }) func createCoupon(capitalRaised : Nat) : async Coupon.PrivateSharable {
        let user : User.User = Users.user(users, caller);
        let random : [Nat8] = Blob.toArray(await Random.blob());

        func get(bytes : [Nat8]) : (Text, [Nat8]) {
            let code : [Nat8] = bytes;
            let key : Text = SHA256.fromBytes(bytes);
            (key, code)
        };

        var pair : (Text, [Nat8]) = get(Array.take(random, 16));
        if (Coupons.found(coupons, pair.0)) pair := get(Array.take(random, -16));
        if (Coupons.found(coupons, pair.0)) E.f(#NOT_VALID("Random code"), "The randomized coupon code was duplicated, please try again with new one.");

        Debug.print(debug_show (pair.1));
        Debug.print(debug_show (pair.1.size()));

        let Sales : SalesInterface.Sales = await Indicator.Sales();
        let Split : SplitInterface.Split = await Indicator.Split();
        let ICPUSD : ICPUSDInterface.ICPUSD = await Indicator.ICPUSD();

        let adjustedUsdRequired : Nat = await Sales.expectPackageFound(capitalRaised);
        let icpRequired : Nat = await ICPUSD.exchange(false, adjustedUsdRequired);
        let icpPaid : Nat = await Split.affiliateDeposit(caller, icpRequired);

        let coupon : Coupon.Coupon = Coupons.create(coupons, pair.0, caller, capitalRaised, icpPaid, pair.1);
        User.couponCreated(user, pair.0);
        Coupon.toPrivateSharable(coupon, pair.0)
    };

    public shared ({ caller }) func withdrawAll() : async () {
        let user : User.User = Users.user(users, caller);
        let balance : Nat = User.getBalance(user);

        if (balance <= 0) E.f(#NOT_VALID("Withdrawal"), "No affiliate rewards available to withdraw");

        let Split : SplitInterface.Split = await Indicator.Split();

        User.withdraw(user, E8S.make(balance));
        await Split.externalTransfer(caller, balance)
    };

    /// PRIVATE ////// ACCESSORS ////////////

    private func _getUserCoupons(principal : Principal) : List.List<Text> = Users.user(users, principal).coupons;

    /// PUBLIC ////// ACCESSORS ////////////

    public query func getConfig(key : Configs.Key) : async Configs.SharableValue {
        Configs.getConfig(configs, key)
    };
    public query func getConfigs() : async Configs.Sharable {
        Configs.getConfigs(configs)
    };

    public query ({ caller }) func getCoupon(key : Text) : async Coupon.Sharable {
        Coupons.getCoupon(coupons, key)
    };
    public query ({ caller }) func getCoupons(filter : Coupons.Filter, sort : Base.Sort<Coupons.Sort>) : async Coupons.Sharable {
        Coupons.getCoupons(coupons, filter, sort, _getUserCoupons)
    };
    public query ({ caller }) func getCouponsPagination(filter : Coupons.Filter, sort : Base.Sort<Coupons.Sort>, page : Nat, limit : Nat) : async Pagination.Pagination<Coupon.Sharable> {
        let result : Coupons.Sharable = Coupons.getCoupons(coupons, filter, sort, _getUserCoupons);
        Pagination.paginate(result, page, limit)
    };

    public query ({ caller }) func getPrivateCoupon(key : Text) : async Coupon.PrivateSharable {
        let coupon : Coupon.PrivateSharable = Coupons.getPrivateCoupon(coupons, key);
        if (coupon.creator != caller) E.f(#NOT_TOBE("Coupon Creator"), "You are not authorized to access this coupon");
        coupon
    };
    public query ({ caller }) func getPrivateCoupons(filter : Coupons.PrivateFilter, sort : Base.Sort<Coupons.PrivateSort>) : async Coupons.PrivateSharable {
        let user : User.User = Users.user(users, caller);
        Coupons.getPrivateCoupons(coupons, filter, sort, user.coupons)
    };
    public query ({ caller }) func getPrivateCouponsPagination(filter : Coupons.PrivateFilter, sort : Base.Sort<Coupons.PrivateSort>, page : Nat, limit : Nat) : async Pagination.Pagination<Coupon.PrivateSharable> {
        let user : User.User = Users.user(users, caller);
        let result : Coupons.PrivateSharable = Coupons.getPrivateCoupons(coupons, filter, sort, user.coupons);
        Pagination.paginate(result, page, limit)
    };

    public query ({ caller }) func getTop(category : { #Referrers; #CouponGenerators }) : async Pagination.TopNonPagination {
        let result : Pagination.TopResult = Users.getTop(users, category);
        Pagination.topNonPaginate(result, caller)
    };
    public query ({ caller }) func getTopPagination(category : { #Referrers; #CouponGenerators }, page : Nat, limit : Nat) : async Pagination.TopPagination {
        let result : Pagination.TopResult = Users.getTop(users, category);
        Pagination.topPaginate(result, page, limit, caller)
    };

    public query func getUser(principal : Principal) : async User.Sharable {
        Users.getUser(users, principal)
    };
    public query func getEarning(principal : Principal) : async Earning.Sharable {
        let user : User.User = Users.user(users, principal);
        User.getEarning(user)
    };
    public query func getUserCouponTotal(principal : Principal) : async (Nat, Nat) {
        let user : User.User = Users.user(users, principal);
        (List.size(user.coupons), Coupons.totalIcpPaid(coupons, user.coupons))
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public query func expectUserNotFound(principal : Principal) : async () {
        Users.expectNotFound(users, principal)
    }
}
