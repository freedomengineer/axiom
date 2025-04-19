import Actor "../actors/Actor";

import E "../../../common/Errors";

import BlobCommitment "../../../library/BlobCommitment";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type BlobCommitment = BlobCommitment.BlobCommitment;
    private type DeployableActorVariant = Actor.DeployableVariant;

    /// INDICATOR ////// COMMITMENT ////////////

    private type Self = Commitment;

    public type Commitment = {
        args : [Nat8];
        wasmCommitment : BlobCommitment
    };
    public type Sharable = {
        actorVariant : DeployableActorVariant;
        args : [Nat8];
        moduleHash : Text
    };

    public func init(args : [Nat8], moduleHash : Text) : Self = {
        args;
        wasmCommitment = BlobCommitment.new(moduleHash)
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func uploadChunk(__ : Self, id : Nat8, chunk : Blob, expectedModuleHash : Text) {
        expectUnsettled(__);
        BlobCommitment.uploadChunk(__.wasmCommitment, id, chunk, expectedModuleHash)
    };
    public func settle(__ : Self) {
        expectUnsettled(__);
        BlobCommitment.mergeChunks(__.wasmCommitment)
    };
    public func clear(__ : Self) {
        expectUnsettled(__);
        BlobCommitment.clearChunks(__.wasmCommitment)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func isSettled(__ : Self) : Bool = BlobCommitment.isSettled(__.wasmCommitment);

    public func getUploadedChunks(__ : Self) : [Nat8] {
        expectUnsettled(__);
        BlobCommitment.getUploadedChunks(__.wasmCommitment)
    };
    public func getComputedModuleHash(__ : Self) : Text {
        expectUnsettled(__);
        BlobCommitment.getChecksum(__.wasmCommitment)
    };

    public func toSharable(__ : Self, actorVariant : DeployableActorVariant) : Sharable = {
        actorVariant;
        args = __.args;
        moduleHash = BlobCommitment.getExpectedChecksum(__.wasmCommitment)
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectSettled(__ : Self) {
        if (isSettled(__)) return;
        E.f(#NOT_VALID("Code Upload Commitment"), "Expect commitment to be settled, but it is unsettled")
    };
    public func expectUnsettled(__ : Self) {
        if (not isSettled(__)) return;
        E.f(#NOT_VALID("Code Upload Commitment"), "Expect commitment to be unsettled, but it is settled")
    }
}
