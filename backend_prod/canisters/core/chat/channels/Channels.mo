import Channel "../channels/Channel";
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

    private type PrivateSharable = Channel.PrivateSharable;
    private type InfoSharable = Channel.InfoSharable;
    private type Channel = Channel.Channel;
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
        case (#ascending) func((_, a), (_, b)) = Int.compare(Channel.lastActive(a), Channel.lastActive(b));
        case (#descending) func((_, a), (_, b)) = Int.compare(Channel.lastActive(b), Channel.lastActive(a))
    };

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Category = {
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
    public type PublicSharable = [PublicSharableChannel];
    public type PrivateSharable = [PrivateSharableChannel];

    public func init() : Self = Vector.new();

    /// PUBLIC ////// MODIFIERS ////////////

    /// PUBLIC ////// ACCESSORS ////////////

    public func channel(__ : Self, key : Text) : Channel = switch (Map.get(__, Key(key))) {
        case (?channel) channel;
        case (null) E.f(#NOT_EXISTED("Channel"), "Attempted to retrieve a non-existent channel with key " # key)
    };
    public func getChannelPublic(__ : Self, key : Text) : PublicSharableChannel {
        Channel.getChannelPublic(channel(__, key), key)
    };
    public func getChannelsPublic(__ : Self, filter : PublicFilter, sort : Sorted<PublicSort>, getUserChannels : (Principal) -> List<Text>) : PublicSharable {
        var filtered : ?[Entry] = null;
        let toEntry : (Text) -> Entry = func(key) = (key, channel(__, key));
        let toSharable : (Entry) -> SharableChannel = func(i, e) = Channel.toSharable(e, i);

        switch (filter.creator) {
            case (null) {};
            case (?creator) filtered := ?List.toArrayMap<Text, Entry>(getUserChannels(creator), toEntry)
        };
        switch (filter.status, filtered) {
            case (null, _) {};
            case (?status, null) filtered := ?Map.getEntriesFilterMap<Text, Channel, Entry>(__, func(x) = switch (_status(status)(x)) { case (true) ?x; case (false) null });
            case (?status, ?prevResult) filtered := ?Array.filter<Entry>(prevResult, _status(status))
        };
        switch (filter.capitalRaised, filtered) {
            case (null, _) {};
            case (?capitalRaised, null) filtered := ?Map.getEntriesFilterMap<Text, Channel, Entry>(__, func(x) = switch (_capitalRaised(capitalRaised)(x)) { case (true) ?x; case (false) null });
            case (?capitalRaised, ?prevResult) filtered := ?Array.filter<Entry>(prevResult, _capitalRaised(capitalRaised))
        };

        switch (sort.by, sort.order, filtered) {
            case (#recent, #ascending, null) Map.getEntriesMap<Text, Channel, SharableChannel>(__, toSharable);
            case (#recent, #descending, null) Map.getEntriesRevMap<Text, Channel, SharableChannel>(__, toSharable);
            case (#icpPaid, order, null) Array.sort<SharableChannel>(Map.getEntriesMap<Text, Channel, SharableChannel>(__, toSharable), _icpPaidNormal(order));
            case (#recent, #ascending, ?unsorted) Array.map<Entry, SharableChannel>(unsorted, toSharable);
            case (#recent, #descending, ?unsorted) Array.mapRev<Entry, SharableChannel>(unsorted, toSharable);
            case (#icpPaid, order, ?unsorted) Array.sort<SharableChannel>(Array.map<Entry, SharableChannel>(unsorted, toSharable), _icpPaidNormal(order))
        }
    };

    public func getChannelPrivate(__ : Self, key : Text) : PrivateSharableChannel {
        Channel.getChannelPrivate(channel(__, key), key)
    };
    public func getChannelsPrivate(__ : Self, filter : PrivateFilter, sort : Sorted<PrivateSort>, userChannels : List<Text>) : PrivateSharable {
        let toEntry : (Text) -> Entry = func(key) = (key, channel(__, key));
        let toSharable : (Entry) -> PrivateSharableChannel = func(i, e) = Channel.toPrivateSharable(e, i);

        var filtered : [Entry] = List.toArrayMap<Text, Entry>(userChannels, toEntry);

        switch (filter.status) {
            case (null) {};
            case (?status) filtered := Array.filter<Entry>(filtered, _status(status))
        };
        switch (filter.capitalRaised) {
            case (null) {};
            case (?capitalRaised) filtered := Array.filter<Entry>(filtered, _capitalRaised(capitalRaised))
        };

        switch (sort.by, sort.order) {
            case (#recent, #ascending) Array.map<Entry, PrivateSharableChannel>(filtered, toSharable);
            case (#recent, #descending) Array.mapRev<Entry, PrivateSharableChannel>(filtered, toSharable);
            case (#icpPaid, order) Array.sort<PrivateSharableChannel>(Array.map<Entry, PrivateSharableChannel>(filtered, toSharable), _icpPaidPrivate(order))
        }
    }
}
