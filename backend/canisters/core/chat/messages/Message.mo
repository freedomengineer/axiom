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

    public type Content = {
        #EncryptedText : ?Blob;
        #FileDerivationPath : ?Text;
        #Composite : {
            encryptedText : ?Blob;
            fileDerivationPath : ?Text
        }
    };

    public type Log = {
        content : Text;
        timestamp : Int
    };
    public type Sendable = {
        sender : Principal;
        // {bucket id}/{folder}/{file name}.{file type}
        content : Content;
        repliedTo : ?Nat;
        var replies : List<Nat>;
        var reactions : List<(Text, Set<Principal>)>;
        timestamp : Int
    };

    public type LogSharable = {
        id : Nat;
        content : Text;
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

    public func initSendable(sender : Principal, content : Content, repliedTo : ?Nat, getNow : () -> Int) : Self = #Sendable({
        sender;
        content;
        repliedTo;
        var replies = List.nil();
        var reactions = List.nil();
        timestamp = getNow()
    });
    public func initLog(content : Text, getNow : () -> Int) : Self = #Log({
        content;
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

    public func sendable(__ : Self) : Sendable = switch (__) {
        case (#Sendable(m)) m;
        case (#Log(_)) E.f(#NOT_VALID("Message"), "Expected a sendable message, got a log message")
    };

    public func toSharable(__ : Message, id : Nat) : Sharable = switch (__) {
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
