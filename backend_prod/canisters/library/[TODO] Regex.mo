// http://matt.might.net/articles/implementation-of-regular-expression-matching-in-scheme-with-derivatives/

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private func _seq(r1 : Regex, r2 : Regex) : Regex {
        switch (r1, r2) {
            case (#zero, _) #zero;
            case (_, #zero) #zero;
            case (#empty, _) r2;
            case (_, #empty) r1;
            case _ (#seq(r1, r2))
        }
    };

    private func _alt(r1 : Regex, r2 : Regex) : Regex {
        switch (r1, r2) {
            case (#zero, _) r2;
            case (_, #zero) r1;
            case _ (#alt(r1, r2))
        }
    };

    private func _rep(r : Regex) : Regex {
        switch (r) {
            case (#zero or #empty) #empty;
            case _ #rep(r)
        }
    };

    /// δ(∅) = ∅
    /// δ(ε) = ε
    /// δ(c) = ∅
    /// δ(re1 re2) = δ(re1) δ(re2)
    /// δ(re1 | re2) = δ(re1) | δ(re2)
    /// δ(re*) = ε
    private func _empty(regex : Regex) : Regex {
        switch (regex) {
            case (#zero) #zero;
            case (#empty) #empty;
            case (#char(_)) #zero;
            case (#alt(r1, r2)) _alt(_empty(r1), _empty(r2));
            case (#seq(r1, r2)) _seq(_empty(r1), _empty(r2));
            case (#rep(_)) #empty
        }
    };

    /// Dc(∅) = ∅
    /// Dc(ε) = ∅
    /// Dc(c) = ε
    /// Dc(c') = ∅ if c ≠ c'.
    /// Dc(re1 re2) = δ(re1) Dc(re2) | Dc(re1) re2
    /// Dc(re1 | re2) = Dc(re1) | Dc(re2)
    /// Dc(re*) = Dc(re) re*
    private func _derivative(regex : Regex, char : Char) : Regex {
        switch (regex) {
            case (#zero) #zero;
            case (#empty) #zero;
            case (#char(c)) if (char == c) #empty else #zero;
            case (#seq(r1, r2)) _alt(_seq(_empty(r1), _derivative(r2, char)), _seq(_derivative(r1, char), r2));
            case (#alt(r1, r2)) _alt(_derivative(r1, char), _derivative(r2, char));
            case (#rep(r)) _seq(_derivative(r, char), regex)
        }
    };

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Regex = {
        #zero;
        #empty;
        #char : Char;
        #alt : (Regex, Regex);
        #seq : (Regex, Regex);
        #rep : Regex
    };

    /// LIBRARY ////// REGEX ////////////

    public func match(regex : Regex, text : Text) : Bool {
        let chars = text.chars();
        func go(regex : Regex) : Bool = switch (chars.next()) {
            case (null) _empty(regex) == #empty;
            case (?c) go(_derivative(regex, c))
        };
        go(regex)
    }
}
