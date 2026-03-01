import Message "../messages/Message";
import Messages "../messages/Messages";

import Base "../../../library/Base";
import Iter "../../../library/Iter";
import List "../../../library/List";
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

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Key = {
        #DM : Principal;
        #Group : Nat
    };
    public type Info = {
        id : Key;
        tier : Tier;
        members : [Principal];
        messagesCount : (Nat, Nat);
        creationDate : Int
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
        members : [Principal];
        messages : Messages;
        creationDate : Int
    };
    public type PrivateSharable = {
        id : Key;
        name : Text;
        tier : Tier;
        lastMessage : SharableMessage
    };

    public func init(creator : Principal, to : Principal, getNow : () -> Int) : Self = {
        var tier = #L32;
        members = [creator, to];
        messages = Messages.init();
        creationDate = getNow()
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func getInfo(__ : Self, id : Principal) : Info = {
        id = #DM(id);
        tier = __.tier;
        members = __.members;
        messagesCount = (Messages.size(__.messages), Messages.messagesLimitPerTier(__.tier));
        creationDate = __.creationDate
    };

    public func toPrivateSharable(__ : Self, id : Principal, name : Text) : PrivateSharable = {
        id = #DM(id);
        name;
        tier = __.tier;
        lastMessage = Messages.getLastMessage(__.messages)
    }
}
