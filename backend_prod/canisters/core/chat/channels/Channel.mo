import DM "../dms/DM";
import Group "../groups/Group";
import Message "../messages/Message";
import Messages "../messages/Messages";

import E "../../../common/Errors";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Tier = Message.Tier;
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
    }
}
