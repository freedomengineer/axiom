import Installation "../../../periphery/indicator/installations/Installation";

import E "../../../common/Errors";

import Map "../../../library/Map";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Map<K, V> = Map.Map<K, V>;

    private type ActorsConfigs = Installation.ActorsConfigs;
    private type SharableInstallation = Installation.Sharable;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Variant = {
        #Code;
        #Field;
        #Worker;
        #Configs
    };

    public type Code = {
        actorsConfigs : ActorsConfigs;
        installation : SharableInstallation
    };
    public type SharableCode = {
        actorsConfigs : ActorsConfigs;
        installation : SharableInstallation
    };
    public type Field = {
        name : Text;
        description : Text
    };
    public type SharableField = {
        name : Text;
        description : Text
    };
    public type Worker = {};
    public type SharableWorker = {};
    public type Configs = {
        actorsConfigs : ActorsConfigs
    };
    public type SharableConfigs = {
        actorsConfigs : ActorsConfigs
    };

    /// DAO ////// DETACHMENT ////////////

    private type Self = Detachment;

    public type Detachment = {
        #Code : Code;
        #Field : Field;
        #Worker : Worker;
        #Configs : Configs
    };
    public type Sharable = {
        #Code : SharableCode;
        #Field : SharableField;
        #Worker : SharableWorker;
        #Configs : SharableConfigs
    };

    public func initCode(actorsConfigs : ActorsConfigs, installation : SharableInstallation) : Self = #Code({
        actorsConfigs;
        installation
    });
    public func initField(name : Text, description : Text) : Self = #Field({
        name;
        description
    });
    public func initWorker() : Self = #Worker({});
    public func initConfigs(actorsConfigs : ActorsConfigs) : Self = #Configs({
        actorsConfigs
    });

    /// PUBLIC ////// ACCESSORS ////////////

    public func code(__ : Self) : Code {
        switch (__) {
            case (#Code(detachment)) detachment;
            case (_) E.f(#NOT_POSSIBLE("Code Update Detachment Derivation"), "The proposal is not a Code Update Proposal")
        }
    };
    public func field(__ : Self) : Field {
        switch (__) {
            case (#Field(detachment)) detachment;
            case (_) E.f(#NOT_POSSIBLE("Field Detachment Derivation"), "The proposal is not a Field Proposal")
        }
    };
    public func worker(__ : Self) : Worker {
        switch (__) {
            case (#Worker(detachment)) detachment;
            case (_) E.f(#NOT_POSSIBLE("Worker Detachment Derivation"), "The proposal is not a Worker Proposal")
        }
    };
    public func configs(__ : Self) : Configs {
        switch (__) {
            case (#Configs(detachment)) detachment;
            case (_) E.f(#NOT_POSSIBLE("Configs Detachment Derivation"), "The proposal is not a Configs Proposal")
        }
    };

    public func variant(__ : Self) : Variant {
        switch (__) {
            case (#Code(_)) #Code;
            case (#Field(_)) #Field;
            case (#Worker(_)) #Worker;
            case (#Configs(_)) #Configs
        }
    };

    public func toSharable(__ : Self) : Sharable {
        switch (__) {
            case (#Code(detachment)) #Code(detachment);
            case (#Field(detachment)) #Field(detachment);
            case (#Worker(detachment)) #Worker(detachment);
            case (#Configs(detachment)) #Configs(detachment)
        }
    }
}
