import User "users/User";
import Users "users/Users";
import Coupon "coupons/Coupon";
import Coupons "coupons/Coupons";

import Actor "../../periphery/indicator/actors/Actor";
import Notification "../../periphery/facade/notifications/Notification";
import Distributions "../split/distributions/Distributions";

import IndicatorInterface "../../periphery/indicator/Interface";
import FacadeInterface "../../periphery/facade/Interface";
import ICPUSDInterface "../icpusd/Interface";
import SalesInterface "../sales/Interface";
import SplitInterface "../split/Interface";

import C "../../common/Constants";
import E "../../common/Errors";

import Array "../../library/Array";
import Base "../../library/Base";
import Configs "../../library/Configs";
import E8S "../../library/E8S";
import Earning "../../library/Earning";
import Hexadecimal "../../library/Hexadecimal";
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
import Timer "mo:base/Timer";
import Random "mo:base/Random";

shared ({ caller = indicator }) actor class Affiliate() = this {
    ////// TEMPORARY IMPLEMENTATION ////////////
    private stable var shiftedTime : Int = 0;
    private func getNow() : Int = shiftedTime + Time.now();
    public shared func shiftToMidnight(days : Nat) : async () {
        for (i in Iter.range(1, days)) {
            shiftedTime += C.ONE_DAY - getNow() % C.ONE_DAY
        }
    };
    ////// TEMPORARY IMPLEMENTATION ////////////

    private stable let Indicator : IndicatorInterface.Indicator = actor (Principal.toText(indicator));

    private stable let users : Users.Users = Users.init();
    private stable let coupons : Coupons.Coupons = Coupons.init();

    private stable let configs : Configs.Configs = Configs.make([
        /// New Configs v0.2.2
        ("COUPON_LIMIT_PER_TIER", #Nat(2)),
        ("COUPON_AVAILABILITY_DURATION", #Duration(21)),
    ]);

    /// PRIVATE ////// MODIFIERS ////////////

    private func _cleanUpExpiredCoupons() : List.List<Coupon.Coupon> {
        let COUPON_AVAILABILITY_DURATION : Nat = Configs.Duration(configs, "COUPON_AVAILABILITY_DURATION");
        Coupons.cleanUpExpiredCoupons(coupons, COUPON_AVAILABILITY_DURATION, getNow)
    };
    private func _dailyExecution() : async () {
        let expired : List.List<Coupon.Coupon> = _cleanUpExpiredCoupons();
        // ignore (
        //     func() : async () {
        //         let Facade : FacadeInterface.Facade = await Indicator.Facade();
        //         let systemNotifications : List.List<Notification.SystemVariantParam> = List.map<Coupon.Coupon, Notification.SystemVariantParam>(
        //             expired,
        //             func(header) = #FlagResult({ header; result = #Expired; timestamp = getNow() }),
        //         );
        //         await Facade.postSystemNotifications(systemNotifications)
        //     }
        // )()
    };

    /// PROTECTED ////// MODIFIERS ////////////

    public shared ({ caller }) func initialize() : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        await Indicator.expectUnreleased();

        let founder : Principal = await Indicator.getPrincipal(#Founder);
        Users.addFounder(users, founder, getNow)
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
                    Users.register(users, principal, referrer, getNow);

                    ignore (
                        func() : async () {
                            let Facade : FacadeInterface.Facade = await Indicator.Facade();
                            await Facade.postUserNotification((r, #NewReferrals({ user = principal; claimable = affiliatePayout.val; timestamp = getNow() })))
                        }
                    )();

                    return
                };
                case (null) {}
            };
            case (null) {}
        };
        await Split.internalTransfer(#Founder, affiliatePayout.val);
        Users.register(users, principal, referrer, getNow)
    };

    public shared ({ caller }) func lockCoupon(code : [Nat8], principal : Principal) : async Coupon.Sharable {
        await Indicator.expectAuthorized(caller, [#Facade]);
        await expectUserNotFound(principal);

        let key : Text = SHA256.fromBytes(code);
        let coupon : Coupon.Coupon = Coupons.coupon(coupons, key);
        Coupon.locked(coupon, principal, getNow);
        Coupon.toSharable(coupon, key)
    };
    public shared ({ caller }) func redeemCouponFailed(code : [Nat8], principal : Principal, reason : Text) : async () {
        await Indicator.expectAuthorized(caller, [#Facade]);
        await expectUserNotFound(principal);

        let key : Text = SHA256.fromBytes(code);
        let coupon : Coupon.Coupon = Coupons.coupon(coupons, key);
        Coupon.failed(coupon, principal, reason, getNow)
    };
    public shared ({ caller }) func redeemCoupon(code : [Nat8], principal : Principal) : async () {
        await Indicator.expectAuthorized(caller, [#Facade]);
        await expectUserNotFound(principal);

        let key : Text = SHA256.fromBytes(code);
        let coupon : Coupon.Coupon = Coupons.coupon(coupons, key);
        let creator : User.User = Users.user(users, coupon.creator);
        let rawSplitWithoutAffiliate : [(Actor.Variant, Nat)] = Array.filter<(Actor.Variant, Nat)>(coupon.splitAmounts, func(amount) = amount.0 != #Affiliate);

        let Split : SplitInterface.Split = await Indicator.Split();
        await Split.affiliateSplit(rawSplitWithoutAffiliate);

        Coupon.redeemed(coupon, principal, getNow);
        User.referred(creator);
        Users.register(users, principal, ?coupon.creator, getNow);

        ignore (
            func() : async () {
                let Facade : FacadeInterface.Facade = await Indicator.Facade();
                await Facade.postUserNotification((coupon.creator, #NewReferrals({ user = principal; claimable = 0; timestamp = getNow() })))
            }
        )();

    };

    /// PUBLIC ////// MODIFIERS ////////////

    public shared ({ caller }) func createCoupon(capitalRaised : Nat) : async [Nat8] {
        let random : [Nat8] = Blob.toArray(await Random.blob());

        func get(bytes : [Nat8]) : (Text, [Nat8]) {
            let code : [Nat8] = bytes;
            let key : Text = SHA256.fromBytes(bytes);
            (key, code)
        };

        var pair : (Text, [Nat8]) = get(Array.take(random, 128));
        if (Coupons.found(coupons, pair.0)) pair := get(Array.take(random, -128));
        if (Coupons.found(coupons, pair.0)) E.f(#NOT_VALID("Random code"), "The randomized coupon code was duplicated, please try again with new one.");

        let Sales : SalesInterface.Sales = await Indicator.Sales();
        let Split : SplitInterface.Split = await Indicator.Split();
        let ICPUSD : ICPUSDInterface.ICPUSD = await Indicator.ICPUSD();

        let adjustedUsdRequired : Nat = await Sales.expectPackageFound(capitalRaised);
        let icpRequired : Nat = await ICPUSD.exchange(false, adjustedUsdRequired);
        let icpRequiredE8S : E8S.E8S = E8S.make(icpRequired);

        let splitConfigs : Configs.Configs = Configs.fromSharable(await Split.getConfigs());

        let affiliateAmount : Nat = E8S.getScaleBy(icpRequiredE8S, Distributions.getProportion(#Affiliate, splitConfigs)).val;
        let daoAmount : Nat = E8S.getScaleBy(icpRequiredE8S, Distributions.getProportion(#DAO, splitConfigs)).val;
        let founderAmount : Nat = E8S.getScaleBy(icpRequiredE8S, Distributions.getProportion(#Founder, splitConfigs)).val;

        let splitAmounts : [(Actor.Variant, Nat)] = [(#Affiliate, affiliateAmount), (#DAO, daoAmount), (#Founder, founderAmount)];
        await Split.affiliateDeposit(caller, daoAmount + founderAmount);

        Coupons.create(coupons, pair.0, caller, capitalRaised, splitAmounts, pair.1, getNow);
        pair.1
    };

    public shared ({ caller }) func withdrawAll() : async () {
        let COUPON_AVAILABILITY_DURATION : Nat = Configs.Duration(configs, "COUPON_AVAILABILITY_DURATION");

        let user : User.User = Users.user(users, caller);

        let balance : Nat = User.getBalance(user);
        let expiredAmount : Nat = Coupons.getExpiredAmount(coupons, user.coupons, COUPON_AVAILABILITY_DURATION, getNow);

        switch (balance > 0, expiredAmount > 0) {
            case (false, false) {};
            case (true, false) {
                User.withdraw(user, E8S.make(balance), getNow);

                try {
                    let Split : SplitInterface.Split = await Indicator.Split();
                    await Split.externalTransfer(caller, balance)
                } catch (e) {
                    User.deposit(user, E8S.make(balance))
                }
            };
            case (false, true) {
                let (newCoupons, expiredCoupons) : (List.List<Text>, List.List<Text>) = Coupons.withdrawExpiredCoupons(coupons, user.coupons, COUPON_AVAILABILITY_DURATION, getNow);
                User.assignCoupon(user, newCoupons);

                try {
                    let Split : SplitInterface.Split = await Indicator.Split();
                    await Split.affiliateTransfer(caller, expiredAmount)
                } catch (e) {
                    User.assignCoupon(user, List.append(newCoupons, expiredCoupons))
                }
            };
            case (true, true) {
                let (newCoupons, expiredCoupons) : (List.List<Text>, List.List<Text>) = Coupons.withdrawExpiredCoupons(coupons, user.coupons, COUPON_AVAILABILITY_DURATION, getNow);
                User.assignCoupon(user, newCoupons);

                try {
                    let Split : SplitInterface.Split = await Indicator.Split();
                    await Split.affiliateExternalTransfer(caller, balance, expiredAmount)
                } catch (e) {
                    User.assignCoupon(user, List.append(newCoupons, expiredCoupons))
                }
            }
        }
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

    public query ({ caller }) func getPrivateCoupon(key : Text) : async Coupon.Sharable {
        let coupon : Coupon.PrivateSharable = Coupons.getPrivateCoupon(coupons, key);
        if (coupon.creator != caller) E.f(#NOT_TOBE("Coupon Creator"), "You are not authorized to access this coupon");
        coupon
    };
    public query ({ caller }) func getPrivateCoupons(filter : Coupons.PrivateFilter, sort : Base.Sort<Coupons.PrivateSort>) : async Coupons.PrivateSharable {
        let user : User.User = Users.user(users, caller);
        Coupons.getPrivateCoupons(coupons, filter, sort, user.coupons)
    };
    public query ({ caller }) func getPrivateCouponsPagination(filter : Coupons.PrivateFilter, sort : Base.Sort<Coupons.PrivateSort>, page : Nat, limit : Nat) : async Pagination.Pagination<Coupon.Sharable> {
        let user : User.User = Users.user(users, caller);
        let result : Coupons.PrivateSharable = Coupons.getPrivateCoupons(coupons, filter, sort, user.coupons);
        Pagination.paginate(result, page, limit)
    };

    public query ({ caller }) func getTop(category : { #Referrers }) : async Pagination.TopNonPagination {
        let result : Pagination.TopResult = Users.getTop(users, category);
        Pagination.topNonPaginate(result, caller)
    };
    public query ({ caller }) func getTopPagination(category : { #Referrers }, page : Nat, limit : Nat) : async Pagination.TopPagination {
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

    /// PUBLIC ////// ASSERTERS ////////////

    public query func expectUserNotFound(principal : Principal) : async () {
        Users.expectNotFound(users, principal)
    };

    /// PRIVATE ////// CRON JOBS ////////////

    ignore Timer.setTimer<system>(
        #nanoseconds(C.ONE_DAY - (Int.abs(Time.now()) % C.ONE_DAY)),
        func() : async () {
            await _dailyExecution();
            ignore Timer.recurringTimer<system>(#nanoseconds(C.ONE_DAY), _dailyExecution)
        },
    )
}
