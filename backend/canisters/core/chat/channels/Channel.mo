import Message "../messages/Message";
import Messages "../messages/Messages";

import E "../../../common/Errors";

import Array "../../../library/Array";
import List "../../../library/List";
import Set "../../../library/Set";

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

    private let Val = Set.PrincipalVal;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type DM = {
        var tier : Tier;
        members : [Principal];
        messages : Messages;
        creationDate : Int
    };
    public type Group = {
        var name : Text;
        var tier : Tier;
        var disableLogs : Bool;
        creator : Principal;
        admins : Set<Principal>;
        members : Set<Principal>;
        var banned : ?Set<Principal>; // only not null for public channels
        messages : Messages;
        creationDate : Int
    };

    public type DMSharable = {
        tier : Nat;
        members : [Principal];
        messagesCount : (Nat, Nat);
        creationDate : Int
    };
    public type GroupSharable = {
        name : Text;
        tier : Nat;
        disableLogs : Bool;
        creator : Principal;
        admins : [Principal];
        members : [Principal];
        messagesCount : (Nat, Nat);
        creationDate : Int
    };

    /// CHAT ////// CHANNEL ////////////

    private type Self = Channel;

    public type Channel = {
        #DM : DM;
        #Group : Group
    };
    public type Sharable = {
        name : ?Text;
        tier : Tier;
        lastMessage : SharableMessage;
        unreadCount : Nat
    };
    public type InfoSharable = {
        #DM : DMSharable;
        #Group : GroupSharable
    };

    public func initDM(creator : Principal, to : Principal, getNow : () -> Int) : Self = #DM({
        var tier = #L32;
        members = [creator, to];
        messages = Messages.init();
        creationDate = getNow()
    });
    public func initGroup(name : Text, disableLogs : Bool, isPublic : Bool, creator : Principal, getNow : () -> Int) : Self = #Group({
        var tier = #L32;
        var name;
        var disableLogs;
        creator;
        admins = Set.make(Val(creator));
        members = Set.make(Val(creator));
        var banned = switch (isPublic) {
            case (true) ?Set.new<Principal>();
            case (false) null
        };
        messages = Messages.init();
        creationDate = getNow()
    });

    /// PUBLIC ////// MODIFIERS ////////////

    public func addMember(__ : Self, member : Principal) {
        switch (__) {
            case (#DM(_)) E.f(#NOT_VALID("Channel"), "Attempted to add a member to a DM channel");
            case (#Group(group)) Set.put(group.members, Val(member))
        }
    };
    public func removeMember(__ : Self, member : Principal) {
        switch (__) {
            case (#DM(_)) E.f(#NOT_VALID("Channel"), "Attempted to remove a member from a DM channel");
            case (#Group(group)) Set.delete(group.members, Val(member))
        }
    };
    public func addAdmin(__ : Self, admin : Principal) {
        switch (__) {
            case (#DM(_)) E.f(#NOT_VALID("Channel"), "Attempted to add an admin to a DM channel");
            case (#Group(group)) Set.put(group.admins, Val(admin))
        }
    };
    public func removeAdmin(__ : Self, admin : Principal) {
        switch (__) {
            case (#DM(_)) E.f(#NOT_VALID("Channel"), "Attempted to remove an admin from a DM channel");
            case (#Group(group)) Set.delete(group.admins, Val(admin))
        }
    };
    public func banMember(__ : Self, member : Principal) {
        switch (__) {
            case (#DM(_)) E.f(#NOT_VALID("Channel"), "Attempted to ban a member from a DM channel");
            case (#Group(group)) switch (group.banned) {
                case (null) E.f(#NOT_VALID("Channel"), "Only public channels can ban members");
                case (?banned) Set.put(banned, Val(member))
            }
        }
    };
    public func unbanMember(__ : Self, member : Principal) {
        switch (__) {
            case (#DM(_)) E.f(#NOT_VALID("Channel"), "Attempted to unban a member from a DM channel");
            case (#Group(group)) switch (group.banned) {
                case (null) E.f(#NOT_VALID("Channel"), "Only public channels can unban members");
                case (?banned) Set.delete(banned, Val(member))
            }
        }
    };

    public func disableLogs(__ : Self) {
        switch (__) {
            case (#DM(_)) E.f(#NOT_VALID("Channel"), "Attempted to disable logs for a DM channel");
            case (#Group(group)) group.disableLogs := true
        }
    };
    public func enableLogs(__ : Self) {
        switch (__) {
            case (#DM(_)) E.f(#NOT_VALID("Channel"), "Attempted to enable logs for a DM channel");
            case (#Group(group)) group.disableLogs := false
        }
    };
    public func setName(__ : Self, name : Text) {
        switch (__) {
            case (#DM(_)) E.f(#NOT_VALID("Channel"), "Attempted to set the name of a DM channel");
            case (#Group(group)) group.name := name
        }
    };
    public func setTier(__ : Self, tier : Tier) {
        switch (__) {
            case (#DM(_)) E.f(#NOT_VALID("Channel"), "Attempted to set the tier of a DM channel");
            case (#Group(group)) group.tier := tier
        }
    };

    public func deleteFirstMessages(__ : Self, limit : Nat) {
        if (limit % 32 != 0) E.f(#NOT_VALID("Limit"), "Number of messages to delete must be a multiple of 32");

        Messages.deleteFirstChunks(messages(__), limit / 32)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func lastTimestamp(__ : Self) : Int = switch (__ : Self) {
        case (#DM(dm)) Messages.lastTimestamp(dm.messages);
        case (#Group(group)) Messages.lastTimestamp(group.messages)
    };

    public func messages(__ : Self) : Messages = switch (__ : Self) {
        case (#DM({ messages })) messages;
        case (#Group({ messages })) messages
    };

    public func toSharable(__ : Self, lastRead : Nat) : Sharable = switch (__) {
        case (#DM(dm)) {
            let lastId : Nat = Messages.lastId(dm.messages);
            {
                name = null;
                tier = dm.tier;
                lastMessage = Message.toSharable(Messages.message(dm.messages, lastId), lastId);
                unreadCount = lastId - lastRead
            }
        };
        case (#Group(group)) {
            let lastId : Nat = Messages.lastId(group.messages);
            {
                name = ?group.name;
                tier = group.tier;
                lastMessage = Message.toSharable(Messages.message(group.messages, lastId), lastId);
                unreadCount = lastId - lastRead
            }
        }
    };

    public func pullMessages(__ : Self, direction : Direction, cursor : ?Cursor) : [SharableMessage] {
        Messages.pull(messages(__), direction, cursor)
    }
}
