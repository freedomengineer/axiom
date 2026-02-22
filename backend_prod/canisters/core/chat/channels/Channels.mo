import Channel "Channel";
import Message "../messages/Message";
import Messages "../messages/Messages";

import E "../../../common/Errors";

import Array "../../../library/Array";
import Base "../../../library/Base";
import List "../../../library/List";
import Set "../../../library/Set";
import Vector "../../../library/Vector";

import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Text "mo:base/Text";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type List<T> = List.List<T>;
    private type Vector<T> = Vector.Vector<T>;

    private type Channel = Channel.Channel;
    private type GroupChannel = Channel.Group;
    private type SharableChannel = Channel.Sharable;
    private type Messages = Messages.Messages;
    private type Tier = Messages.Tier;

    private type Compare<T> = Base.Compare<T>;
    private type Sorted<T> = Base.Sort<T>;
    private type Order = Base.Order;

    private type PublicEntry = (Nat, GroupChannel);
    private type PrivateEntry = (Nat, Channel);

    private let Val = Set.PrincipalVal;

    private func _publicRecent(orderBy : Order) : Compare<PublicEntry> = switch (orderBy) {
        case (#ascending) func((_, a), (_, b)) = Int.compare(a.creationDate, b.creationDate);
        case (#descending) func((_, a), (_, b)) = Int.compare(b.creationDate, a.creationDate)
    };
    private func _publicName(orderBy : Order) : Compare<PublicEntry> = switch (orderBy) {
        case (#ascending) func((_, a), (_, b)) = Text.compare(a.name, b.name);
        case (#descending) func((_, a), (_, b)) = Text.compare(b.name, a.name)
    };
    private func _publicMembers(orderBy : Order) : Compare<PublicEntry> = switch (orderBy) {
        case (#ascending) func((_, a), (_, b)) = Nat.compare(Set.size(a.members), Set.size(b.members));
        case (#descending) func((_, a), (_, b)) = Nat.compare(Set.size(b.members), Set.size(a.members))
    };
    private func _publicMessages(orderBy : Order) : Compare<PublicEntry> = switch (orderBy) {
        case (#ascending) func((_, a), (_, b)) = Nat.compare(Messages.size(a.messages), Messages.size(b.messages));
        case (#descending) func((_, a), (_, b)) = Nat.compare(Messages.size(b.messages), Messages.size(a.messages))
    };

    private func _privateLatest(orderBy : Order) : Compare<PrivateEntry> = switch (orderBy) {
        case (#ascending) func((_, a), (_, b)) = Int.compare(Channel.lastTimestamp(a), Channel.lastTimestamp(b));
        case (#descending) func((_, a), (_, b)) = Int.compare(Channel.lastTimestamp(b), Channel.lastTimestamp(a))
    };

    /// PUBLIC ////// DECLARATIONS ////////////

    public type PublicCategory = {
        #Public;
        #Private
    };
    public type PrivateCategory = {
        #DM;
        #Public;
        #Private
    };

    public type PublicFilter = {
        tier : ?Tier;
        creator : ?Principal;
        admin : ?Principal;
        member : ?Principal;
        category : PublicCategory;
        q : ?Text
    };
    public type PublicSort = {
        #recent;
        #name;
        #tier;
        #members;
        #messages
    };

    public type PrivateFilter = {
        tier : ?Tier;
        creator : ?Principal;
        admin : ?Principal;
        member : ?Principal;
        category : PrivateCategory;
        q : ?Text
    };
    public type PrivateSort = {
        #latest;
        #name;
        #tier;
        #members;
        #messages
    };

    /// CHAT ////// CHANNELS ////////////

    private type Self = Channels;

    public type Channels = Vector<?Channel>;
    public type Sharable = [SharableChannel];

    public func init() : Self = Vector.new();

    /// PUBLIC ////// MODIFIERS ////////////

    /// PUBLIC ////// ACCESSORS ////////////

}
