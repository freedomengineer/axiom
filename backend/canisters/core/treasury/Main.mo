import Allocation "allocations/Allocation";
import Allocations "allocations/Allocations";
import Actor "../../periphery/indicator/actors/Actor";

import ACORNTypes "../acorn/Types";

import ACORNInterface "../acorn/Interface";
import IndicatorInterface "../../periphery/indicator/Interface";
import IndicatorInterfaceOld "../../periphery/indicator/InterfaceOld";

import E "../../common/Errors";

import Configs "../../library/Configs";
import E8S "../../library/E8S";

import Principal "mo:base/Principal";

(
    with migration = func(
        old : {
            var Indicator : IndicatorInterfaceOld.Indicator
        }
    ) : {
    } { {} }
) shared ({ caller = indicator }) persistent actor class Treasury() = this {
    private transient let Indicator : IndicatorInterface.Indicator = actor (Principal.toText(indicator));

    private stable let totalSupply : E8S.E8S = E8S.fromFloat(450_000_000.0);
    private stable let allocations : Allocations.Allocations = Allocations.init();

    private stable let configs : Configs.Configs = Configs.make([]);

    /// PUBLIC ////// MODIFIERS ////////////

    public shared ({ caller }) func setConfigs(entries : [(Configs.Key, Configs.SharableValue)]) : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        Configs.setBatch(configs, entries)
    };
    public shared ({ caller }) func putConfigs(entries : [(Configs.Key, Configs.SharableValue)]) : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        Configs.putBatch(configs, entries)
    };

    public shared ({ caller }) func internalMint(recipient : Actor.Variant, amount : Nat) : async () {
        let minterVariant : Actor.Variant = await Indicator.getVariant(caller);
        let minterAllocation : Allocation.Allocation = Allocations.allocation(allocations, minterVariant);
        let recipientAllocation : Allocation.Allocation = Allocations.allocation(allocations, recipient);
        let mintAmount : E8S.E8S = E8S.make(amount);

        Allocation.expectAllocatedGreaterEqual(minterAllocation, mintAmount);

        Allocation.mint(minterAllocation, mintAmount);
        Allocation.deposit(recipientAllocation, mintAmount)
    };
    public shared ({ caller }) func internalTransfer(recipient : Actor.Variant, amount : Nat) : async () {
        let senderVariant : Actor.Variant = await Indicator.getVariant(caller);
        let senderAllocation : Allocation.Allocation = Allocations.allocation(allocations, senderVariant);
        let recipientAllocation : Allocation.Allocation = Allocations.allocation(allocations, recipient);
        let transferAmount : E8S.E8S = E8S.make(amount);

        Allocation.expectBalanceGreaterEqual(senderAllocation, transferAmount);

        Allocation.withdraw(senderAllocation, transferAmount);
        Allocation.deposit(recipientAllocation, transferAmount)
    };

    public shared ({ caller }) func externalMint(recipient : Principal, amount : Nat) : async () {
        let minterVariant : Actor.Variant = await Indicator.getVariant(caller);
        let minterAllocation : Allocation.Allocation = Allocations.allocation(allocations, minterVariant);
        let mintAmount : E8S.E8S = E8S.make(amount);

        Allocation.expectAllocatedGreaterEqual(minterAllocation, mintAmount);

        let ACORN : ACORNInterface.ACORN = await Indicator.ACORN();
        let transferResult : ACORNTypes.TransferFromResult = await ACORN.icrc1_transfer({
            amount;
            to = { owner = recipient; subaccount = null };
            from_subaccount = null;
            created_at_time = null;
            fee = null;
            memo = null
        });
        switch (transferResult) {
            case (#Err(e)) E.f(#EXTERNAL_FAILURE("ACORN Transfer"), debug_show e);
            case (#Ok(_)) Allocation.mint(minterAllocation, mintAmount)
        }
    };
    public shared ({ caller }) func externalTransfer(recipient : Principal, amount : Nat) : async () {
        let senderVariant : Actor.Variant = await Indicator.getVariant(caller);
        let senderAllocation : Allocation.Allocation = Allocations.allocation(allocations, senderVariant);
        let transferAmount : E8S.E8S = E8S.make(amount);

        Allocation.expectBalanceGreaterEqual(senderAllocation, transferAmount);

        let ACORN : ACORNInterface.ACORN = await Indicator.ACORN();
        let transferResult : ACORNTypes.TransferFromResult = await ACORN.icrc1_transfer({
            amount;
            to = { owner = recipient; subaccount = null };
            from_subaccount = null;
            created_at_time = null;
            fee = null;
            memo = null
        });
        switch (transferResult) {
            case (#Err(e)) E.f(#EXTERNAL_FAILURE("ACORN Transfer"), debug_show e);
            case (#Ok(_)) Allocation.withdraw(senderAllocation, transferAmount)
        }
    };
    public shared ({ caller }) func delegatedExternalTransfer(sender : Actor.Variant, recipient : Principal, amount : Nat) : async () {
        let delegatingVariant : Actor.Variant = await Indicator.getVariant(caller);
        let senderAllocation : Allocation.Allocation = Allocations.allocation(allocations, sender);
        let transferAmount : E8S.E8S = E8S.make(amount);

        Allocations.expectFound(allocations, delegatingVariant);
        Allocation.expectBalanceGreaterEqual(senderAllocation, transferAmount);

        let ACORN : ACORNInterface.ACORN = await Indicator.ACORN();
        let transferResult : ACORNTypes.TransferFromResult = await ACORN.icrc1_transfer({
            amount;
            to = { owner = recipient; subaccount = null };
            from_subaccount = null;
            created_at_time = null;
            fee = null;
            memo = null
        });
        switch (transferResult) {
            case (#Err(e)) E.f(#EXTERNAL_FAILURE("ACORN Transfer"), debug_show e);
            case (#Ok(_)) Allocation.withdraw(senderAllocation, transferAmount)
        }
    };

    public shared ({ caller }) func claim(sender : Principal, amount : Nat) : async () {
        let recipientVariant : Actor.Variant = await Indicator.getVariant(caller);
        let recipientAllocation : Allocation.Allocation = Allocations.allocation(allocations, recipientVariant);
        let claimAmount : E8S.E8S = E8S.make(amount);

        let ACORN : ACORNInterface.ACORN = await Indicator.ACORN();
        let transferResult : ACORNTypes.TransferFromResult = await ACORN.icrc2_transfer_from({
            amount;
            from = { owner = sender; subaccount = null };
            to = { owner = Principal.fromActor(this); subaccount = null };
            spender_subaccount = null;
            created_at_time = null;
            fee = null;
            memo = null
        });
        switch (transferResult) {
            case (#Err(e)) E.f(#EXTERNAL_FAILURE("ACORN Transfer"), debug_show e);
            case (#Ok(_)) Allocation.deposit(recipientAllocation, claimAmount)
        }
    };
    public shared ({ caller }) func delegatedClaim(recipient : Actor.Variant, sender : Principal, amount : Nat) : async () {
        let delegatingVariant : Actor.Variant = await Indicator.getVariant(caller);
        let recipientAllocation : Allocation.Allocation = Allocations.allocation(allocations, recipient);
        let claimAmount : E8S.E8S = E8S.make(amount);

        Allocations.expectFound(allocations, delegatingVariant);

        let ACORN : ACORNInterface.ACORN = await Indicator.ACORN();
        let transferResult : ACORNTypes.TransferFromResult = await ACORN.icrc2_transfer_from({
            amount;
            from = { owner = sender; subaccount = null };
            to = { owner = Principal.fromActor(this); subaccount = null };
            spender_subaccount = null;
            created_at_time = null;
            fee = null;
            memo = null
        });
        switch (transferResult) {
            case (#Err(e)) E.f(#EXTERNAL_FAILURE("ACORN Transfer"), debug_show e);
            case (#Ok(_)) Allocation.deposit(recipientAllocation, claimAmount)
        }
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public query func getConfig(key : Configs.Key) : async Configs.SharableValue {
        Configs.getConfig(configs, key)
    };
    public query func getConfigs() : async Configs.Sharable {
        Configs.getConfigs(configs)
    };

    public query func getAllocation(actorVariant : Actor.Variant) : async Allocation.Sharable {
        Allocations.getAllocation(allocations, actorVariant)
    };
    public query func getAllocations() : async Allocations.Sharable {
        Allocations.getAllocations(allocations)
    };

    public query func getBalance(actorVariant : Actor.Variant) : async E8S.Sharable {
        let allocation : Allocation.Allocation = Allocations.allocation(allocations, actorVariant);
        Allocation.getBalance(allocation)
    };
    public query func getAllocated(actorVariant : Actor.Variant) : async E8S.Sharable {
        let allocation : Allocation.Allocation = Allocations.allocation(allocations, actorVariant);
        Allocation.getAllocated(allocation)
    };

    public query func getTotalSupply() : async E8S.Sharable {
        E8S.toSharable(totalSupply)
    };
    public query func getReserveSupply() : async E8S.Sharable {
        Allocations.getTotalReserve(allocations)
    };
    public query func getCirculatingSupply() : async E8S.Sharable {
        let reserve : E8S.E8S = Allocations.totalReserve(allocations);
        let circulating : E8S.E8S = E8S.getSub(totalSupply, reserve);
        E8S.toSharable(circulating)
    }
}
