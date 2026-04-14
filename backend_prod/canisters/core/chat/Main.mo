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
import Map "../../library/Map";
import Set "../../library/Set";

import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";

shared ({ caller = indicator }) persistent actor class Chat() = this {
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

    public shared ({ caller }) func initialize() : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        await Indicator.expectUnreleased();

        let founder : Principal = await Indicator.getPrincipal(#Founder);
        Users.addFounder(users, founder)
    };
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
        let key : Text = Channels.createDM(channels, (caller, ownedDek), to);
        User.addDm(user, to.0);
        key
    };
    public shared ({ caller }) func createPublicGroup(plainDek : Message.PlainDEK, name : Text, disableLogs : Bool, admins : [Principal], members : [Principal]) : async Nat {
        let user : User.User = Users.user(users, caller);
        let id : Nat = Channels.createPublicGroup(channels, name, disableLogs, caller, admins, members, plainDek);
        User.joinGroup(user, id);
        id
    };
    public shared ({ caller }) func createPrivateGroup(name : Text, disableLogs : Bool, admins : [Principal], members : [(Principal, Message.EncryptedDEK)]) : async Nat {
        let user : User.User = Users.user(users, caller);
        let id : Nat = Channels.createPrivateGroup(channels, name, disableLogs, caller, admins, members);
        User.joinGroup(user, id);
        id
    };

    public shared ({ caller }) func publicGroup(id : Nat, dek : Message.PlainDEK) : async () {
        let group : Group.Group = Channels.group(channels, id);
        Group.expectCreator(group, caller);
        Group.expectPrivate(group);

        Group.publicGroup(group, dek, caller)
    };
    public shared ({ caller }) func privateGroup(id : Nat, members : [(Principal, Message.MemberEncryptedDEK)], keyHash : Blob) : async () {
        let group : Group.Group = Channels.group(channels, id);
        Group.expectCreator(group, caller);
        Group.expectPublic(group);

        Group.privateGroup(group, members, keyHash, caller)
    };

    public shared ({ caller }) func addAdmins(id : Nat, admins : [Principal]) : async () {
        let group : Group.Group = Channels.group(channels, id);
        Group.expectCreator(group, caller);

        Group.addAdmins(group, admins)
    };
    public shared ({ caller }) func removeAdmins(id : Nat, admins : [Principal]) : async () {
        let group : Group.Group = Channels.group(channels, id);
        Group.expectCreator(group, caller);

        Group.removeAdmins(group, admins)
    };

    public shared ({ caller }) func banMembersPublicGroup(id : Nat, members : [Principal]) : async () {
        let group : Group.Group = Channels.group(channels, id);
        Group.expectAdmin(group, caller);

        let bannedMembers : Set.Set<Principal> = Group.banMembers(group, members);
        for (member in Set.vals(bannedMembers)) {
            let userBanned : User.User = Users.user(users, member);
            User.leaveGroup(userBanned, id)
        }
    };
    public shared ({ caller }) func unbanMembersPublicGroup(id : Nat, members : [Principal]) : async () {
        let group : Group.Group = Channels.group(channels, id);
        Group.expectAdmin(group, caller);

        Group.unbanMembers(group, members)
    };

    public shared ({ caller }) func joinPublicGroup(id : Nat) : async Message.MemberDEKsSharable {
        let user : User.User = Users.user(users, caller);
        let group : Group.Group = Channels.group(channels, id);
        Group.expectNotMember(group, caller);
        Group.expectNotBanned(group, caller);

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

    public shared ({ caller }) func inviteMembersPrivateGroup(id : Nat, members : [(Principal, Message.MemberDEKsSharable)]) : async () {
        let group : Group.Group = Channels.group(channels, id);
        Group.expectAdmin(group, caller);

        let invitedMembers : Map.Map<Principal, Message.MemberDEKs> = Group.addMembersPrivate(group, members, caller);
        for ((member, _) in Map.entries(invitedMembers)) {
            let invitedUser : User.User = Users.user(users, member);
            User.joinGroup(invitedUser, id)
        }
    };
    public shared ({ caller }) func kickMembersPrivateGroup(id : Nat, members : [Principal], membersDek : [(Principal, Message.MemberEncryptedDEK)], keyHash : Blob) : async () {
        let group : Group.Group = Channels.group(channels, id);
        Group.expectAdmin(group, caller);

        let kickedMembers : Set.Set<Principal> = Group.removeMembersPrivate(group, members, membersDek, keyHash, caller);
        for (member in Set.vals(kickedMembers)) {
            let kickedUser : User.User = Users.user(users, member);
            User.leaveGroup(kickedUser, id)
        }
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
