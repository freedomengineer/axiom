import Debug "mo:base/Debug";

module {
    private let NOT_TOBE = func(x : Text) : Text = "The caller must be a " # x # " to perform this action";
    private let NOT_AVAILABLE = func(x : Text) : Text = "The provided " # x # " is not available to perform this action";
    private let NOT_VALID = func(x : Text) : Text = "The provided " # x # " is not in a valid format";
    private let NOT_EXISTED = func(x : Text) : Text = "The provided " # x # " does not exist";
    private let ALREADY_EXISTED = func(x : Text) : Text = "The provided " # x # " has already existed";
    private let NOT_YET = func(x : Text) : Text = "This action cannot be performed as " # x # " has not been completed yet";
    private let ALREADY_OVER = func(x : Text) : Text = "This action cannot be performed as " # x # " has already been completed";
    private let NOT_POSSIBLE = func(x : Text) : Text = "It is not possible to perform this action on " # x;
    private let RESTRICTED = func(x : Text) : Text = "This action requires " # x # " to be turned on";
    private let INTERNAL_FAILURE = func(x : Text) : Text = "The action internally failed due to " # x;
    private let EXTERNAL_FAILURE = func(x : Text) : Text = "The action externally failed when performing " # x;

    public type Throwable = {
        #NOT_TOBE : Text;
        #NOT_AVAILABLE : Text;
        #NOT_VALID : Text;
        #NOT_EXISTED : Text;
        #ALREADY_EXISTED : Text;
        #NOT_YET : Text;
        #ALREADY_OVER : Text;
        #NOT_POSSIBLE : Text;
        #RESTRICTED : Text;
        #INTERNAL_FAILURE : Text;
        #EXTERNAL_FAILURE : Text
    };

    public func f(t : Throwable, d : Text) : None {
        let error : Text = switch (t) {
            case (#NOT_TOBE(x)) NOT_TOBE(x);
            case (#NOT_AVAILABLE(x)) NOT_AVAILABLE(x);
            case (#NOT_VALID(x)) NOT_VALID(x);
            case (#NOT_EXISTED(x)) NOT_EXISTED(x);
            case (#ALREADY_EXISTED(x)) ALREADY_EXISTED(x);
            case (#NOT_YET(x)) NOT_YET(x);
            case (#ALREADY_OVER(x)) ALREADY_OVER(x);
            case (#NOT_POSSIBLE(x)) NOT_POSSIBLE(x);
            case (#RESTRICTED(x)) RESTRICTED(x);
            case (#INTERNAL_FAILURE(x)) INTERNAL_FAILURE(x);
            case (#EXTERNAL_FAILURE(x)) EXTERNAL_FAILURE(x)
        };
        Debug.trap(error # ". Reason: " # d # ".")
    };

    public func unreachable() : None {
        Debug.trap("This code should be unreachable.")
    }
}
