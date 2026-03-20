import E "../../../common/Errors";

import List "../../../library/List";
import Set "../../../library/Set";

import Time "mo:base/Time";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type List<T> = List.List<T>;
    private type Set<T> = Set.Set<T>;

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

    public type Content = {
        #EncryptedText : EncryptedText;
        #FileDerivationPath : FileDerivationPath;
        #Composite : {
            encryptedText : EncryptedText;
            fileDerivationPath : FileDerivationPath
        }
    };

    public type Log<T> = {
        encryptedText : EncryptedText;
        iv : IV;
        keyVersion : T; // Nat/null - Key rotation (when kicking members)
        timestamp : Int
    };
    public type Sendable<T> = {
        sender : Principal;
        content : Content;
        iv : IV;
        keyVersion : T; // Nat/null - Key rotation (when kicking members)
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

    private type Self<T> = Message<T>;

    public type Message<T> = {
        #Sendable : Sendable<T>;
        #Log : Log<T>
    };
    public type Sharable = {
        #Sendable : SendableSharable;
        #Log : LogSharable
    };

    public func initSendable<T>(sender : Principal, content : Content, iv : IV, keyVersion : T, repliedTo : ?Nat, getNow : () -> Int) : Self<T> = #Sendable({
        sender;
        content;
        iv;
        keyVersion;
        repliedTo;
        var replies = List.nil();
        var reactions = List.nil();
        timestamp = getNow()
    });
    public func initLog<T>(encryptedText : EncryptedText, iv : IV, keyVersion : T, getNow : () -> Int) : Self<T> = #Log({
        encryptedText;
        iv;
        keyVersion;
        timestamp = getNow()
    });

    /// PUBLIC ////// MODIFIERS ////////////

    public func addReaction<T>(__ : Self<T>, reaction : Text, reactor : Principal) {
        let m : Sendable<T> = sendable(__);
        switch (List.find<(Text, Set<Principal>)>(m.reactions, func((key, _)) = key == reaction)) {
            case (?(_, reactors)) Set.put(reactors, Val(reactor));
            case (null) m.reactions := List.push((reaction, Set.make(Val(reactor))), m.reactions)
        }
    };
    public func removeReaction<T>(__ : Self<T>, reaction : Text, reactor : Principal) {
        let m : Sendable<T> = sendable(__);
        switch (List.find<(Text, Set<Principal>)>(m.reactions, func((key, _)) = key == reaction)) {
            case (?(_, reactors)) Set.delete(reactors, Val(reactor));
            case (null) E.f(#NOT_EXISTED("Reaction"), "Reaction " # reaction # " not found")
        }
    };

    public func addReply<T>(__ : Self<T>, replyId : Nat) {
        let m : Sendable<T> = sendable(__);
        m.replies := List.push(replyId, m.replies)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func timestamp<T>(__ : Self<T>) : Int = switch (__) {
        case (#Sendable({ timestamp })) timestamp;
        case (#Log({ timestamp })) timestamp
    };
    public func keyVersion<T>(__ : Self<T>) : T = switch (__) {
        case (#Sendable({ keyVersion })) keyVersion;
        case (#Log({ keyVersion })) keyVersion
    };

    public func sendable<T>(__ : Self<T>) : Sendable<T> = switch (__) {
        case (#Sendable(m)) m;
        case (#Log(_)) E.f(#NOT_VALID("Message"), "Expected a sendable message, got a log message")
    };

    public func toSharable<T>(__ : Self<T>, id : Nat) : Sharable = switch (__) {
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
