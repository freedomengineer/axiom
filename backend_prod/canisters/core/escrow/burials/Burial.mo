import E "../../../common/Errors";

import Configs "../../../library/Configs";
import Date "../../../library/Date";
import E8S "../../../library/E8S";
import Proportion "../../../library/Proportion";

import Time "mo:base/Time";
import Int "mo:base/Int";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Time = Time.Time;

    private type Configs = Configs.Configs;
    private type Date = Date.Date;
    private type E8S = E8S.E8S;
    private type Proportion = Proportion.Proportion;
    private type SharableE8S = E8S.Sharable;

    public func optionToCoefficient(option : Option) : Nat = switch (option) {
        case (#Single) 1;
        case (#Double) 2;
        case (#Quadruple) 4;
        case (#Octuple) 8;
        case (#Perpetual) 8
    };

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Option = {
        #Single;
        #Double;
        #Quadruple;
        #Octuple;
        #Perpetual
    };
    public type Detail = {
        coefficient : Nat;
        issueDate : Time;
        expiryDate : Time;
        var lastWithdrawDate : Time
    };

    /// ESCROW ////// BURIALS ////////////

    private type Self = Burial;

    public type Burial = {
        amount : E8S;
        detail : Detail
    };
    public type Sharable = {
        amount : SharableE8S;
        coefficient : Nat;
        issueDate : Time;
        expiryDate : Time;
        claimableInterest : SharableE8S
    };

    public func init(amount : Nat, option : Option) : Self {
        let now : Date = Date.new();
        let coefficient : Nat = optionToCoefficient(option);
        let detail : Detail = switch (option) {
            case (#Single)({
                coefficient;
                issueDate = now;
                expiryDate = Date.getNextDays(now, 89);
                var lastWithdrawDate = now
            });
            case (#Perpetual)({
                coefficient;
                issueDate = now;
                expiryDate = Date.getNextYears(now, 16);
                var lastWithdrawDate = now
            });
            case (_)({
                coefficient;
                issueDate = now;
                expiryDate = Date.getNextYears(now, coefficient);
                var lastWithdrawDate = now
            })
        };
        { amount = E8S.make(amount); detail }
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func markAsWithdrawn(__ : Self) {
        __.detail.lastWithdrawDate := Date.new()
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func isExpired(__ : Self) : Bool = Time.now() > __.detail.expiryDate;

    public func isFounderBurial(__ : Self) : Bool = __.detail.coefficient == 8 and __.amount.val == 10_000_000_00_000_000;

    public func getInterestAmount(__ : Self, configs : Configs) : Nat {
        let DAILY_INTEREST_PROPORTION : Proportion = Configs.Proportion(configs, "BURIAL_" # debug_show (__.detail.coefficient) # "X_DAILY_INTEREST_PROPORTION");
        let daysElapsed : Nat = Date.getMidnightsElapsed(__.detail.lastWithdrawDate, Int.min(Time.now(), __.detail.expiryDate));
        E8S.getScaleBy(__.amount, Proportion.getMul(DAILY_INTEREST_PROPORTION, Proportion.make(daysElapsed, 1))).val
    };

    public func toSharable(__ : Self, configs : Configs) : Sharable = {
        amount = E8S.toSharable(__.amount);
        coefficient = __.detail.coefficient;
        issueDate = __.detail.issueDate;
        expiryDate = __.detail.expiryDate;
        claimableInterest = getInterestAmount(__, configs)
    }
}
