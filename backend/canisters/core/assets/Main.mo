import IndicatorInterface "../../periphery/indicator/Interface";

import C "../../common/Constants";

import Configs "../../library/Configs";
import Iter "../../library/Iter";

import Principal "mo:base/Principal";
import Time "mo:base/Time";

shared ({ caller = indicator }) persistent actor class Assets() = this {
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

    private stable let configs : Configs.Configs = Configs.make([]);

    /// PROTECTED ////// MODIFIERS ////////////

    public shared ({ caller }) func setConfigs(entries : [(Configs.Key, Configs.SharableValue)]) : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        Configs.setBatch(configs, entries)
    };
    public shared ({ caller }) func putConfigs(entries : [(Configs.Key, Configs.SharableValue)]) : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        Configs.putBatch(configs, entries)
    };

    /// PUBLIC ////// MODIFIERS ////////////

    /// PUBLIC ////// ACCESSORS ////////////

    public query func getConfig(key : Configs.Key) : async Configs.SharableValue {
        Configs.getConfig(configs, key)
    };
    public query func getConfigs() : async Configs.Sharable {
        Configs.getConfigs(configs)
    }
}
