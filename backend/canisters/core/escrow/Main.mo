import Burials "burials/Burials";
import Burial "burials/Burial";
import Users "users/Users";
import User "users/User";
import TreasuryInterface "../treasury/Interface";
import IndicatorInterface "../../periphery/indicator/Interface";

import C "../../common/Constants";
import E "../../common/Errors";

import E8S "../../library/E8S";
import Configs "../../library/Configs";
import Iter "../../library/Iter";
import Pagination "../../library/Pagination";
import Proportion "../../library/Proportion";

import Principal "mo:base/Principal";
import Time "mo:base/Time";

shared ({ caller = indicator }) actor class Escrow() = this {
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

    private stable let configs : Configs.Configs = Configs.make([
        ("BURIAL_1X_MIN_DEPOSIT", #E8S(E8S.fromFloat(0_000.0))),
        ("BURIAL_2X_MIN_DEPOSIT", #E8S(E8S.fromFloat(1_000.0))),
        ("BURIAL_4X_MIN_DEPOSIT", #E8S(E8S.fromFloat(1_000.0))),
        ("BURIAL_8X_MIN_DEPOSIT", #E8S(E8S.fromFloat(1_000.0))),

        ("BURIAL_1X_DAILY_INTEREST_PROPORTION", #Proportion(Proportion.make(1, 36500))), /// 1% a year for 1X
        ("BURIAL_2X_DAILY_INTEREST_PROPORTION", #Proportion(Proportion.make(2, 36500))), /// 2% a year for 2X
        ("BURIAL_4X_DAILY_INTEREST_PROPORTION", #Proportion(Proportion.make(3, 36500))), /// 3% a year for 4X
        ("BURIAL_8X_DAILY_INTEREST_PROPORTION", #Proportion(Proportion.make(4, 36500))), /// 4% a year for 8X
    ]);

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

    public shared ({ caller }) func register(principal : Principal, initialAmount : Nat) : async () {
        await Indicator.expectAuthorized(caller, [#Facade]);
        await expectUserNotFound(principal);
        Users.register(users, principal, initialAmount, getNow)
    };

    public shared ({ caller }) func transferFounderBurial(from : Principal, to : Principal) : async () {
        await Indicator.expectAuthorized(caller, [#Founder]);
        let fromUser : User.User = Users.user(users, from);
        let toUser : User.User = Users.user(users, to);
        let burial : Burial.Burial = User.moveOutFounderBurial(fromUser);
        User.moveInFounderBurial(toUser, burial)
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public shared ({ caller }) func bury(amount : Nat, option : Burial.Option) : async () {
        let coefficient : Nat = Burial.optionToCoefficient(option);
        let MIN_BURIAL : E8S.E8S = Configs.E8S(configs, "BURIAL_" # debug_show coefficient # "X_MIN_DEPOSIT");
        let user : User.User = Users.user(users, caller);

        if (amount == 0) E.f(#NOT_VALID("Burial amount"), "Burial amount must be greater than 0");
        if (E8S.lt(E8S.make(amount), MIN_BURIAL)) E.f(#NOT_VALID("Burial amount"), "Burial amount must be greater than or equal to " # debug_show MIN_BURIAL # ", received " # debug_show amount);

        let Treasury : TreasuryInterface.Treasury = await Indicator.Treasury();
        await Treasury.claim(caller, amount);
        User.bury(user, amount, option, getNow)
    };

    public shared ({ caller }) func withdrawAll() : async () {
        let user : User.User = Users.user(users, caller);
        let interestAmount : Nat = User.getInterestAmount(user, configs, getNow);
        let expiredAmount : Nat = User.getExpiredAmount(user, getNow);

        if (interestAmount == 0 and expiredAmount == 0) E.f(#NOT_VALID("Withdrawal"), "No expired burials or interest available to withdraw");

        let Treasury : TreasuryInterface.Treasury = await Indicator.Treasury();
        if (interestAmount > 0) {
            User.markAsWithdrawn(user, getNow);
            await Treasury.externalMint(caller, interestAmount)
        };
        if (expiredAmount > 0) {
            User.cleanUpExpired(user, getNow);
            await Treasury.externalTransfer(caller, expiredAmount)
        };

    };

    /// PUBLIC ////// ACCESSORS ////////////

    public query func getConfig(key : Configs.Key) : async Configs.SharableValue {
        Configs.getConfig(configs, key)
    };
    public query func getConfigs() : async Configs.Sharable {
        Configs.getConfigs(configs)
    };

    public query ({ caller }) func getTop(category : { #PoweredVoters; #AcornBuriers }) : async Pagination.TopNonPagination {
        let result : Pagination.TopResult = Users.getTop(users, category, getNow);
        Pagination.topNonPaginate(result, caller)
    };
    public query ({ caller }) func getTopPagination(category : { #PoweredVoters; #AcornBuriers }, page : Nat, limit : Nat) : async Pagination.TopPagination {
        let result : Pagination.TopResult = Users.getTop(users, category, getNow);
        Pagination.topPaginate(result, page, limit, caller)
    };

    public query func getUser(principal : Principal) : async User.Sharable {
        Users.getUser(users, principal, configs, getNow)
    };
    public query func getBurials(principal : Principal) : async Burials.Sharable {
        let user : User.User = Users.user(users, principal);
        User.getBurials(user, configs, getNow)
    };
    public query func getVotingPower(principal : Principal) : async Nat {
        let user : User.User = Users.user(users, principal);
        User.getVotingPower(user, getNow)
    };
    public query func getBuriedAmount(principal : Principal) : async Nat {
        let user : User.User = Users.user(users, principal);
        User.getBuriedAmount(user)
    };
    public query func getInterestAmount(principal : Principal) : async Nat {
        let user : User.User = Users.user(users, principal);
        User.getInterestAmount(user, configs, getNow)
    };
    public query func getExpiredAmount(principal : Principal) : async Nat {
        let user : User.User = Users.user(users, principal);
        User.getExpiredAmount(user, getNow)
    };
    public query func getClaimableAmount(principal : Principal) : async Nat {
        let user : User.User = Users.user(users, principal);
        User.getInterestAmount(user, configs, getNow) + User.getExpiredAmount(user, getNow)
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public query func expectUserNotFound(principal : Principal) : async () {
        Users.expectNotFound(users, principal)
    }
}
