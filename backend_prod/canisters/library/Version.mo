import E "../common/Errors";

import Nat8 "mo:base/Nat8";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private let NAT8_MAX : Nat8 = Nat8.maximumValue;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type UpdateLevel = { #Major; #Minor; #Patch };

    /// LIBRARY ////// Version ////////////

    private type Self = Version;

    public type Version = [var Nat8];
    public type Sharable = Text;

    public func new() : Self = [var 0, 0, 0];
    public func make(major : Nat8, minor : Nat8, patch : Nat8) : Self = [var major, minor, patch];

    /// PRIVATE ////// ACCESSORS ////////////

    private func _patchIncrement(__ : Self) {
        switch (__[2] == NAT8_MAX) {
            case (true) {
                switch (__[1] == NAT8_MAX) {
                    case (true) { __[0] += 1; __[1] := 0; __[2] := 0 };
                    case (false) { __[1] += 1; __[2] := 0 }
                }
            };
            case (false) { __[2] += 1 }
        }
    };
    private func _minorIncrement(__ : Self) {
        switch (__[1] == NAT8_MAX) {
            case (true) { __[0] += 1; __[1] := 0; __[2] := 0 };
            case (false) { __[1] += 1; __[2] := 0 }
        }
    };
    private func _majorIncrement(__ : Self) {
        __[0] += 1;
        __[1] := 0;
        __[2] := 0
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func increase(__ : Self, updateLevel : UpdateLevel) {
        switch (updateLevel) {
            case (#Major) _majorIncrement(__);
            case (#Minor) _minorIncrement(__);
            case (#Patch) _patchIncrement(__)
        }
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func increment(__ : Self, updateLevel : UpdateLevel) : Self {
        let clone = make(__[0], __[1], __[2]);
        increase(clone, updateLevel);
        clone
    };
    public func getIncrement(__ : Self, updateLevel : UpdateLevel) : Sharable {
        let clone = make(__[0], __[1], __[2]);
        increase(clone, updateLevel);
        toSharable(clone)
    };

    public func isPreRelease(__ : Self) : Bool = __[0] == 0 and __[1] == 0 and __[2] == 0;

    public func toSharable(__ : Self) : Sharable = Nat8.toText(__[0]) # "." # Nat8.toText(__[1]) # "." # Nat8.toText(__[2]);

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectPreRelease(__ : Self) {
        if (isPreRelease(__)) return;
        E.f(#INTERNAL_FAILURE("Already Initialized"), "Attempted to perform actions that are only available in pre-release")
    }
}
