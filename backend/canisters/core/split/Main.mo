import Distribution "distributions/Distribution";
import Distributions "distributions/Distributions";
import Actor "../../periphery/indicator/actors/Actor";

import ICP "canister:icp_ledger";

import IndicatorInterface "../../periphery/indicator/Interface";

import C "../../common/Constants";
import E "../../common/Errors";

import Configs "../../library/Configs";
import E8S "../../library/E8S";
import Earning "../../library/Earning";
import Iter "../../library/Iter";
import Proportion "../../library/Proportion";

import Principal "mo:base/Principal";
import Time "mo:base/Time";

shared ({ caller = indicator }) actor class Split() = this {
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

    private stable let distributions : Distributions.Distributions = Distributions.init(getNow);

    private stable let configs : Configs.Configs = Configs.make([
        ("FOUNDER_PROPORTION", #Proportion(Proportion.make(10, 100))),
        ("DAO_PROPORTION", #Proportion(Proportion.make(40, 100))),
        ("AFFILIATE_PROPORTION", #Proportion(Proportion.make(50, 100))),
    ]);

    /// PROTECTED ////// MODIFIERS ////////////

    public shared ({ caller }) func setConfigs(entries : [(Configs.Key, Configs.SharableValue)]) : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        Configs.setBatch(configs, entries)
    };
    public shared ({ caller }) func putConfigs(entries : [(Configs.Key, Configs.SharableValue)]) : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        Configs.putBatch(configs, entries)
    };

    public shared ({ caller }) func deposit(sender : Principal, amount : Nat) : async () {
        await Indicator.expectAuthorized(caller, [#Facade]);

        let transferResult : ICP.TransferFromResult = await ICP.icrc2_transfer_from({
            amount = amount - C.ICP_FEE;
            from = { owner = sender; subaccount = null };
            to = { owner = Principal.fromActor(this); subaccount = null };
            created_at_time = null;
            fee = null;
            memo = null;
            spender_subaccount = null
        });
        switch (transferResult) {
            case (#Err(e)) E.f(#EXTERNAL_FAILURE("ICP Transfer"), debug_show e);
            case (#Ok(_)) {}
        };

        let depositAmount : E8S.E8S = E8S.make(amount);
        Distributions.deposit(distributions, depositAmount, configs)
    };
    public shared ({ caller }) func affiliateDeposit(sender : Principal, amount : Nat) : async () {
        await Indicator.expectAuthorized(caller, [#Affiliate]);

        let transferResult : ICP.TransferFromResult = await ICP.icrc2_transfer_from({
            amount;
            from = { owner = sender; subaccount = null };
            to = { owner = Principal.fromActor(this); subaccount = null };
            created_at_time = null;
            fee = null;
            memo = null;
            spender_subaccount = null
        });
        switch (transferResult) {
            case (#Err(e)) E.f(#EXTERNAL_FAILURE("ICP Transfer"), debug_show e);
            case (#Ok(_)) {}
        }
    };

    public shared ({ caller }) func affiliateTransfer(recipient : Principal, amount : Nat) : async () {
        await Indicator.expectAuthorized(caller, [#Affiliate]);

        if (amount <= C.ICP_FEE) E.f(#INTERNAL_FAILURE("Insufficient Amount"), "Attempted to withdraw " # debug_show amount # " which is less than the ICP fee " # debug_show C.ICP_FEE);

        let transferResult : ICP.TransferFromResult = await ICP.icrc1_transfer({
            amount = amount - C.ICP_FEE;
            to = { owner = recipient; subaccount = null };
            from_subaccount = null;
            created_at_time = null;
            fee = null;
            memo = null
        });
        switch (transferResult) {
            case (#Err(e)) E.f(#EXTERNAL_FAILURE("ICP Transfer"), debug_show e);
            case (#Ok(_)) {}
        }
    };
    public shared ({ caller }) func affiliateSplit(splitAmounts : [(Actor.Variant, Nat)]) : async () {
        await Indicator.expectAuthorized(caller, [#Affiliate]);

        Distributions.affiliateDeposit(distributions, splitAmounts)
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public shared ({ caller }) func internalTransfer(recipientVariant : Actor.Variant, amount : Nat) : async () {
        let senderVariant : Actor.Variant = await Indicator.getVariant(caller);
        let senderDistribution : Distribution.Distribution = Distributions.distribution(distributions, senderVariant);
        let recipientDistribution : Distribution.Distribution = Distributions.distribution(distributions, recipientVariant);
        let transferAmount : E8S.E8S = E8S.make(amount);

        Earning.expectEnoughBalance(senderDistribution.earning, transferAmount);

        Distribution.withdraw(senderDistribution, transferAmount, getNow);
        Distribution.deposit(recipientDistribution, transferAmount)
    };
    public shared ({ caller }) func externalTransfer(recipient : Principal, amount : Nat) : async () {
        let senderVariant : Actor.Variant = await Indicator.getVariant(caller);
        let senderDistribution : Distribution.Distribution = Distributions.distribution(distributions, senderVariant);
        let withdrawAmount : E8S.E8S = E8S.make(amount);

        Earning.expectEnoughBalance(senderDistribution.earning, withdrawAmount);
        if (amount <= C.ICP_FEE) E.f(#INTERNAL_FAILURE("Insufficient Amount"), "Attempted to withdraw " # debug_show amount # " which is less than the ICP fee " # debug_show C.ICP_FEE);

        let transferResult : ICP.TransferFromResult = await ICP.icrc1_transfer({
            amount = amount - C.ICP_FEE;
            to = { owner = recipient; subaccount = null };
            from_subaccount = null;
            created_at_time = null;
            fee = null;
            memo = null
        });
        switch (transferResult) {
            case (#Err(e)) E.f(#EXTERNAL_FAILURE("ICP Transfer"), debug_show e);
            case (#Ok(_)) Distribution.withdraw(senderDistribution, withdrawAmount, getNow)
        }
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public query func getConfig(key : Configs.Key) : async Configs.SharableValue {
        Configs.getConfig(configs, key)
    };
    public query func getConfigs() : async Configs.Sharable {
        Configs.getConfigs(configs)
    };

    public query func getDistribution(actorVariant : Actor.Variant) : async Distribution.Sharable {
        Distributions.getDistribution(distributions, actorVariant, configs)
    };
    public query func getDistributions() : async Distributions.Sharable {
        Distributions.getDistributions(distributions, configs)
    };

    public query func getEarning(actorVariant : Actor.Variant) : async Earning.Sharable {
        let distribution : Distribution.Distribution = Distributions.distribution(distributions, actorVariant);
        Distribution.getEarning(distribution)
    };
    public query func getBalance(actorVariant : Actor.Variant) : async E8S.Sharable {
        let distribution : Distribution.Distribution = Distributions.distribution(distributions, actorVariant);
        Distribution.getBalance(distribution)
    };

    public query func getTotalRevenue() : async E8S.Sharable {
        Distributions.getTotalRevenue(distributions)
    };
    public query func getTotalBalance() : async E8S.Sharable {
        Distributions.getTotalBalance(distributions)
    }
}
