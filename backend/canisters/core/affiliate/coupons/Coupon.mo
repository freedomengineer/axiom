import Actor "../../../periphery/indicator/actors/Actor";

import E "../../../common/Errors";

import Array "../../../library/Array";
import Date "../../../library/Date";
import Hexadecimal "../../../library/Hexadecimal";
import Map "../../../library/Map";

import Time "mo:base/Time";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Time = Time.Time;
    private type Map<K, V> = Map.Map<K, V>;

    private type ActorVariant = Actor.Variant;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Status = {
        #Available;
        #Locked : { by : Principal; timestamp : Time };
        #Redeemed : { by : Principal; timestamp : Time };
        #Failed : { by : Principal; reason : Text; timestamp : Time }
    };
    public type StatusVariant = {
        #Available;
        #Locked;
        #Redeemed;
        #Failed
    };

    public func getIcpPaid(splitAmounts : [(ActorVariant, Nat)]) : Nat = switch (Array.find<(ActorVariant, Nat)>(splitAmounts, func(x) = x.0 == #Affiliate)) {
        case (?(_, icpPaid)) icpPaid;
        case (null) E.f(#NOT_VALID("Coupon"), "Attempted to get the ICP paid for a coupon that does not have an affiliate split")
    };

    /// SALES ////// COUPON ////////////

    private type Self = Coupon;

    public type Coupon = {
        creator : Principal;
        creationDate : Time;
        capitalRaised : Nat;
        icpPaid : Nat;
        code : [Nat8];
        var status : Status
    };
    public type Sharable = {
        key : Text;
        creator : Principal;
        creationDate : Time;
        capitalRaised : Nat;
        icpPaid : Nat;
        status : Status
    };
    public type PrivateSharable = {
        key : Text;
        creator : Principal;
        creationDate : Time;
        capitalRaised : Nat;
        icpPaid : Nat;
        status : Status;
        code : [Nat8]
    };

    public func init(creator : Principal, capitalRaised : Nat, icpPaid : Nat, code : [Nat8], getNow : () -> Int) : Self = {
        creator;
        creationDate = getNow();
        capitalRaised;
        icpPaid;
        code;
        var status = #Available
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func locked(__ : Self, by : Principal, getNow : () -> Int) {
        switch (__.status) {
            case (#Available) __.status := #Locked({ by; timestamp = getNow() });
            case (#Failed({ by = failedBy })) switch (failedBy == by) {
                case (true) __.status := #Locked({ by; timestamp = getNow() });
                case (false) E.f(#NOT_VALID("Coupon"), "Attempted to lock a coupon that is not failed by another user")
            };
            case (_) E.f(#NOT_VALID("Coupon"), "Attempted to lock a coupon that is not available")
        }
    };
    public func redeemed(__ : Self, by : Principal, getNow : () -> Int) {
        switch (__.status) {
            case (#Locked({ by = lockedBy })) switch (lockedBy == by) {
                case (true) __.status := #Redeemed({ by; timestamp = getNow() });
                case (false) E.f(#NOT_VALID("Coupon"), "Attempted to redeem a coupon that is not locked by another user")
            };
            case (#Failed({ by = failedBy })) switch (failedBy == by) {
                case (true) __.status := #Redeemed({ by; timestamp = getNow() });
                case (false) E.f(#NOT_VALID("Coupon"), "Attempted to redeem a coupon that is not failed by another user")
            };
            case (_) E.f(#NOT_VALID("Coupon"), "Attempted to redeem a coupon that is not locked")
        }
    };
    public func failed(__ : Self, by : Principal, reason : Text, getNow : () -> Int) {
        switch (__.status) {
            case (#Locked({ by = lockedBy })) switch (lockedBy == by) {
                case (true) __.status := #Failed({ by; reason; timestamp = getNow() });
                case (false) E.f(#NOT_VALID("Coupon"), "Attempted to fail a coupon that is not locked by another user")
            };
            case (_) E.f(#NOT_VALID("Coupon"), "Attempted to fail a coupon that is not locked")
        }
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func variant(__ : Self) : StatusVariant = switch (__.status) {
        case (#Available) #Available;
        case (#Locked(_)) #Locked;
        case (#Redeemed(_)) #Redeemed;
        case (#Failed(_)) #Failed
    };

    public func toSharable(__ : Self, key : Text) : Sharable = {
        __ with
        key;
        status = __.status
    };
    public func toPrivateSharable(__ : Self, key : Text) : PrivateSharable = {
        __ with
        key;
        status = __.status;
        code = __.code
    }
}
