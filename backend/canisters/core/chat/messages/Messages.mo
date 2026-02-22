import Message "Message";

import E "../../../common/Errors";

import Base "../../../library/Base";
import List "../../../library/List";
import MultiDimArray "../../../library/MultiDimArray";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type List<T> = List.List<T>;
    private type MultiDimArray<T> = MultiDimArray.MultiDimArray<T>;

    private type Message = Message.Message;
    private type SharableMessage = Message.Sharable;
    private type Content = Message.Content;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Tier = {
        #L32;
        #L512;
        #L4096;
        #L16384;
        #Extra : Nat
    };
    public type Direction = {
        #Forward : ?Nat;
        #Backward : ?Nat
    };
    public type Cursor = {
        #Id : Nat;
        #First;
        #Last
    };

    /// CHAT ////// MESSAGES ////////////

    private type Self = Messages;

    public type Messages = MultiDimArray<Message>;
    public type Sharable = [SharableMessage];

    public func init() : Self = MultiDimArray.new<Message>([32, 16, 8, 4]);

    /// PUBLIC ////// MODIFIERS ////////////

    public func pushSendable(__ : Self, tier : Tier, sender : Principal, content : Content, repliedTo : ?Nat, getNow : () -> Int) : Nat {
        let id : Nat = nextId(__);

        let limitReached = switch (tier) {
            case (#L32) id >= 00_032; // 32
            case (#L512) id >= 00_512; // 32*16
            case (#L4096) id >= 04_096; // 32*16*8
            case (#L16384) id >= 16_384; // 32*16*8*4
            case (#Extra(n)) id >= 16_384 * n; // 32*16*8*4*n
        };
        if (limitReached) E.f(#NOT_VALID("Tier"), "Attempted to push a message with limit reached (" # debug_show (id) # " messages for tier " # debug_show (tier) # ")");

        MultiDimArray.push(__, Message.initSendable(sender, content, repliedTo, getNow));

        switch (repliedTo) {
            case (?replyId) Message.addReply(message(__, replyId), id);
            case (null) {}
        };

        id
    };

    public func deleteFirstChunks(__ : Self, chunks : Nat) {
        MultiDimArray.deleteFirstChunks(__, chunks)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func size(__ : Self) : Nat = MultiDimArray.size(__);
    public func nextId(__ : Self) : Nat = MultiDimArray.size(__);
    public func lastId(__ : Self) : Nat = MultiDimArray.size(__) - 1;
    public func lastTimestamp(__ : Self) : Int = Message.timestamp(message(__, lastId(__)));

    public func message(__ : Self, id : Nat) : Message = switch (MultiDimArray.get(__, id)) {
        case (?message) message;
        case (null) E.f(#NOT_EXISTED("Message"), "Attempted to get a non-existent message id " # debug_show (id) # ". Max id available is " # debug_show (lastId(__)))
    };
    public func getLastMessage(__ : Self) : SharableMessage = Message.toSharable(message(__, lastId(__)), lastId(__));

    public func pull(__ : Self, direction : Direction, cursor : ?Cursor) : [SharableMessage] {
        var messages : List<SharableMessage> = List.nil();

        let last : Nat = lastId(__);
        let cursorIndex : Nat = switch (cursor, direction) {
            case (?(#Id(id)), _) id;
            case (?(#First), _) 0;
            case (?(#Last), _) last;
            case (null, #Forward(_)) 0;
            case (null, #Backward(_)) last
        };
        let (from, to) : (Nat, Nat) = switch (direction) {
            case (#Forward(n)) {
                let nextId : Nat = cursorIndex + 1;
                switch (n) {
                    case (?x)(nextId, Base.ceil(nextId + x, last));
                    case (null)(nextId, last)
                }
            };
            case (#Backward(n)) {
                let prevId : Nat = cursorIndex - 1;
                switch (n) {
                    case (?x)(Base.floor(prevId - x, 0), prevId);
                    case (null)(0, prevId)
                }
            }
        };

        if (from > to) E.f(#NOT_VALID("Cursor"), "Attempted to pull a message with invalid range [" # debug_show (from) # ", " # debug_show (to) # "]");

        for ((i, e) in MultiDimArray.entriesRange(__, from, to)) {
            messages := List.push(Message.toSharable(e, i), messages)
        };

        List.toArray(messages)
    }
}
