module {
    /// PUBLIC ////// DECLARATIONS ////////////

    public type Variant<T> = { #a : T; #b : T };
    public type Sharable<T> = { a : T; b : T };

    /// LIBRARY ////// DOUBLE ////////////

    private type Self<T> = Double<T>;

    public type Double<T> = { var a : T; var b : T }
}
