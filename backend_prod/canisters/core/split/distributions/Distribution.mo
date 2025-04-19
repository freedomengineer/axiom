import Actor "../../../periphery/indicator/actors/Actor";

import E8S "../../../library/E8S";
import Earning "../../../library/Earning";
import Proportion "../../../library/Proportion";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Earning = Earning.Earning;
    private type SharableEarning = Earning.Sharable;
    private type E8S = E8S.E8S;
    private type SharableE8S = E8S.Sharable;
    private type Proportion = Proportion.Proportion;
    private type SharableProportion = Proportion.Sharable;

    private type ActorVariant = Actor.Variant;

    /// SPLIT ////// DISTRIBUTIONS ////////////

    public type Self = Distribution;

    public type Distribution = {
        earning : Earning
    };
    public type Sharable = {
        actorVariant : ActorVariant;
        earning : SharableEarning;
        proportion : SharableProportion
    };

    public func init() : Self = {
        earning = Earning.new()
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func withdraw(__ : Self, withdrawAmount : E8S) {
        Earning.withdraw(__.earning, withdrawAmount)
    };
    public func deposit(__ : Self, depositAmount : E8S) {
        Earning.deposit(__.earning, depositAmount)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func getEarning(__ : Self) : SharableEarning = Earning.toSharable(__.earning);

    public func balance(__ : Self) : E8S = Earning.balance(__.earning);
    public func getBalance(__ : Self) : SharableE8S = E8S.toSharable(balance(__));
    public func revenue(__ : Self) : E8S = Earning.revenue(__.earning);
    public func getRevenue(__ : Self) : SharableE8S = E8S.toSharable(revenue(__));

    public func toSharable(__ : Self, actorVariant : ActorVariant, proportion : Proportion) : Sharable = {
        actorVariant;
        proportion = Proportion.toSharable(proportion);
        earning = Earning.toSharable(__.earning)
    }
}
