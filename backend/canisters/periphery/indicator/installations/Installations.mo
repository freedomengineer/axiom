import Installation "Installation";
import Actor "../actors/Actor";
import Commitments "../commitments/Commitments";

import E "../../../common/Errors";

import Date "../../../library/Date";
import Map "../../../library/Map";
import Version "../../../library/Version";

import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Debug "mo:base/Debug";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Map<K, V> = Map.Map<K, V>;
    private type Time = Time.Time;

    private type UpdateLevel = Version.UpdateLevel;
    private type ActorInfo = Actor.Info;
    private type Commitments = Commitments.Commitments;
    private type SharableCommitments = Commitments.Sharable;
    private type Installation = Installation.Installation;
    private type SharableInstallation = Installation.Sharable;

    private type ReleaseNotes = Installation.ReleaseNotes;

    private let { PrincipalKey } = Map;

    /// INDICATOR ////// INSTALLATIONS ////////////

    private type Self = Installations;

    public type Installations = Map<Principal, (Installation, Time)>;
    public func init() : Self = Map.new();

    /// PUBLIC ////// MODIFIERS ////////////

    public func add(__ : Self, issuer : Principal, commitHash : Text, updateLevel : UpdateLevel, releaseNotes : ReleaseNotes, commitments : SharableCommitments, expiryDate : Time) {
        let installation : Installation = Installation.init(commitHash, updateLevel, releaseNotes, commitments);
        Map.put(__, PrincipalKey(issuer), (installation, expiryDate))
    };
    public func remove(__ : Self, issuer : Principal) {
        Map.delete(__, PrincipalKey(issuer))
    };
    public func extendAvailabilityDuration(__ : Self, issuer : Principal, expiryDate : Time) {
        Map.put(__, PrincipalKey(issuer), (installation(__, issuer), expiryDate))
    };

    public func cleanUpExpiredInstallations(__ : Self, getNow : () -> Int) {
        let now : Time = getNow();
        for ((issuer, (installation, expiryDate)) in Map.entries(__)) {
            if (expiryDate < now) Map.delete(__, PrincipalKey(issuer))
        }
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func found(__ : Self, issuer : Principal) : Bool = Map.includes(__, PrincipalKey(issuer));

    public func installation(__ : Self, issuer : Principal) : Installation {
        switch (Map.get(__, PrincipalKey(issuer))) {
            case (null) E.f(#NOT_EXISTED("Installation"), "Installation for issuer " # debug_show issuer # " does not exist");
            case (?(installation, _)) installation
        }
    };
    public func getInstallation(__ : Self, issuer : Principal) : SharableInstallation = Installation.toSharable(installation(__, issuer));

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectNotFound(__ : Self, issuer : Principal) : () {
        if (not found(__, issuer)) return;
        E.f(#ALREADY_EXISTED("Installation"), "Installation for issuer " # debug_show issuer # " has already existed")
    };
    public func expectFound(__ : Self, issuer : Principal) : () {
        if (found(__, issuer)) return;
        E.f(#NOT_EXISTED("Installation"), "Installation for issuer " # debug_show issuer # " does not exist")
    }
}
