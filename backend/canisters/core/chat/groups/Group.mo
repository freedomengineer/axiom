import Message "../messages/Message";
import Messages "../messages/Messages";

import E "../../../common/Errors";

import Array "../../../library/Array";
import Base "../../../library/Base";
import Iter "../../../library/Iter";
import List "../../../library/List";
import Map "../../../library/Map";
import MultiDimArray "../../../library/MultiDimArray";
import Set "../../../library/Set";

import Text "mo:base/Text";
import Time "mo:base/Time";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type List<T> = List.List<T>;
    private type Set<T> = Set.Set<T>;
    private type Map<K, V> = Map.Map<K, V>;
    private type Iter<T> = Iter.Iter<T>;

    private type SharableMessage = Message.Sharable;
    private type Messages = Messages.Messages;
    private type SharableMessages = Messages.Sharable;
    private type Tier = Messages.Tier;
    private type Direction = Messages.Direction;
    private type Cursor = Messages.Cursor;
    private type Version = Message.Version;
    private type EncryptedDEK = Message.EncryptedDEK;
    private type PlainDEK = Message.PlainDEK;
    private type DEK = Message.DEK;
    private type IV = Message.IV;
    private type Signature = Message.Signature;
    private type MemberDEKs = Message.MemberDEKs;
    private type MemberDEKsSharable = Message.MemberDEKsSharable;
    private type MemberEncryptedDEK = Message.MemberEncryptedDEK;

    private let Val = Set.PrincipalVal;
    private let PrincipalKey = Map.PrincipalKey;
    private let NatKey = Map.NatKey;

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
        creationDate : Int;

        members : [Principal];
        messagesCount : (Nat, Nat);
        lastActive : Int
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
        creator : Principal;
        admins : [Principal];
        creationDate : Int;

        members : [Principal];
        messagesCount : (Nat, Nat);
        lastActive : Int;

        disableLogs : Bool;
        banned : [Principal];
        versionRange : (Nat, Nat);
        callerDeks : ?MemberDEKsSharable
    };

    /// CHAT ////// GROUP ////////////

    private type Self = Group;

    public type Group = {
        var name : Text;
        var tier : Tier;
        var disableLogs : Bool;
        creator : Principal;
        admins : Set<Principal>;
        members : Map<Principal, MemberDEKs>;
        var banned : ?Set<Principal>; // only not null for public channels
        messages : Messages;
        var keyVersion : Version;
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
        lastMessage : SharableMessage;
        keyVersion : Version;
        callerDeks : MemberDEKsSharable
    };

    public func initPublic(name : Text, disableLogs : Bool, creator : Principal, admins : [Principal], members : [Principal], plainDek : PlainDEK, getNow : () -> Int) : Self {
        let adminSet : Set<Principal> = Set.fromArray(Array.map<Principal, Set.Val<Principal>>(admins, func(x) = Val(x)));
        let memberSet : Set<Principal> = Set.fromArray(Array.map<Principal, Set.Val<Principal>>(members, func(x) = Val(x)));

        if (Set.excludes(adminSet, Val(creator))) E.f(#NOT_VALID("Admin"), "Creator is not in the admins list");
        if (Set.excludes(memberSet, Val(creator))) E.f(#NOT_VALID("Member"), "Creator is not in the members list");

        for (admin in Set.vals(adminSet)) {
            if (Set.excludes(memberSet, Val(admin))) E.f(#NOT_VALID("Admin"), "Admin " # debug_show admin # " is not in the members list")
        };

        let memberMap : Map<Principal, MemberDEKs> = Map.fromEntries(
            Array.map<Principal, (Map.Key<Principal>, MemberDEKs)>(
                members,
                func(x) = (PrincipalKey(x), Map.make<Version, DEK>(NatKey(1), #Plain(plainDek))),
            )
        );

        {
            var tier = #L32;
            var name;
            var disableLogs;
            creator;
            admins = adminSet;
            members = memberMap;
            var banned = ?Set.new<Principal>();
            var keyVersion = 1;
            messages = Messages.init();
            creationDate = getNow()
        }
    };
    public func initPrivate(name : Text, disableLogs : Bool, creator : Principal, admins : [Principal], members : [(Principal, EncryptedDEK)], getNow : () -> Int) : Self {
        let adminSet : Set<Principal> = Set.fromArray(Array.map<Principal, Set.Val<Principal>>(admins, func(x) = Val(x)));
        let memberMap : Map<Principal, MemberDEKs> = Map.fromEntries(
            Array.map<(Principal, EncryptedDEK), (Map.Key<Principal>, MemberDEKs)>(
                members,
                func((i, e)) = (PrincipalKey(i), Map.make<Version, DEK>(NatKey(1), #Encrypted(e))),
            )
        );

        if (Set.excludes(adminSet, Val(creator))) E.f(#NOT_VALID("Admin"), "Creator is not in the admins list");
        if (Map.excludes(memberMap, PrincipalKey(creator))) E.f(#NOT_VALID("Member"), "Creator is not in the members list");

        for (admin in Set.vals(adminSet)) {
            if (Map.excludes(memberMap, PrincipalKey(admin))) E.f(#NOT_VALID("Admin"), "Admin " # debug_show admin # " is not in the members list")
        };

        {
            var tier = #L32;
            var name;
            var disableLogs;
            creator;
            admins = adminSet;
            members = memberMap;
            var banned = ?Set.new<Principal>();
            var keyVersion = 1;
            messages = Messages.init();
            creationDate = getNow()
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
            for ((member, memberDeks) in Map.entries(__.members)) {
                for (version in Iter.range(firstVersion, firstVersionAfter - 1)) {
                    Map.delete(memberDeks, NatKey(version))
                }
            }
        }
    };

    public func rotate(__ : Self, membersDek : [(Principal, MemberEncryptedDEK)]) {
        let membersNewDek : Map<Principal, MemberEncryptedDEK> = Map.fromEntries(
            Array.map<(Principal, MemberEncryptedDEK), (Map.Key<Principal>, MemberEncryptedDEK)>(membersDek, func((i, e)) = (PrincipalKey(i), e))
        );
        if (Map.size(membersNewDek) != (Map.size(__.members))) E.f(#NOT_VALID("Member"), "New DEKs for all existing members' DEKs must be provided");

        let lastVersion : Version = switch (MultiDimArray.isEmpty(__.messages)) {
            case (true) 1;
            case (false) Message.keyVersion(Messages.lastMessage(__.messages))
        };
        __.keyVersion += lastVersion + 1; // if no new messages since last rotation, just override

        for ((member, dek) in Map.entries(membersNewDek)) {
            switch (Map.get(__.members, PrincipalKey(member)), dek.0 == __.keyVersion) {
                case (_, false) E.f(#NOT_VALID("Member"), "Next DEK version for member " # debug_show member # " is " # debug_show __.keyVersion # ", not " # debug_show dek.0);
                case (null, _) E.f(#NOT_EXISTED("Member"), "Member to rotate " # debug_show member # " does not exist");
                case (?memberDeks, true) Map.put(memberDeks, NatKey(__.keyVersion), #Encrypted(dek.1))
            }
        }
    };

    public func publicGroup(__ : Self, newDek : PlainDEK) {
        if (not isPrivate(__)) E.f(#NOT_VALID("Group"), "This is already a public group");

        let lastVersion : Version = switch (MultiDimArray.isEmpty(__.messages)) {
            case (true) 1;
            case (false) Message.keyVersion(Messages.lastMessage(__.messages))
        };
        __.keyVersion += lastVersion + 1; // if no new messages since last rotation, just override

        for ((member, memberDeks) in Map.entries(__.members)) {
            Map.put(memberDeks, NatKey(__.keyVersion), #Plain(newDek))
        };
        __.banned := ?Set.new<Principal>()
    };
    public func privateGroup(__ : Self, membersDek : [(Principal, MemberEncryptedDEK)]) {
        if (isPrivate(__)) E.f(#NOT_VALID("Group"), "This is already a private group");

        let membersNewDek : Map<Principal, MemberEncryptedDEK> = Map.fromEntries(
            Array.map<(Principal, MemberEncryptedDEK), (Map.Key<Principal>, MemberEncryptedDEK)>(membersDek, func((i, e)) = (PrincipalKey(i), e))
        );
        if (Map.size(membersNewDek) != Map.size(__.members)) E.f(#NOT_VALID("Member"), "New DEKs for all existing members' DEKs must be provided");

        let lastVersion : Version = switch (MultiDimArray.isEmpty(__.messages)) {
            case (true) 1;
            case (false) Message.keyVersion(Messages.lastMessage(__.messages))
        };
        __.keyVersion += lastVersion + 1; // if no new messages since last rotation, just override

        for ((member, (version, dek)) in Map.entries(membersNewDek)) {
            switch (Map.get(__.members, PrincipalKey(member)), version == __.keyVersion) {
                case (_, false) E.f(#NOT_VALID("Member"), "Next DEK version for member " # debug_show member # " is " # debug_show __.keyVersion # ", not " # debug_show version);
                case (null, _) E.f(#NOT_EXISTED("Member"), "Member to rotate " # debug_show member # " does not exist");
                case (?memberDeks, true) Map.put(memberDeks, NatKey(__.keyVersion), #Encrypted(dek))
            }
        };
        __.banned := null
    };

    public func joinPublic(__ : Self, member : Principal) : MemberDEKsSharable {
        let plainDeks : Map<Version, DEK> = Map.new();
        for (dek in Map.entries(Map.unwrap(__.members, PrincipalKey(__.creator)))) {
            switch (dek) {
                case (_, #Encrypted(_)) {};
                case (version, plainDek) Map.put(plainDeks, NatKey(version), plainDek)
            }
        };
        Map.put<Principal, MemberDEKs>(__.members, PrincipalKey(member), plainDeks);
        Map.getEntries(plainDeks)
    };
    public func leavePublic(__ : Self, member : Principal) {
        Map.delete(__.members, PrincipalKey(member))
    };

    public func addMembersPublic(__ : Self, members : [Principal]) : Set<Principal> {
        let membersToAdd : Set<Principal> = Set.new();
        for (member in members.vals()) {
            if (Map.includes(__.members, PrincipalKey(member))) E.f(#ALREADY_EXISTED("Member"), "Member " # debug_show member # " already exists");
            Set.put(membersToAdd, Val(member))
        };

        let plainDeks : Map<Version, DEK> = Map.new();
        for (dek in Map.entries(Map.unwrap(__.members, PrincipalKey(__.creator)))) {
            switch (dek) {
                case (_, #Encrypted(_)) {};
                case (version, plainDek) Map.put(plainDeks, NatKey(version), plainDek)
            }
        };
        for (member in Set.vals(membersToAdd)) {
            Map.put<Principal, MemberDEKs>(__.members, PrincipalKey(member), plainDeks)
        };
        membersToAdd
    };
    public func addMembersPrivate(__ : Self, membersDeks : [(Principal, MemberDEKsSharable)]) : Map<Principal, MemberDEKs> {
        let (firstVersion, lastVersion) : (Version, Version) = switch (MultiDimArray.isEmpty(__.messages)) {
            case (true)(1, 1);
            case (false)(Message.keyVersion(Messages.firstMessage(__.messages)), Message.keyVersion(Messages.lastMessage(__.messages)))
        };
        let versionCount : Nat = lastVersion - firstVersion + 1;
        let membersToAdd : Map<Principal, MemberDEKs> = Map.new();

        for ((member, memberDeks) in membersDeks.vals()) {
            if (Map.includes(__.members, PrincipalKey(member))) E.f(#ALREADY_EXISTED("Member"), "Member " # debug_show member # " already exists");
            if (Array.size(memberDeks) != versionCount) E.f(#NOT_VALID("Member"), "Number of DEKs for member " # debug_show member # " must be equal to the number of versions available so far");

            let deks : Map<Version, DEK> = Map.fromEntries(
                Array.map<(Version, DEK), (Map.Key<Version>, DEK)>(memberDeks, func((version, dek)) = (NatKey(version), dek))
            );
            for (version in Iter.range(firstVersion, lastVersion)) {
                if (not Map.includes(deks, NatKey(version))) E.f(#NOT_EXISTED("Member DEK"), "DEK version " # debug_show version # " of member " # debug_show member # " not found")
            };

            Map.put<Principal, MemberDEKs>(membersToAdd, PrincipalKey(member), deks)
        };
        for ((member, memberDeks) in Map.entries(membersToAdd)) {
            Map.put(__.members, PrincipalKey(member), memberDeks)
        };
        membersToAdd
    };

    public func removeMembersPublic(__ : Self, members : [Principal]) : Set<Principal> {
        let membersToRemove : Set<Principal> = Set.fromArray(
            Array.map<Principal, Set.Val<Principal>>(members, func(x) = Val(x))
        );
        for (member in Set.vals(membersToRemove)) {
            Map.delete(__.members, PrincipalKey(member))
        };
        membersToRemove
    };
    public func removeMembersPrivate(__ : Self, members : [Principal], membersDek : [(Principal, MemberEncryptedDEK)]) : Set<Principal> {
        let membersToRemove : Set<Principal> = Set.fromArray(
            Array.map<Principal, Set.Val<Principal>>(members, func(x) = Val(x))
        );
        let membersNewDek : Map<Principal, MemberEncryptedDEK> = Map.fromEntries(
            Array.map<(Principal, MemberEncryptedDEK), (Map.Key<Principal>, MemberEncryptedDEK)>(membersDek, func((i, e)) = (PrincipalKey(i), e))
        );
        if (Map.size(membersNewDek) != (Map.size(__.members) - Set.size(membersToRemove))) E.f(#NOT_VALID("Member"), "New DEKs for all existing members' DEKs must be provided");

        let lastVersion : Version = switch (MultiDimArray.isEmpty(__.messages)) {
            case (true) 1;
            case (false) Message.keyVersion(Messages.lastMessage(__.messages))
        };
        __.keyVersion += lastVersion + 1; // if no new messages since last rotation, just override

        for (member in Set.vals(membersToRemove)) {
            if (not Map.includes(__.members, PrincipalKey(member))) E.f(#NOT_VALID("Member"), "Member to remove " # debug_show member # " does not exist");
            Map.delete(__.members, PrincipalKey(member))
        };

        for ((member, (version, dek)) in Map.entries(membersNewDek)) {
            switch (Map.get(__.members, PrincipalKey(member)), version == __.keyVersion) {
                case (_, false) E.f(#NOT_VALID("Member"), "Next DEK version for member " # debug_show member # " is " # debug_show __.keyVersion # ", not " # debug_show version);
                case (null, _) E.f(#NOT_EXISTED("Member"), "Member to rotate " # debug_show member # " does not exist");
                case (?memberDeks, true) Map.put(memberDeks, NatKey(__.keyVersion), #Encrypted(dek))
            }
        };

        membersToRemove
    };

    // Accept that banning only preventing members from sending messages, they can still read further messages
    public func banMembers(__ : Self, members : [Principal]) : Set<Principal> {
        switch (__.banned) {
            case (null) E.f(#NOT_VALID("Group"), "This is not a public group");
            case (?banned) {
                let membersToBan : Set<Principal> = Set.fromArray(
                    Array.map<Principal, Set.Val<Principal>>(members, func(x) = Val(x))
                );
                for (member in Set.vals(membersToBan)) {
                    Set.put(banned, Val(member));
                    Map.delete(__.members, PrincipalKey(member))
                };
                membersToBan
            }
        }
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

    public func setTier(__ : Self, tier : Tier) {
        __.tier := tier
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

    public func isTier(__ : Self, tier : Tier) : Bool = __.tier == tier;
    public func lastActive(__ : Self) : Int = Messages.lastActive(__.messages);

    public func pullMessages(__ : Self, direction : Direction, cursor : ?Cursor) : [SharableMessage] = Messages.pull(__.messages, direction, cursor);

    public func isPrivate(__ : Self) : Bool = switch (__.banned) {
        case (null) true;
        case (?_) false
    };
    public func isPrivateNotMember(__ : Self, member : Principal) : Bool = switch (__.banned) {
        case (null) Map.excludes(__.members, PrincipalKey(member));
        case (?_) false
    };
    public func isCreator(__ : Self, creator : Principal) : Bool = __.creator == creator;
    public func isAdmin(__ : Self, admin : Principal) : Bool = Set.includes(__.admins, Val(admin));
    public func isMember(__ : Self, member : Principal) : Bool = Map.includes(__.members, PrincipalKey(member));
    public func isBanned(__ : Self, member : Principal) : Bool = switch (__.banned) {
        case (null) false;
        case (?banned) Set.includes(banned, Val(member))
    };

    public func containsPattern(__ : Self, pattern : { #text : Text }) : Bool = Text.contains(Text.toLowercase(__.name), pattern);

    public func toSharable(__ : Self, id : Nat, caller : ?Principal) : Sharable = switch (__.banned, caller) {
        case (?_, _) #Public({
            id;
            name = __.name;
            tier = __.tier;
            creator = __.creator;
            admins = Set.toArray(__.admins);
            members = Map.getKeys(__.members);
            messagesCount = (Messages.size(__.messages), Messages.messagesLimitPerTier(__.tier));
            lastActive = Messages.lastActive(__.messages);
            creationDate = __.creationDate
        });
        case (null, null) #Private({
            id;
            name = __.name;
            tier = __.tier;
            creator = __.creator;
            admins = Set.toArray(__.admins);
            creationDate = __.creationDate
        });
        case (null, ?caller) switch (Map.includes(__.members, PrincipalKey(caller))) {
            case (true) #JoinedPrivate({
                id;
                name = __.name;
                tier = __.tier;
                creator = __.creator;
                admins = Set.toArray(__.admins);
                members = Map.getKeys(__.members);
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
    public func toPrivateSharable(__ : Self, id : Nat, caller : Principal) : PrivateSharable = {
        id = #Group(id);
        name = __.name;
        tier = __.tier;
        lastMessage = Messages.getLastMessage(__.messages);
        keyVersion = __.keyVersion;
        callerDeks = switch (Map.get(__.members, PrincipalKey(caller))) {
            case (?memberDeks) Map.getEntries(memberDeks);
            case (null)[]
        }
    };
    public func getInfo(__ : Self, id : Nat, caller : Principal) : Info = switch (isPrivateNotMember(__, caller)) {
        case (true) E.f(#NOT_VALID("Caller"), "Caller is not a member of the private group");
        case (false)({
            id = id;
            name = __.name;
            tier = __.tier;
            creator = __.creator;
            creationDate = __.creationDate;
            disableLogs = __.disableLogs;
            admins = Set.toArray(__.admins);
            members = Map.getKeys(__.members);
            banned = switch (__.banned) {
                case (null)[];
                case (?banned) Set.toArray(banned)
            };
            messagesCount = (Messages.size(__.messages), Messages.messagesLimitPerTier(__.tier));
            lastActive = Messages.lastActive(__.messages);
            versionRange = (Message.keyVersion(Messages.firstMessage(__.messages)), Message.keyVersion(Messages.lastMessage(__.messages)));
            callerDeks = switch (Map.get(__.members, PrincipalKey(caller))) {
                case (?memberDeks) ?Map.getEntries(memberDeks);
                case (null) ?[]
            }
        })
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectMember(__ : Self, member : Principal) {
        if (isMember(__, member)) return;
        E.f(#NOT_EXISTED("Member"), "Member " # debug_show member # " is not a member of the group")
    };
    public func expectNotMember(__ : Self, member : Principal) {
        if (not isMember(__, member)) return;
        E.f(#ALREADY_EXISTED("Member"), "Member " # debug_show member # " is already a member of the group")
    };
    public func expectAdmin(__ : Self, admin : Principal) {
        if (isAdmin(__, admin)) return;
        E.f(#NOT_EXISTED("Admin"), "Admin " # debug_show admin # " is not an admin of the group")
    };
    public func expectNotAdmin(__ : Self, admin : Principal) {
        if (not isAdmin(__, admin)) return;
        E.f(#ALREADY_EXISTED("Admin"), "Admin " # debug_show admin # " is already an admin of the group")
    };
    public func expectCreator(__ : Self, creator : Principal) {
        if (isCreator(__, creator)) return;
        E.f(#NOT_EXISTED("Creator"), "Creator " # debug_show creator # " is not the creator of the group")
    };
    public func expectNotCreator(__ : Self, creator : Principal) {
        if (not isCreator(__, creator)) return;
        E.f(#ALREADY_EXISTED("Creator"), "Creator " # debug_show creator # " is already the creator of the group")
    };
    public func expectBanned(__ : Self, member : Principal) {
        if (isBanned(__, member)) return;
        E.f(#NOT_EXISTED("Banned"), "Member " # debug_show member # " is not banned from the group")
    };
    public func expectNotBanned(__ : Self, member : Principal) {
        if (not isBanned(__, member)) return;
        E.f(#ALREADY_EXISTED("Banned"), "Member " # debug_show member # " is already banned from the group")
    };
    public func expectPrivate(__ : Self) {
        if (isPrivate(__)) return;
        E.f(#NOT_VALID("Group"), "This is not a private group")
    };
    public func expectPublic(__ : Self) {
        if (not isPrivate(__)) return;
        E.f(#NOT_VALID("Group"), "This is not a public group")
    }
}
