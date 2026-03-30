import Message "messages/Message";
import Configs "../../library/Configs";

module {
    public type Chat = actor {
        initialize : shared () -> async ();
        setConfigs : shared ([(Configs.Key, Configs.SharableValue)]) -> async ();
        putConfigs : shared ([(Configs.Key, Configs.SharableValue)]) -> async ();
        register : shared (Principal, Text) -> async ();
        setUsername : shared (Principal, Text) -> async ();
        createDM : shared (Message.EncryptedDEK, (Principal, Message.EncryptedDEK)) -> async Text;
        createPublicGroup : shared (Message.PlainDEK, Text, Bool, [Principal], [Principal]) -> async Nat;
        createPrivateGroup : shared (Text, Bool, [Principal], [(Principal, Message.EncryptedDEK)]) -> async Nat;
        joinPublicGroup : shared (Nat) -> async Message.MemberDEKsSharable;
        leavePublicGroup : shared (Nat) -> async ();
        getConfig : query (Configs.Key) -> async Configs.SharableValue;
        getConfigs : query () -> async Configs.Sharable;
        getIbeMasterPublicKey : shared () -> async Blob;
        getMyVetKey : shared (Blob) -> async Blob;
        expectUserNotFound : query (Principal) -> async ();
    };
};