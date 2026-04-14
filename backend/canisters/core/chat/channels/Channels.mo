import Channel "Channel";
import Groups "../groups/Groups";
import Group "../groups/Group";
import DMs "../dms/DMs";
import DM "../dms/DM";
import Message "../messages/Message";
import Messages "../messages/Messages";
import User "../users/User";

import E "../../../common/Errors";

import Array "../../../library/Array";
import Base "../../../library/Base";
import Iter "../../../library/Iter";
import List "../../../library/List";
import Set "../../../library/Set";
import Tree "../../../library/Tree";
import Vector "../../../library/Vector";

import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Text "mo:base/Text";
import Principal "mo:base/Principal";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type List<T> = List.List<T>;
    private type Vector<T> = Vector.Vector<T>;
    private type Set<T> = Set.Set<T>;
    private type Iter<T> = Iter.Iter<T>;
    private type Tree<K, V> = Tree.Tree<K, V>;

    private type SharableChannel = Channel.Sharable;
    private type Channel = Channel.Channel;
    private type Group = Group.Group;
    private type Groups = Groups.Groups;
    private type DM = DM.DM;
    private type DMs = DMs.DMs;
    private type Messages = Messages.Messages;
    private type User = User.User;
    private type SharableMessage = Message.Sharable;
    private type Tier = Message.Tier;
    private type PlainDEK = Message.PlainDEK;
    private type EncryptedDEK = Message.EncryptedDEK;
    private type Signature = Message.Signature;
    private type MemberEncryptedDEK = Message.MemberEncryptedDEK;

    private type Compare<T> = Base.Compare<T>;
    private type Sorted<T> = Base.Sort<T>;
    private type Order = Base.Order;

    private let Val = Set.PrincipalVal;

    private func _timestamp(message : SharableMessage) : Int = switch (message) {
        case (#Sendable({ timestamp })) timestamp;
        case (#Log({ timestamp })) timestamp
    };
    private func _lastActive(orderBy : Order) : Compare<SharableChannel> = switch (orderBy) {
        case (#ascending) func(a, b) = Int.compare(_timestamp(a.lastMessage), _timestamp(b.lastMessage));
        case (#descending) func(a, b) = Int.compare(_timestamp(b.lastMessage), _timestamp(a.lastMessage))
    };

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Key = {
        #Group : Nat;
        #DM : Text
    };

    public type Category = {
        #Public;
        #Private;
        #DM
    };

    public type Filter = {
        tier : ?Tier;
        category : ?Category;
        q : ?Text
    };
    public type Sort = {
        #lastActive
    };

    /// CHAT ////// CHANNELS ////////////

    private type Self = Channels;

    public type Channels = {
        dms : DMs;
        groups : Groups
    };
    public type Sharable = [SharableChannel];

    public func init() : Self = {
        dms = DMs.init();
        groups = Groups.init()
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func createDM(__ : Self, creator : (Principal, EncryptedDEK), to : (Principal, EncryptedDEK), getNow : () -> Int) : Text {
        DMs.create(__.dms, creator, to, getNow)
    };
    public func createPublicGroup(__ : Self, name : Text, disableLogs : Bool, creator : Principal, admins : [Principal], members : [Principal], plainDek : PlainDEK, getNow : () -> Int) : Nat {
        Groups.createPublic(__.groups, name, disableLogs, creator, admins, members, plainDek, getNow)
    };
    public func createPrivateGroup(__ : Self, name : Text, disableLogs : Bool, creator : Principal, admins : [Principal], members : [(Principal, EncryptedDEK)], getNow : () -> Int) : Nat {
        Groups.createPrivate(__.groups, name, disableLogs, creator, admins, members, getNow)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func dm(__ : Self, a : Principal, b : Principal) : DM = DMs.dm(__.dms, a, b);
    public func group(__ : Self, id : Nat) : Group = Groups.group(__.groups, id);

    public func getChannels(__ : Self, filter : Filter, sort : Sorted<Sort>, (caller, user) : (Principal, User), getUsername : (Principal) -> Text) : Sharable {
        switch (filter.category, filter.tier, filter.q) {
            case (null, null, null) Array.sort(
                Iter.toArrayMap<{ #A : Principal; #B : Nat }, SharableChannel>(
                    Iter.concatTwo<Principal, Nat>(Set.vals(user.dms), Set.vals(user.groups)),
                    func(e) = switch (e) {
                        case (#A(i)) DMs.getPrivateDM(__.dms, (i, getUsername(i)), caller);
                        case (#B(i)) Groups.getPrivateGroup(__.groups, i, caller)
                    },
                ),
                _lastActive(sort.order),
            );
            case (?category, null, null) switch (category) {
                case (#DM) Array.sort(
                    Set.toArrayMap<Principal, SharableChannel>(
                        user.dms,
                        func(i) = DMs.getPrivateDM(__.dms, (i, getUsername(i)), caller),
                    ),
                    _lastActive(sort.order),
                );
                case (c) Array.sort(
                    Set.toArrayFilterMap<Nat, SharableChannel>(
                        user.groups,
                        func(i) {
                            let group = Groups.group(__.groups, i);
                            switch (Group.isPrivate(group), c) {
                                case (false, #Public) ?Group.toPrivateSharable(group, i, caller);
                                case (true, #Private) ?Group.toPrivateSharable(group, i, caller);
                                case (_, _) null
                            }
                        },
                    ),
                    _lastActive(sort.order),
                )
            };
            case (null, ?tier, null) Array.sort(
                Iter.toArrayFilterMap<{ #A : Principal; #B : Nat }, SharableChannel>(
                    Iter.concatTwo<Principal, Nat>(Set.vals(user.dms), Set.vals(user.groups)),
                    func(e) = switch (e) {
                        case (#A(i)) {
                            let dm = DMs.dm(__.dms, caller, i);
                            switch (dm.tier == tier) {
                                case (true) ?DM.toPrivateSharable(dm, (i, getUsername(i)), caller);
                                case (false) null
                            }
                        };
                        case (#B(i)) {
                            let group = Groups.group(__.groups, i);
                            switch (group.tier == tier) {
                                case (true) ?Group.toPrivateSharable(group, i, caller);
                                case (false) null
                            }
                        }
                    },
                ),
                _lastActive(sort.order),
            );
            case (null, null, ?q) Array.sort(
                Iter.toArrayFilterMap<{ #A : Principal; #B : Nat }, SharableChannel>(
                    Iter.concatTwo<Principal, Nat>(Set.vals(user.dms), Set.vals(user.groups)),
                    func(i) = switch (i) {
                        case (#A(i)) {
                            let name = getUsername(i);
                            switch (Text.contains(Text.toLowercase(name), #text(Text.toLowercase(q)))) {
                                case (true) ?DMs.getPrivateDM(__.dms, (i, name), caller);
                                case (false) null
                            }
                        };
                        case (#B(i)) {
                            let group = Groups.group(__.groups, i);
                            switch (Text.contains(Text.toLowercase(group.name), #text(Text.toLowercase(q)))) {
                                case (true) ?Group.toPrivateSharable(group, i, caller);
                                case (false) null
                            }
                        }
                    },
                ),
                _lastActive(sort.order),
            );
            case (?category, ?tier, null) switch (category) {
                case (#DM) Array.sort(
                    Set.toArrayFilterMap<Principal, SharableChannel>(
                        user.dms,
                        func(i) {
                            let dm = DMs.dm(__.dms, caller, i);
                            switch (dm.tier == tier) {
                                case (true) ?DM.toPrivateSharable(dm, (i, getUsername(i)), caller);
                                case (false) null
                            }
                        },
                    ),
                    _lastActive(sort.order),
                );
                case (c) Array.sort(
                    Set.toArrayFilterMap<Nat, SharableChannel>(
                        user.groups,
                        func(i) {
                            let group = Groups.group(__.groups, i);
                            switch (Group.isPrivate(group), c, group.tier == tier) {
                                case (false, #Public, true) ?Group.toPrivateSharable(group, i, caller);
                                case (true, #Private, true) ?Group.toPrivateSharable(group, i, caller);
                                case (_, _, _) null
                            }
                        },
                    ),
                    _lastActive(sort.order),
                )
            };
            case (?category, null, ?q) switch (category) {
                case (#DM) Array.sort(
                    Set.toArrayFilterMap<Principal, SharableChannel>(
                        user.dms,
                        func(i) {
                            let name = getUsername(i);
                            switch (Text.contains(Text.toLowercase(name), #text(Text.toLowercase(q)))) {
                                case (true) ?DMs.getPrivateDM(__.dms, (i, name), caller);
                                case (false) null
                            }
                        },
                    ),
                    _lastActive(sort.order),
                );
                case (c) Array.sort(
                    Set.toArrayFilterMap<Nat, SharableChannel>(
                        user.groups,
                        func(i) {
                            let group = Groups.group(__.groups, i);
                            switch (Group.isPrivate(group), c, Text.contains(Text.toLowercase(group.name), #text(Text.toLowercase(q)))) {
                                case (false, #Public, true) ?Group.toPrivateSharable(group, i, caller);
                                case (true, #Private, true) ?Group.toPrivateSharable(group, i, caller);
                                case (_, _, _) null
                            }
                        },
                    ),
                    _lastActive(sort.order),
                )
            };
            case (null, ?tier, ?q) Array.sort(
                Iter.toArrayFilterMap<{ #A : Principal; #B : Nat }, SharableChannel>(
                    Iter.concatTwo<Principal, Nat>(Set.vals(user.dms), Set.vals(user.groups)),
                    func(i) = switch (i) {
                        case (#A(i)) {
                            let dm = DMs.dm(__.dms, caller, i);
                            switch (dm.tier == tier) {
                                case (true) {
                                    let name = getUsername(i);
                                    switch (Text.contains(Text.toLowercase(name), #text(Text.toLowercase(q)))) {
                                        case (true) ?DM.toPrivateSharable(dm, (i, name), caller);
                                        case (false) null
                                    }
                                };
                                case (false) null
                            }
                        };
                        case (#B(i)) {
                            let group = Groups.getPrivateGroup(__.groups, i, caller);
                            switch (group.tier == tier) {
                                case (true) switch (Text.contains(Text.toLowercase(group.name), #text(Text.toLowercase(q)))) {
                                    case (true) ?group;
                                    case (false) null
                                };
                                case (false) null
                            }
                        }
                    },
                ),
                _lastActive(sort.order),
            );
            case (?category, ?tier, ?q) switch (category) {
                case (#DM) Array.sort(
                    Set.toArrayFilterMap<Principal, SharableChannel>(
                        user.dms,
                        func(i) {
                            let dm = DMs.getPrivateDM(__.dms, (i, getUsername(i)), caller);
                            switch (dm.tier == tier) {
                                case (true) switch (Text.contains(Text.toLowercase(getUsername(i)), #text(Text.toLowercase(q)))) {
                                    case (true) ?dm;
                                    case (false) null
                                };
                                case (false) null
                            }
                        },
                    ),
                    _lastActive(sort.order),
                );
                case (c) Array.sort(
                    Set.toArrayFilterMap<Nat, SharableChannel>(
                        user.groups,
                        func(i) {
                            let group = Groups.group(__.groups, i);
                            switch (group.tier == tier, Group.isPrivate(group), c) {
                                case (true, false, #Public) switch (Text.contains(Text.toLowercase(group.name), #text(Text.toLowercase(q)))) {
                                    case (true) ?Group.toPrivateSharable(group, i, caller);
                                    case (false) null
                                };
                                case (true, true, #Private) switch (Text.contains(Text.toLowercase(group.name), #text(Text.toLowercase(q)))) {
                                    case (true) ?Group.toPrivateSharable(group, i, caller);
                                    case (false) null
                                };
                                case (_, _, _) null
                            }
                        },
                    ),
                    _lastActive(sort.order),
                )
            }
        }
    }

}
