import IndicatorInterface "../../periphery/indicator/Interface";
import IndicatorInterfaceOld "../../periphery/indicator/InterfaceOld";

import C "../../common/Constants";

import Configs "../../library/Configs";
import Iter "../../library/Iter";

import Principal "mo:base/Principal";
import Time "mo:base/Time";

(
    with migration = func(
        old : {
            var Indicator : IndicatorInterfaceOld.Indicator
        }
    ) : {
    } { {} }
) shared ({ caller = indicator }) persistent actor class Assets() = this {
        private transient let Indicator : IndicatorInterface.Indicator = actor (Principal.toText(indicator));

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
