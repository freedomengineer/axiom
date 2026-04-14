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

    public type Tier = {
        #L32;
        #L512;
        #L4096;
        #L16384;
        #Extra : Nat
    };
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

    public type SendableContent = {
        #EncryptedText : EncryptedText;
        #FileDerivationPath : FileDerivationPath;
        #Composite : {
            encryptedText : EncryptedText;
            fileDerivationPath : FileDerivationPath
        }
    };

    public type AdminsAddedData = {
        admins : [Principal]
    };
    public type AdminsRemovedData = {
        admins : [Principal]
    };
    public type MembersInvitedData = {
        members : [Principal];
        by : Principal
    };
    public type MembersKickedData = {
        members : [Principal];
        by : Principal
    };
    public type MemberJoinedData = {
        member : Principal
    };
    public type MemberLeftData = {
        member : Principal
    };
    public type ChannelRenamedData = {
        from : Text;
        to : Text
    };
    public type ChannelTierChangedData = {
        from : Tier;
        to : Tier
    };
    public type ChannelVisibilityChangedData = {
        toPrivate : Bool
    };
    public type MessageDeletedData = {
        amount : Nat;
        by : ?Principal
    };
    public type KeyRotatedData = {
        to : Nat;
        keyHash : Blob;
        by : Principal
    };
    public type StakeWithdrawnData = {
        amount : Nat;
        by : Principal
    };
    public type StakeDepositedData = {
        amount : Nat;
        by : Principal
    };
    public type LogContentVariant = {
        #AdminsAdded;
        #AdminsRemoved;
        #MembersInvited;
        #MembersKicked;
        #MemberJoined;
        #MemberLeft;
        #ChannelRenamed;
        #ChannelTierChanged;
        #MessageDeleted;
        #KeyRotated;
        #StakeWithdrawn;
        #StakeDeposited
    };

    public type LogContent = {
        #AdminsAdded : AdminsAddedData;
        #AdminsRemoved : AdminsRemovedData;
        #MembersInvited : MembersInvitedData;
        #MembersKicked : MembersKickedData;
        #MemberJoined : MemberJoinedData;
        #MemberLeft : MemberLeftData;
        #ChannelRenamed : ChannelRenamedData;
        #ChannelTierChanged : ChannelTierChangedData;
        #ChannelVisibilityChanged : ChannelVisibilityChangedData;
        #MessageDeleted : MessageDeletedData;
        #KeyRotated : KeyRotatedData;
        #StakeWithdrawn : StakeWithdrawnData;
        #StakeDeposited : StakeDepositedData
    };

    public type Log = {
        content : LogContent;
        timestamp : Int
    };
    public type Sendable = {
        sender : Principal;
        content : SendableContent;
        iv : IV;
        keyVersion : Nat; // Key rotation (when kicking members)
        repliedTo : ?Nat;
        var replies : List<Nat>;
        var reactions : List<(Text, Set<Principal>)>;
        timestamp : Int
    };

    public type LogSharable = {
        id : Nat;
        content : LogContent;
        timestamp : Int
    };
    public type SendableSharable = {
        id : Nat;
        sender : Principal;
        content : SendableContent;
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

    public func initSendable(sender : Principal, content : SendableContent, iv : IV, keyVersion : Nat, repliedTo : ?Nat, getNow : () -> Int) : Self = #Sendable({
        sender;
        content;
        iv;
        keyVersion;
        repliedTo;
        var replies = List.nil();
        var reactions = List.nil();
        timestamp = getNow()
    });
    public func initLog(content : LogContent, getNow : () -> Int) : Self = #Log({
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
    public func keyVersion(__ : Self) : ?Nat = switch (__) {
        case (#Sendable({ keyVersion })) ?keyVersion;
        case (#Log(_)) null
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
