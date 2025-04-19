import E "../common/Errors";

import SHA256 "SHA256";
import Tree "Tree";

import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Text "mo:base/Text";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Tree<K, V> = Tree.Tree<K, V>;

    private let { Nat8Key } = Tree;

    /// LIBRARY ////// BLOB COMMITMENT ////////////

    private type Self = BlobCommitment;

    public type BlobCommitment = {
        checksum : Text;
        chunks : Tree<Nat8, [Nat8]>;
        var bytes : [Nat8]
    };

    public func new(checksum : Text) : Self = {
        checksum;
        chunks = Tree.new<Nat8, [Nat8]>();
        var bytes = []
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func uploadChunk(__ : Self, id : Nat8, chunk : Blob, expectedChecksum : Text) {
        switch (SHA256.fromBlob(chunk) == expectedChecksum) {
            case (false) E.f(#NOT_VALID("Blob Commitment"), "Blob chunk's checksum mismatch");
            case (true) Tree.put(__.chunks, Nat8Key(id), Blob.toArray(chunk))
        }
    };
    public func clearChunks(__ : Self) {
        Tree.clear(__.chunks)
    };
    public func mergeChunks(__ : Self) {
        let bytes = Array.flatten(Tree.getVals(__.chunks));
        let computedChecksum : Text = SHA256.fromBytes(bytes);
        switch (computedChecksum == __.checksum) {
            case (false) E.f(#NOT_VALID("Blob Commitment"), "Blob's checksum mismatch, given: " # debug_show (__.checksum) # " computed: " # debug_show (computedChecksum) # ", please check uploaded chunks or clear the Commitment and try again");
            case (true) {
                __.bytes := bytes;
                clearChunks(__)
            }
        }
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func isSettled(__ : Self) : Bool = __.bytes.size() != 0;
    public func isCompleted(__ : Self) : Bool {
        let bytes : [Nat8] = Array.flatten(Tree.getVals(__.chunks));
        let computedChecksum : Text = SHA256.fromBytes(bytes);
        computedChecksum == __.checksum
    };

    public func getUploadedChunks(__ : Self) : [Nat8] = Tree.getKeys(__.chunks);
    public func getUploadedSize(__ : Self) : Nat {
        var uploadedSize : Nat = 0;
        for (chunk in Tree.vals(__.chunks)) {
            uploadedSize := uploadedSize + chunk.size()
        };
        uploadedSize
    };

    public func getExpectedChecksum(__ : Self) : Text = __.checksum;
    public func getChecksum(__ : Self) : Text = SHA256.fromBytes(getBytes(__));

    public func getSize(__ : Self) : Nat = getBytes(__).size();
    public func getBytes(__ : Self) : [Nat8] = switch (isSettled(__)) {
        case (false) E.f(#NOT_VALID("Blob Commitment"), "Chunks are not merged yet, please finalize the Commitment");
        case (true) __.bytes
    }
}
