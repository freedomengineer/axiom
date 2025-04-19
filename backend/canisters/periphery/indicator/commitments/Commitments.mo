import Commitment "Commitment";
import Actor "../actors/Actor";

import E "../../../common/Errors";

import Map "../../../library/Map";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Map<K, V> = Map.Map<K, V>;

    private type DeployableActorVariant = Actor.DeployableVariant;
    private type Commitment = Commitment.Commitment;
    private type SharableCommitment = Commitment.Sharable;

    private let { DeployableVariantKey } = Actor;

    /// INDICATOR ////// COMMITMENTS ////////////

    private type Self = Commitments;

    public type Commitments = Map<DeployableActorVariant, Commitment>;
    public type Sharable = [SharableCommitment];

    public func init(entries : Sharable) : Self {
        let commitments : Commitments = Map.new<DeployableActorVariant, Commitment>();
        for (({ actorVariant; args; moduleHash }) in entries.vals()) {
            let actorCommitment : Commitment = Commitment.init(args, moduleHash);
            Map.put(commitments, DeployableVariantKey(actorVariant), actorCommitment)
        };
        commitments
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func commitment(__ : Self, actorVariant : DeployableActorVariant) : Commitment {
        switch (Map.get(__, DeployableVariantKey(actorVariant))) {
            case (null) E.f(#NOT_EXISTED("Commitment"), "Commitment for actor " # debug_show actorVariant # " does not exist");
            case (?commitment) commitment
        }
    };
    public func getCommitment(__ : Self, actorVariant : DeployableActorVariant) : SharableCommitment {
        Commitment.toSharable(commitment(__, actorVariant), actorVariant)
    };
    public func getCommitments(__ : Self) : Sharable {
        Map.getEntriesMap<DeployableActorVariant, Commitment, SharableCommitment>(__, func((i, e)) = Commitment.toSharable(e, i))
    };

    public func isSettled(__ : Self) : Bool {
        Map.everyVal<DeployableActorVariant, Commitment>(__, Commitment.isSettled)
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectSettled(__ : Self) {
        if (isSettled(__)) return;
        E.f(#NOT_VALID("Installation"), "Expect all commitments to be settled, but some are unsettled")
    };
    public func expectUnsettled(__ : Self) {
        if (not isSettled(__)) return;
        E.f(#NOT_VALID("Installation"), "Expect all commitments to be unsettled, but all are settled")
    }
}
