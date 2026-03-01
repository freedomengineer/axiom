import DM "../dms/DM";
import Group "../groups/Group";
import Message "../messages/Message";
import Messages "../messages/Messages";

import E "../../../common/Errors";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Tier = Messages.Tier;
    private type Direction = Messages.Direction;
    private type Cursor = Messages.Cursor;
    private type Messages = Messages.Messages;
    private type SharableMessage = Message.Sharable;

    private type DM = DM.DM;
    private type Group = Group.Group;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Key = {
        #DM : Principal;
        #Group : Nat
    };

    /// CHAT ////// CHANNEL ////////////

    private type Self = Channel;

    public type Channel = {
        #DM : DM;
        #Group : Group
    };

    public type Sharable = {
        id : Key;
        name : Text;
        tier : Tier;
        lastMessage : SharableMessage
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public func setTier(__ : Self, tier : Tier) {
        switch (__) {
            case (#DM(dm)) dm.tier := tier;
            case (#Group(group)) group.tier := tier
        }
    };

    public func deleteFirstMessages(__ : Self, limit : Nat) {
        if (limit % 32 != 0) E.f(#NOT_VALID("Limit"), "Number of messages to delete must be a multiple of 32");

        Messages.deleteFirstChunks(messages(__), limit / 32)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func isTier(__ : Self, tier : Tier) : Bool = switch (__) {
        case (#DM(dm)) dm.tier == tier;
        case (#Group(group)) group.tier == tier
    };
    public func lastActive(__ : Self) : Int = Messages.lastActive(messages(__));

    public func messages(__ : Self) : Messages = switch (__) {
        case (#DM(dm)) dm.messages;
        case (#Group(group)) group.messages
    };

    public func pullMessages(__ : Self, direction : Direction, cursor : ?Cursor) : [SharableMessage] {
        Messages.pull(messages(__), direction, cursor)
    }
}
