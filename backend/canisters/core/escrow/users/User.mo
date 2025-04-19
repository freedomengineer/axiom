import Burial "../burials/Burial";
import Burials "../burials/Burials";

import E "../../../common/Errors";

import Base "../../../library/Base";
import Configs "../../../library/Configs";
import E8S "../../../library/E8S";

import Time "mo:base/Time";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Time = Time.Time;
    private type Configs = Configs.Configs;

    private type Burials = Burials.Burials;
    private type Burial = Burial.Burial;
    private type SharableBurials = Burials.Sharable;
    private type Option = Burial.Option;

    /// ESCROW ////// USER ////////////

    private type Self = User;

    public type User = {
        var burials : Burials
    };
    public type Sharable = {
        burials : SharableBurials
    };

    public func init(amount : Nat, getNow : () -> Int) : Self = {
        var burials = Burials.init(amount, #Single, getNow)
    };
    public func fromFounder(getNow : () -> Int) : Self = {
        var burials = Burials.init(E8S.fromFloat(10_000_000.0).val, #Perpetual, getNow)
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func bury(__ : Self, amount : Nat, option : Option, getNow : () -> Int) {
        Burials.bury(__.burials, amount, option, getNow)
    };

    public func markAsWithdrawn(__ : Self, getNow : () -> Int) {
        Burials.markAsWithdrawn(__.burials, getNow)
    };
    public func cleanUpExpired(__ : Self, getNow : () -> Int) {
        Burials.cleanUpExpired(__.burials, getNow)
    };

    public func moveOutFounderBurial(__ : Self) : Burial {
        return Burials.moveOutFounderBurial(__.burials)
    };
    public func moveInFounderBurial(__ : Self, burial : Burial) {
        Burials.moveInFounderBurial(__.burials, burial)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func burials(__ : Self) : Burials {
        __.burials
    };
    public func getBurials(__ : Self, configs : Configs, getNow : () -> Int) : Burials.Sharable {
        Burials.toSharable(__.burials, configs, getNow)
    };

    public func getVotingPower(__ : Self, getNow : () -> Int) : Nat {
        Burials.getVotingPower(__.burials, getNow)
    };
    public func getBuriedAmount(__ : Self) : Nat {
        Burials.getBuriedAmount(__.burials)
    };
    public func getInterestAmount(__ : Self, configs : Configs, getNow : () -> Int) : Nat {
        Burials.getInterestAmount(__.burials, configs, getNow)
    };
    public func getExpiredAmount(__ : Self, getNow : () -> Int) : Nat {
        Burials.getExpiredAmount(__.burials, getNow)
    };

    public func getPositiveInterestAmount(__ : Self, configs : Configs, getNow : () -> Int) : Nat {
        let amount : Nat = Burials.getInterestAmount(__.burials, configs, getNow);
        if (amount > 0) return amount;
        E.f(#INTERNAL_FAILURE("Insufficient Balance"), "No claimable interest available to withdraw")
    };
    public func getPositiveExpiredAmount(__ : Self, getNow : () -> Int) : Nat {
        let amount : Nat = Burials.getExpiredAmount(__.burials, getNow);
        if (amount > 0) return amount;
        E.f(#INTERNAL_FAILURE("Insufficient Balance"), "No expired burials available to withdraw")
    };

    public func toSharable(__ : Self, configs : Configs, getNow : () -> Int) : Sharable = {
        burials = Burials.toSharable(__.burials, configs, getNow)
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectPositiveClaimableInterestAmount(__ : Self, configs : Configs, getNow : () -> Int) {
        if (getInterestAmount(__, configs, getNow) > 0) return;
        E.f(#INTERNAL_FAILURE("Insufficient Balance"), "No claimable interest available to withdraw")
    };
    public func expectPositiveExpiredAmount(__ : Self, getNow : () -> Int) {
        if (getExpiredAmount(__, getNow) > 0) return;
        E.f(#INTERNAL_FAILURE("Insufficient Balance"), "No expired burials available to withdraw")
    }
}
