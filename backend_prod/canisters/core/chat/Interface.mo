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
        publicGroup : shared (Nat, Message.PlainDEK) -> async ();
        privateGroup : shared (Nat, [(Principal, Message.MemberEncryptedDEK)], Blob) -> async ();
        addAdmins : shared (Nat, [Principal]) -> async ();
        removeAdmins : shared (Nat, [Principal]) -> async ();
        banMembersPublicGroup : shared (Nat, [Principal]) -> async ();
        unbanMembersPublicGroup : shared (Nat, [Principal]) -> async ();
        joinPublicGroup : shared (Nat) -> async Message.MemberDEKsSharable;
        leavePublicGroup : shared (Nat) -> async ();
        inviteMembersPrivateGroup : shared (Nat, [(Principal, Message.MemberDEKsSharable)]) -> async ();
        kickMembersPrivateGroup : shared (Nat, [Principal], [(Principal, Message.MemberEncryptedDEK)], Blob) -> async ();
        getConfig : query (Configs.Key) -> async Configs.SharableValue;
        getConfigs : query () -> async Configs.Sharable;
        getIbeMasterPublicKey : shared () -> async Blob;
        getMyVetKey : shared (Blob) -> async Blob;
        expectUserNotFound : query (Principal) -> async ();
    };
};