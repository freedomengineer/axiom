import XRC "canister:xrc";

import IndicatorInterface "../../periphery/indicator/Interface";

import E "../../common/Errors";

import Cycles "mo:base/ExperimentalCycles";
import Nat64 "mo:base/Nat64";
import Nat32 "mo:base/Nat32";
import Principal "mo:base/Principal";

shared ({ caller = indicator }) persistent actor class ICPUSD() = this {
    private stable let Indicator : IndicatorInterface.Indicator = actor (Principal.toText(indicator));

    public shared ({ caller }) func exchange(icpToUsd : Bool, amount : Nat) : async Nat {
        await Indicator.expectAuthorized(caller, [#Facade, #Affiliate]);

        let request : XRC.GetExchangeRateRequest = {
            base_asset = switch (icpToUsd) {
                case (true)({ symbol = "ICP"; class_ = #Cryptocurrency });
                case (false)({ symbol = "USD"; class_ = #FiatCurrency })
            };
            quote_asset = switch (icpToUsd) {
                case (true)({ symbol = "USD"; class_ = #FiatCurrency });
                case (false)({ symbol = "ICP"; class_ = #Cryptocurrency })
            };
            timestamp = null; // Get the current rate.
        };
        Cycles.add<system>(100_000_000_000); // Every XRC request costs 1B cycles.
        let result = await XRC.get_exchange_rate(request);
        switch (result) {
            case (#Err(e)) E.f(#EXTERNAL_FAILURE("ICP/USD Exchange Rate"), debug_show e);
            case (#Ok({ rate; metadata = { decimals } })) Nat64.toNat(rate) * amount / (10 ** Nat32.toNat(decimals))
        }
    }
}
