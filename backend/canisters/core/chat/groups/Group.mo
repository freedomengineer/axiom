import Message "../messages/Message";
import Messages "../messages/Messages";

import E "../../../common/Errors";

import List "../../../library/List";
import Set "../../../library/Set";

import Text "mo:base/Text";
import Time "mo:base/Time";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type List<T> = List.List<T>;
    private type Set<T> = Set.Set<T>;

    private type SharableMessage = Message.Sharable;
    private type Messages = Messages.Messages;
    private type SharableMessages = Messages.Sharable;
    private type Tier = Messages.Tier;

    private let Val = Set.PrincipalVal;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Key = {
        #DM : Principal;
        #Group : Nat
    };
    public type PublicGroupSharable = {
        id : Nat;
        name : Text;
        tier : Tier;
        creator : Principal;
        admins : [Principal];
        members : [Principal];
        messagesCount : (Nat, Nat);
        lastActive : Int;
        creationDate : Int
    };
    public type PrivateGroupSharable = {
        id : Nat;
        name : Text;
        tier : Tier;
        creator : Principal;
        admins : [Principal];
        creationDate : Int
    };

    public type Info = {
        id : Nat;
        name : Text;
        tier : Tier;
        disableLogs : Bool;
        creator : Principal;
        admins : [Principal];
        members : [Principal];
        banned : [Principal];
        messagesCount : (Nat, Nat);
        creationDate : Int
    };

    /// CHAT ////// GROUP ////////////

    private type Self = Group;

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

    public type Sharable = {
        #Public : PublicGroupSharable;
        #Private : PrivateGroupSharable;
        #JoinedPrivate : PublicGroupSharable
    };
    public type PrivateSharable = {
        id : Key;
        name : Text;
        tier : Tier;
        lastMessage : SharableMessage
    };

    public func init(name : Text, disableLogs : Bool, isPublic : Bool, creator : Principal, getNow : () -> Int) : Self = {
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
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func addMember(__ : Self, member : Principal) {
        Set.put(__.members, Val(member))
    };
    public func removeMember(__ : Self, member : Principal) {
        Set.delete(__.members, Val(member))
    };
    public func addAdmin(__ : Self, admin : Principal) {
        Set.put(__.admins, Val(admin))
    };
    public func removeAdmin(__ : Self, admin : Principal) {
        Set.delete(__.admins, Val(admin))
    };
    public func banMember(__ : Self, member : Principal) {
        switch (__.banned) {
            case (null) E.f(#NOT_VALID("Channel"), "Only public channels can ban members");
            case (?banned) Set.put(banned, Val(member))
        }
    };
    public func unbanMember(__ : Self, member : Principal) {
        switch (__.banned) {
            case (null) E.f(#NOT_VALID("Channel"), "Only public channels can unban members");
            case (?banned) Set.delete(banned, Val(member))
        }
    };

    public func disableLogs(__ : Self) {
        __.disableLogs := true
    };
    public func enableLogs(__ : Self) {
        __.disableLogs := false
    };
    public func setName(__ : Self, name : Text) {
        __.name := name
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func isPrivate(__ : Self) : Bool = switch (__.banned) {
        case (null) false;
        case (?_) true
    };
    public func isPrivateNotMember(__ : Self, member : Principal) : Bool = switch (__.banned) {
        case (null) false;
        case (?_) Set.excludes(__.members, Val(member))
    };
    public func isCreator(__ : Self, creator : Principal) : Bool = __.creator == creator;
    public func isAdmin(__ : Self, admin : Principal) : Bool = Set.includes(__.admins, Val(admin));
    public func isMember(__ : Self, member : Principal) : Bool = Set.includes(__.members, Val(member));
    public func isBanned(__ : Self, member : Principal) : Bool = switch (__.banned) {
        case (null) false;
        case (?banned) Set.includes(banned, Val(member))
    };

    public func containsPattern(__ : Self, pattern : { #text : Text }) : Bool = Text.contains(Text.toLowercase(__.name), pattern);

    public func getInfo(__ : Self, id : Nat) : Info = {
        id = id;
        name = __.name;
        tier = __.tier;
        disableLogs = __.disableLogs;
        creator = __.creator;
        admins = Set.toArray(__.admins);
        members = Set.toArray(__.members);
        banned = switch (__.banned) {
            case (null)[];
            case (?banned) Set.toArray(banned)
        };
        messagesCount = (Messages.size(__.messages), Messages.messagesLimitPerTier(__.tier));
        creationDate = __.creationDate
    };

    public func toSharable(__ : Self, id : Nat, caller : ?Principal) : Sharable = switch (__.banned, caller) {
        case (null, _) #Public({
            id;
            name = __.name;
            tier = __.tier;
            creator = __.creator;
            admins = Set.toArray(__.admins);
            members = Set.toArray(__.members);
            messagesCount = (Messages.size(__.messages), Messages.messagesLimitPerTier(__.tier));
            lastActive = Messages.lastActive(__.messages);
            creationDate = __.creationDate
        });
        case (?_, null) #Private({
            id;
            name = __.name;
            tier = __.tier;
            creator = __.creator;
            admins = Set.toArray(__.admins);
            creationDate = __.creationDate
        });
        case (?_, ?caller) switch (Set.includes(__.members, Val(caller))) {
            case (true) #JoinedPrivate({
                id;
                name = __.name;
                tier = __.tier;
                creator = __.creator;
                admins = Set.toArray(__.admins);
                members = Set.toArray(__.members);
                messagesCount = (Messages.size(__.messages), Messages.messagesLimitPerTier(__.tier));
                lastActive = Messages.lastActive(__.messages);
                creationDate = __.creationDate
            });
            case (false) #Private({
                id;
                name = __.name;
                tier = __.tier;
                creator = __.creator;
                admins = Set.toArray(__.admins);
                creationDate = __.creationDate
            })
        }
    };
    public func toPrivateSharable(__ : Self, id : Nat) : PrivateSharable = {
        id = #Group(id);
        name = __.name;
        tier = __.tier;
        lastMessage = Messages.getLastMessage(__.messages)
    }
}
