import Burial "Burial";

import E "../../../common/Errors";

import Configs "../../../library/Configs";
import List "../../../library/List";

import Time "mo:base/Time";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Time = Time.Time;
    private type Configs = Configs.Configs;
    private type List<T> = List.List<T>;

    private type Burial = Burial.Burial;
    private type Option = Burial.Option;
    private type SharableBurial = Burial.Sharable;

    /// ESCROW ////// BURIALS ////////////

    private type Self = Burials;

    public type Burials = {
        var burials : List<Burial>
    };
    public type Sharable = [SharableBurial];

    public func init(amount : Nat, option : Option) : Self = {
        var burials = List.make<Burial>(Burial.init(amount, option))
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func bury(__ : Self, amount : Nat, option : Option) {
        let burial : Burial = Burial.init(amount, option);
        __.burials := List.push(burial, __.burials)
    };
    public func cleanUpExpired(__ : Self) {
        __.burials := List.filter<Burial>(__.burials, func(burial) = not Burial.isExpired(burial))
    };
    public func markAsWithdrawn(__ : Self) {
        List.iterate<Burial>(__.burials, func(burial) = Burial.markAsWithdrawn(burial))
    };

    public func moveOutFounderBurial(__ : Self) : Burial {
        var founderBurial : ?Burial = null;
        let newBurials = List.filter<Burial>(
            __.burials,
            func(burial) = switch (Burial.isFounderBurial(burial)) {
                case (true) {
                    founderBurial := ?burial;
                    false
                };
                case (false) true
            },
        );
        switch (founderBurial) {
            case (?burial) {
                __.burials := newBurials;
                burial
            };
            case (null) E.f(#NOT_EXISTED("Founder burial"), "Founder burial does not exist")
        }
    };
    public func moveInFounderBurial(__ : Self, burial : Burial) {
        __.burials := List.push(burial, __.burials)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func getVotingPower(__ : Self) : Nat {
        let accumulate = func(acc : Nat, burial : Burial) : Nat = switch (Burial.isExpired(burial)) {
            case (true) acc;
            case (false) acc + burial.amount.val * burial.detail.coefficient
        };
        switch (List.foldLeft(__.burials, 0, accumulate)) {
            case (0) 1;
            case (votingPower) votingPower
        }
    };
    public func getBuriedAmount(__ : Self) : Nat {
        let accumulate = func(acc : Nat, burial : Burial) : Nat = acc + burial.amount.val;
        List.foldLeft(__.burials, 0, accumulate)
    };
    public func getExpiredAmount(__ : Self) : Nat {
        let accumulate = func(acc : Nat, burial : Burial) : Nat = switch (Burial.isExpired(burial)) {
            case (true) acc + burial.amount.val;
            case (false) acc
        };
        List.foldLeft(__.burials, 0, accumulate)
    };
    public func getInterestAmount(__ : Self, config : Configs) : Nat {
        let accumulate = func(acc : Nat, burial : Burial) : Nat = acc + Burial.getInterestAmount(burial, config);
        List.foldLeft(__.burials, 0, accumulate)
    };

    public func toSharable(__ : Self, config : Configs) : Sharable {
        List.toArrayMap<Burial, SharableBurial>(__.burials, func(burial) = Burial.toSharable(burial, config))
    }
}
