module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private func _gcd(a : Nat, b : Nat) : Nat {
        var l = a;
        var r = b;
        while (r != 0) {
            var t = r;
            r := l % r;
            l := t
        };
        l
    };
    private func _reduce(__ : Self) {
        let g = _gcd(__.part, __.whole);
        __.part := __.part / g;
        __.whole := __.whole / g
    };

    /// LIBRARY ////// PROPORTION ////////////

    private type Self = Proportion;

    public type Proportion = { var part : Nat; var whole : Nat };
    public type Sharable = (Nat, Nat);

    public func new() : Self = { var part = 0; var whole = 1 };
    public func make(part : Nat, whole : Nat) : Self = { var part; var whole };

    /// PUBLIC ////// MODIFIERS ////////////

    public func add(__ : Self, x : Self) {
        __.part := __.part * x.whole + x.part * __.whole;
        __.whole := __.whole * x.whole;
        _reduce(__)
    };
    public func mul(__ : Self, x : Self) {
        __.part := __.part * x.part;
        switch (__.part) {
            case (0) __.whole := 1;
            case (_) __.whole := __.whole * x.whole
        };
        _reduce(__)
    };
    public func pow(__ : Self, n : Nat) {
        if (n == 0) {
            __.part := 1;
            __.whole := 1
        } else {
            var base_part = __.part;
            var base_whole = __.whole;
            var exp = n;
            var result_part = 1;
            var result_whole = 1;

            while (exp > 0) {
                if (exp % 2 == 1) {
                    result_part := result_part * base_part;
                    result_whole := result_whole * base_whole
                };
                base_part := base_part * base_part;
                base_whole := base_whole * base_whole;
                exp := exp / 2
            };
            __.part := result_part;
            __.whole := result_whole
        };
        _reduce(__)
    };

    public func invert(__ : Self) {
        let t = __.part;
        __.part := __.whole;
        __.whole := t
    };
    public func complement(__ : Self) {
        __.part := __.whole - __.part
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func getAdd(__ : Self, x : Self) : Self {
        let part = __.part * x.whole + x.part * __.whole;
        let whole = __.whole * x.whole;
        { var part; var whole }
    };
    public func getMul(__ : Self, x : Self) : Self {
        let part = __.part * x.part;
        let whole = switch (part) {
            case (0) 1;
            case (_) __.whole * x.whole
        };
        { var part; var whole }
    };
    public func getPow(__ : Self, n : Nat) : Self {
        var base_part = __.part;
        var base_whole = __.whole;
        var exp = n;
        var result_part = 1;
        var result_whole = 1;

        while (exp > 0) {
            if (exp % 2 == 1) {
                result_part := result_part * base_part;
                result_whole := result_whole * base_whole
            };
            base_part := base_part * base_part;
            base_whole := base_whole * base_whole;
            exp := exp / 2
        };

        { var part = result_part; var whole = result_whole }
    };

    public func getInverse(__ : Self) : Self { { var part = __.whole; var whole = __.part } };
    public func getComplement(__ : Self) : Self {
        { var part = __.whole - __.part; var whole = __.whole }
    };

    public func gt(__ : Self, x : Self) : Bool = __.part * x.whole > x.part * __.whole;
    public func gte(__ : Self, x : Self) : Bool = __.part * x.whole >= x.part * __.whole;
    public func lt(__ : Self, x : Self) : Bool = __.part * x.whole < x.part * __.whole;
    public func lte(__ : Self, x : Self) : Bool = __.part * x.whole <= x.part * __.whole;

    public func toSharable(__ : Self) : Sharable = (__.part, __.whole)
}
