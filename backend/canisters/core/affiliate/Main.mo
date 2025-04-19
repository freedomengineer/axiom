import User "users/User";
import Users "users/Users";

import IndicatorInterface "../../periphery/indicator/Interface";
import SplitInterface "../split/Interface";

import C "../../common/Constants";
import E "../../common/Errors";

import Configs "../../library/Configs";
import E8S "../../library/E8S";
import Earning "../../library/Earning";
import Iter "../../library/Iter";
import Proportion "../../library/Proportion";

import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Time "mo:base/Time";

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

    private stable let configs : Configs.Configs = Configs.make([]);

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
                    return
                };
                case (null) {}
            };
            case (null) {}
        };
        await Split.internalTransfer(#Founder, affiliatePayout.val);
        Users.register(users, principal, referrer, getNow)
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public shared ({ caller }) func withdrawAll() : async () {
        let user : User.User = Users.user(users, caller);
        let balance : E8S.E8S = User.positiveBalance(user);

        let Split : SplitInterface.Split = await Indicator.Split();
        await Split.externalTransfer(caller, balance.val);
        User.withdraw(user, balance, getNow)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public query func getConfig(key : Configs.Key) : async Configs.SharableValue {
        Configs.getConfig(configs, key)
    };
    public query func getConfigs() : async Configs.Sharable {
        Configs.getConfigs(configs)
    };

    public query func getUser(principal : Principal) : async User.Sharable {
        Users.getUser(users, principal)
    };
    public query func getEarning(principal : Principal) : async Earning.Sharable {
        let user : User.User = Users.user(users, principal);
        User.getEarning(user)
    };

    /// PRIVATE ////// ACCESSORS ////////////

    public query func expectUserNotFound(principal : Principal) : async () {
        Users.expectNotFound(users, principal)
    }
}
