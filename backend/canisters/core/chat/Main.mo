import User "users/User";
import Users "users/Users";
import Channel "channels/Channel";
import Channels "channels/Channels";
import DM "dms/DM";
import DMs "dms/DMs";
import Group "groups/Group";
import Groups "groups/Groups";
import Message "messages/Message";
import Messages "messages/Messages";

import IndicatorInterface "../../periphery/indicator/Interface";

import C "../../common/Constants";

import Configs "../../library/Configs";
import Iter "../../library/Iter";
import Management "../../library/Management";

import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";

shared ({ caller = indicator }) persistent actor class Chat() = this {
    ////// TEMPORARY IMPLEMENTATION ////////////
    private stable var shiftedTime : Int = 0;
    private func getNow() : Int = shiftedTime + Time.now();
    public shared func shiftToMidnight(days : Nat) : async () {
        for (i in Iter.range(1, days)) {
            shiftedTime += C.ONE_DAY - getNow() % C.ONE_DAY
        }
    };
    ////// TEMPORARY IMPLEMENTATION ////////////

    private transient let Indicator : IndicatorInterface.Indicator = actor (Principal.toText(indicator));

    private stable let users : Users.Users = Users.init();
    private stable let channels : Channels.Channels = Channels.init();

    private stable let configs : Configs.Configs = Configs.make([]);

    private stable let VETKD_CONTEXT : Blob = Text.encodeUtf8("axiom_chat_ibe_1");
    private stable let VETKD_KEY_ID : Management.VetKDKeyId = {
        curve = #bls12_381_g2;
        name = "axiom_chat_1"
    };

    /// PROTECTED ////// MODIFIERS ////////////

    // public shared ({ caller }) func initialize() : async () {
    //     await Indicator.expectAuthorized(caller, [#Indicator]);
    //     await Indicator.expectUnreleased();

    //     let founder : Principal = await Indicator.getPrincipal(#Founder);
    //     Users.addFounder(users, founder, getNow)
    // };
    public shared ({ caller }) func setConfigs(entries : [(Configs.Key, Configs.SharableValue)]) : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        Configs.setBatch(configs, entries)
    };
    public shared ({ caller }) func putConfigs(entries : [(Configs.Key, Configs.SharableValue)]) : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        Configs.putBatch(configs, entries)
    };

    public shared ({ caller }) func register(principal : Principal, username : Text) : async () {
        await Indicator.expectAuthorized(caller, [#Facade]);
        await expectUserNotFound(principal);
        Users.register(users, principal, username)
    };
    public shared ({ caller }) func setUsername(principal : Principal, username : Text) : async () {
        await Indicator.expectAuthorized(caller, [#Facade]);
        let user : User.User = Users.user(users, principal);
        User.setUsername(user, username)
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public shared ({ caller }) func createDM(ownedDek : Message.EncryptedDEK, to : (Principal, Message.EncryptedDEK)) : async Text {
        let user : User.User = Users.user(users, caller);
        let key : Text = Channels.createDM(channels, (caller, ownedDek), to, getNow);
        User.addDm(user, to.0);
        key
    };
    public shared ({ caller }) func createPublicGroup(plainDek : Message.PlainDEK, name : Text, disableLogs : Bool, admins : [Principal], members : [Principal]) : async Nat {
        let user : User.User = Users.user(users, caller);
        let id : Nat = Channels.createPublicGroup(channels, name, disableLogs, caller, admins, members, plainDek, getNow);
        User.joinGroup(user, id);
        id
    };
    public shared ({ caller }) func createPrivateGroup(name : Text, disableLogs : Bool, admins : [Principal], members : [(Principal, Message.EncryptedDEK)]) : async Nat {
        let user : User.User = Users.user(users, caller);
        let id : Nat = Channels.createPrivateGroup(channels, name, disableLogs, caller, admins, members, getNow);
        User.joinGroup(user, id);
        id
    };

    public shared ({ caller }) func joinPublicGroup(id : Nat) : async Message.MemberDEKsSharable {
        let user : User.User = Users.user(users, caller);
        let group : Group.Group = Channels.group(channels, id);

        Group.expectNotMember(group, caller);

        let deks : Message.MemberDEKsSharable = Group.joinPublic(group, caller);
        User.joinGroup(user, id);
        deks
    };
    public shared ({ caller }) func leavePublicGroup(id : Nat) : async () {
        let user : User.User = Users.user(users, caller);
        let group : Group.Group = Channels.group(channels, id);

        Group.expectMember(group, caller);

        Group.leavePublic(group, caller);
        User.leaveGroup(user, id)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public query func getConfig(key : Configs.Key) : async Configs.SharableValue {
        Configs.getConfig(configs, key)
    };
    public query func getConfigs() : async Configs.Sharable {
        Configs.getConfigs(configs)
    };

    public shared ({ caller }) func getIbeMasterPublicKey() : async Blob {
        Users.expectFound(users, caller);

        let args : Management.VetKDPublicKeyArgs = {
            canister_id = null;
            context = VETKD_CONTEXT;
            key_id = VETKD_KEY_ID
        };
        let result = await Management.IC0.vetkd_public_key(args);
        return result.public_key
    };
    public shared ({ caller }) func getMyVetKey(transportPublicKey : Blob) : async Blob {
        Users.expectFound(users, caller);

        let args : Management.VetKDDeriveKeyArgs = {
            input = Principal.toBlob(caller);
            context = VETKD_CONTEXT;
            key_id = VETKD_KEY_ID;
            transport_public_key = transportPublicKey
        };
        let result = await Management.IC0.vetkd_derive_key(args);
        return result.encrypted_key
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public query func expectUserNotFound(principal : Principal) : async () {
        Users.expectNotFound(users, principal)
    }
}
