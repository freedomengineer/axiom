import E "../../../common/Errors";

import List "../../../library/List";
import Map "../../../library/Map";
import Set "../../../library/Set";

import Time "mo:base/Time";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type List<T> = List.List<T>;
    private type Set<T> = Set.Set<T>;
    private type Map<K, V> = Map.Map<K, V>;

    private let Val = Set.PrincipalVal;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type VetKeyId = { curve : { #bls12_381_g2 }; name : Text };
    public type Version = Nat;
    public type EncryptedDEK = Blob;
    public type PlainDEK = Blob;
    public type IV = Blob;
    public type Signature = Blob;
    public type EncryptedText = Blob;
    // {bucket id}/{folder}/{file name}.{file type}
    public type FileDerivationPath = Text;

    public type DEK = {
        #Encrypted : EncryptedDEK;
        #Plain : PlainDEK
    };
    public type MemberDEKs = Map<Version, DEK>;
    public type MemberDEKsSharable = [(Version, DEK)];
    public type MemberEncryptedDEK = (Version, EncryptedDEK);

    public type Content = {
        #EncryptedText : EncryptedText;
        #FileDerivationPath : FileDerivationPath;
        #Composite : {
            encryptedText : EncryptedText;
            fileDerivationPath : FileDerivationPath
        }
    };

    public type Log = {
        encryptedText : EncryptedText;
        iv : IV;
        keyVersion : Nat; // Key rotation (when kicking members)
        timestamp : Int
    };
    public type Sendable = {
        sender : Principal;
        content : Content;
        iv : IV;
        keyVersion : Nat; // Key rotation (when kicking members)
        repliedTo : ?Nat;
        var replies : List<Nat>;
        var reactions : List<(Text, Set<Principal>)>;
        timestamp : Int
    };

    public type LogSharable = {
        id : Nat;
        encryptedText : EncryptedText;
        timestamp : Int
    };
    public type SendableSharable = {
        id : Nat;
        sender : Principal;
        content : Content;
        repliedTo : ?Nat;
        replies : [Nat];
        reactions : [(Text, [Principal])];
        timestamp : Int
    };

    /// CHAT ////// MESSAGE ////////////

    private type Self = Message;

    public type Message = {
        #Sendable : Sendable;
        #Log : Log
    };
    public type Sharable = {
        #Sendable : SendableSharable;
        #Log : LogSharable
    };

    public func initSendable(sender : Principal, content : Content, iv : IV, keyVersion : Nat, repliedTo : ?Nat, getNow : () -> Int) : Self = #Sendable({
        sender;
        content;
        iv;
        keyVersion;
        repliedTo;
        var replies = List.nil();
        var reactions = List.nil();
        timestamp = getNow()
    });
    public func initLog(encryptedText : EncryptedText, iv : IV, keyVersion : Nat, getNow : () -> Int) : Self = #Log({
        encryptedText;
        iv;
        keyVersion;
        timestamp = getNow()
    });

    /// PUBLIC ////// MODIFIERS ////////////

    public func addReaction(__ : Self, reaction : Text, reactor : Principal) {
        let m : Sendable = sendable(__);
        switch (List.find<(Text, Set<Principal>)>(m.reactions, func((key, _)) = key == reaction)) {
            case (?(_, reactors)) Set.put(reactors, Val(reactor));
            case (null) m.reactions := List.push((reaction, Set.make(Val(reactor))), m.reactions)
        }
    };
    public func removeReaction(__ : Self, reaction : Text, reactor : Principal) {
        let m : Sendable = sendable(__);
        switch (List.find<(Text, Set<Principal>)>(m.reactions, func((key, _)) = key == reaction)) {
            case (?(_, reactors)) Set.delete(reactors, Val(reactor));
            case (null) E.f(#NOT_EXISTED("Reaction"), "Reaction " # reaction # " not found")
        }
    };

    public func addReply(__ : Self, replyId : Nat) {
        let m : Sendable = sendable(__);
        m.replies := List.push(replyId, m.replies)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func timestamp(__ : Self) : Int = switch (__) {
        case (#Sendable({ timestamp })) timestamp;
        case (#Log({ timestamp })) timestamp
    };
    public func keyVersion(__ : Self) : Nat = switch (__) {
        case (#Sendable({ keyVersion })) keyVersion;
        case (#Log({ keyVersion })) keyVersion
    };

    public func sendable(__ : Self) : Sendable = switch (__) {
        case (#Sendable(m)) m;
        case (#Log(_)) E.f(#NOT_VALID("Message"), "Expected a sendable message, got a log message")
    };

    public func toSharable(__ : Self, id : Nat) : Sharable = switch (__) {
        case (#Sendable(m)) #Sendable({
            m with id;
            replies = List.toArray(m.replies);
            reactions = List.toArrayMap<(Text, Set<Principal>), (Text, [Principal])>(m.reactions, func((key, reactors)) = (key, Set.toArray<Principal>(reactors)))
        });
        case (#Log(m)) #Log({
            m with id
        })
    }
}
