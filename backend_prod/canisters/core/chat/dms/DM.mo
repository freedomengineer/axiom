import Message "../messages/Message";
import Messages "../messages/Messages";

import E "../../../common/Errors";

import Base "../../../library/Base";
import Iter "../../../library/Iter";
import List "../../../library/List";
import Map "../../../library/Map";
import MultiDimArray "../../../library/MultiDimArray";
import Set "../../../library/Set";

import Char "mo:base/Char";
import Text "mo:base/Text";
import Principal "mo:base/Principal";
import Time "mo:base/Time";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type List<T> = List.List<T>;
    private type Set<T> = Set.Set<T>;

    private type SharableMessage = Message.Sharable;
    private type Messages = Messages.Messages;
    private type SharableMessages = Messages.Sharable;
    private type Tier = Messages.Tier;
    private type Direction = Messages.Direction;
    private type Cursor = Messages.Cursor;
    private type Version = Message.Version;
    private type EncryptedDEK = Message.EncryptedDEK;
    private type DEK = Message.DEK;
    private type MemberDEKs = Message.MemberDEKs;
    private type MemberDEKsSharable = Message.MemberDEKsSharable;
    private type MemberEncryptedDEK = Message.MemberEncryptedDEK;

    private let PrincipalKey = Map.PrincipalKey;
    private let NatKey = Map.NatKey;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Key = {
        #DM : Principal;
        #Group : Nat
    };
    public type Info = {
        id : Principal;
        name : Text;
        tier : Tier;
        creator : Principal;
        creationDate : Int;

        members : (Principal, Principal);
        messagesCount : (Nat, Nat);
        lastActive : Int;

        disableLogs : Bool;
        versionRange : (Nat, Nat);
        callerDeks : MemberDEKsSharable
    };

    public func key(a : Principal, b : Principal) : Text {
        var key = "";
        for ((ca, cb) in Iter.parallel<Char, Char>(Principal.toText(a).chars(), Principal.toText(b).chars())) {
            let xa = switch (ca) {
                case (?'-') null;
                case (_) ca
            };
            let xb = switch (cb) {
                case (?'-') null;
                case (_) cb
            };
            switch (xa, xb) {
                case (null, ?cb) key #= Char.toText(cb);
                case (?ca, null) key #= Char.toText(ca);
                case ((?ca, ?cb)) switch (Char.compare(ca, cb)) {
                    case (#less) key #= Char.toText(ca) # Char.toText(cb);
                    case (#greater) key #= Char.toText(cb) # Char.toText(ca);
                    case (#equal) key #= Text.toUppercase(Char.toText(ca))
                };
                case (null, null) {}
            }
        };
        key
    };

    /// CHAT ////// CHANNEL ////////////

    private type Self = DM;

    public type DM = {
        var tier : Tier;
        var disableLogs : Bool;
        creator : Principal;
        members : ((Principal, MemberDEKs), (Principal, MemberDEKs));
        messages : Messages;
        var keyVersion : Version;
        creationDate : Int
    };
    public type PrivateSharable = {
        id : Key;
        name : Text;
        tier : Tier;
        lastMessage : SharableMessage;
        keyVersion : Version;
        callerDeks : MemberDEKsSharable
    };

    public func init(creator : (Principal, EncryptedDEK), to : (Principal, EncryptedDEK)) : Self {
        if (creator.0 == to.0) E.f(#NOT_VALID("Members"), "Cannot create a DM with yourself");

        {
            var tier = #L32;
            members = (
                (
                    creator.0,
                    Map.make<Version, DEK>(NatKey(1), #Encrypted(creator.1)),
                ),
                (
                    to.0,
                    Map.make<Version, DEK>(NatKey(1), #Encrypted(to.1)),
                ),
            );
            var disableLogs = false;
            creator = creator.0;
            messages = Messages.init();
            var keyVersion = 1;
            creationDate = Time.now()
        }
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func deleteFirstMessages(__ : Self, limit : Nat) {
        if (limit % 32 != 0) E.f(#NOT_VALID("Limit"), "Number of messages to delete must be a multiple of 32");

        let messagesCount : Nat = Messages.size(__.messages);
        if (limit > messagesCount) E.f(#NOT_VALID("Limit"), "Number of messages to delete is greater than the number of messages in the channel");
        if (messagesCount == 0) E.f(#NOT_VALID("Messages"), "No messages to delete");

        let firstVersion : Version = Message.keyVersion(Messages.firstMessage(__.messages));
        let lastVersion : Version = Message.keyVersion(Messages.lastMessage(__.messages));

        Messages.deleteFirstChunks(__.messages, limit / 32);

        let firstVersionAfter : Version = switch (MultiDimArray.isEmpty(__.messages)) {
            case (true) lastVersion;
            case (false) Message.keyVersion(Messages.firstMessage(__.messages))
        };

        if (firstVersionAfter > firstVersion) {
            for (version in Iter.range(firstVersion, firstVersionAfter - 1)) {
                Map.delete(__.members.0.1, NatKey(version));
                Map.delete(__.members.1.1, NatKey(version))
            }
        }
    };

    public func rotate(__ : Self, membersDek : ((Principal, MemberEncryptedDEK), (Principal, MemberEncryptedDEK))) {
        let lastVersion : Version = switch (MultiDimArray.isEmpty(__.messages)) {
            case (true) 1;
            case (false) Message.keyVersion(Messages.lastMessage(__.messages))
        };
        __.keyVersion += lastVersion + 1; // if no new messages since last rotation, just override

        if (__.keyVersion != membersDek.0.1.0 or __.keyVersion != membersDek.1.1.0) E.f(#NOT_VALID("KeyVersion"), "Key version for members to rotate is not the same as the key version in the channel");

        switch (__.members.0.0 == membersDek.0.0 and __.members.1.0 == membersDek.1.0, __.members.0.0 == membersDek.1.0 and __.members.1.0 == membersDek.0.0) {
            case (true, _) {
                Map.put(__.members.0.1, NatKey(__.keyVersion), #Encrypted(membersDek.0.1.1));
                Map.put(__.members.1.1, NatKey(__.keyVersion), #Encrypted(membersDek.1.1.1))
            };
            case (_, true) {
                Map.put(__.members.0.1, NatKey(__.keyVersion), #Encrypted(membersDek.1.1.1));
                Map.put(__.members.1.1, NatKey(__.keyVersion), #Encrypted(membersDek.0.1.1))
            };
            case (false, false) E.f(#NOT_VALID("Members"), "Members to rotate are not the same as the members in the channel")
        }
    };

    public func setTier(__ : Self, tier : Tier) {
        __.tier := tier
    };
    public func disableLogs(__ : Self) {
        __.disableLogs := true
    };
    public func enableLogs(__ : Self) {
        __.disableLogs := false
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func isTier(__ : Self, tier : Tier) : Bool = __.tier == tier;
    public func lastActive(__ : Self) : Int = Messages.lastActive(__.messages);

    public func pullMessages(__ : Self, direction : Direction, cursor : ?Cursor) : [SharableMessage] = Messages.pull(__.messages, direction, cursor);

    public func toPrivateSharable(__ : Self, to : (Principal, Text), caller : Principal) : PrivateSharable = {
        id = #DM(to.0);
        name = to.1;
        tier = __.tier;
        lastMessage = Messages.getLastMessage(__.messages);
        keyVersion = __.keyVersion;
        callerDeks = switch (__.members.0.0 == caller and __.members.1.0 == to.0, __.members.0.0 == to.0 and __.members.1.0 == caller) {
            case (true, _) Map.getEntries(__.members.0.1);
            case (_, true) Map.getEntries(__.members.1.1);
            case (false, false) E.f(#NOT_VALID("Members"), "User " # debug_show caller # " is not a member of the Channel")
        }
    };
    public func getInfo(__ : Self, to : (Principal, Text), caller : Principal) : Info = {
        id = to.0;
        name = to.1;
        tier = __.tier;
        creator = __.creator;
        creationDate = __.creationDate;
        disableLogs = __.disableLogs;
        members = (__.members.0.0, __.members.1.0);
        messagesCount = (Messages.size(__.messages), Messages.messagesLimitPerTier(__.tier));
        lastActive = Messages.lastActive(__.messages);
        versionRange = (Message.keyVersion(Messages.firstMessage(__.messages)), Message.keyVersion(Messages.lastMessage(__.messages)));
        callerDeks = switch (__.members.0.0 == caller and __.members.1.0 == to.0, __.members.0.0 == to.0 and __.members.1.0 == caller) {
            case (true, _) Map.getEntries(__.members.0.1);
            case (_, true) Map.getEntries(__.members.1.1);
            case (false, false) E.f(#NOT_VALID("Members"), "User " # debug_show caller # " is not a member of the Channel")
        }
    }
}
