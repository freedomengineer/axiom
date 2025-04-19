module {
    /// LIBRARY ////// VOTES ////////////

    private type Self<T> = Delegable<T>;

    public type Delegable<T> = {
        #Default : T;
        #Delegated : Principal
    }
}
