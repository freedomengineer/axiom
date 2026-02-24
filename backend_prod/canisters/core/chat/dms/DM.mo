import Message "../messages/Message";
import Messages "../messages/Messages";

import Base "../../../library/Base";
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

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Info = {
        id : Nat;
        tier : Tier;
        members : [Principal];
        messagesCount : (Nat, Nat);
        creationDate : Int
    };

    /// CHAT ////// CHANNEL ////////////

    private type Self = DM;

    public type DM = {
        var tier : Tier;
        members : [Principal];
        messages : Messages;
        creationDate : Int
    };
    public type PrivateSharable = {
        id : Nat;
        name : ?Text;
        tier : Tier;
        lastMessage : SharableMessage
    };

    public func init(creator : Principal, to : Principal) : Self = {
        var tier = #L32;
        members = [creator, to];
        messages = Messages.init();
        creationDate = Time.now()
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func getInfo(__ : Self, id : Nat) : Info = {
        id = id;
        tier = __.tier;
        members = __.members;
        messagesCount = (Messages.size(__.messages), Messages.messagesLimitPerTier(__.tier));
        creationDate = __.creationDate
    };

    public func toPrivateSharable(__ : Self, id : Nat) : PrivateSharable = {
        id;
        name = null;
        tier = __.tier;
        lastMessage = Messages.getLastMessage(__.messages)
    }
}
