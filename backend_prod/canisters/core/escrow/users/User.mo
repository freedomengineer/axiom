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

    public func init(amount : Nat) : Self = {
        var burials = Burials.init(amount, #Single)
    };
    public func fromFounder() : Self = {
        var burials = Burials.init(E8S.fromFloat(10_000_000.0).val, #Perpetual)
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func bury(__ : Self, amount : Nat, option : Option) {
        Burials.bury(__.burials, amount, option)
    };

    public func markAsWithdrawn(__ : Self) {
        Burials.markAsWithdrawn(__.burials)
    };
    public func cleanUpExpired(__ : Self) {
        Burials.cleanUpExpired(__.burials)
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
    public func getBurials(__ : Self, configs : Configs) : Burials.Sharable {
        Burials.toSharable(__.burials, configs)
    };

    public func getVotingPower(__ : Self) : Nat {
        Burials.getVotingPower(__.burials)
    };
    public func getBuriedAmount(__ : Self) : Nat {
        Burials.getBuriedAmount(__.burials)
    };
    public func getInterestAmount(__ : Self, configs : Configs) : Nat {
        Burials.getInterestAmount(__.burials, configs)
    };
    public func getExpiredAmount(__ : Self) : Nat {
        Burials.getExpiredAmount(__.burials)
    };

    public func getPositiveInterestAmount(__ : Self, configs : Configs) : Nat {
        let amount : Nat = Burials.getInterestAmount(__.burials, configs);
        if (amount > 0) return amount;
        E.f(#INTERNAL_FAILURE("Insufficient Balance"), "No claimable interest available to withdraw")
    };
    public func getPositiveExpiredAmount(__ : Self) : Nat {
        let amount : Nat = Burials.getExpiredAmount(__.burials);
        if (amount > 0) return amount;
        E.f(#INTERNAL_FAILURE("Insufficient Balance"), "No expired burials available to withdraw")
    };

    public func toSharable(__ : Self, configs : Configs) : Sharable = {
        burials = Burials.toSharable(__.burials, configs)
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectPositiveClaimableInterestAmount(__ : Self, configs : Configs) {
        if (getInterestAmount(__, configs) > 0) return;
        E.f(#INTERNAL_FAILURE("Insufficient Balance"), "No claimable interest available to withdraw")
    };
    public func expectPositiveExpiredAmount(__ : Self) {
        if (getExpiredAmount(__) > 0) return;
        E.f(#INTERNAL_FAILURE("Insufficient Balance"), "No expired burials available to withdraw")
    }
}
