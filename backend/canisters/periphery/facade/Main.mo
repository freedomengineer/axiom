import User "users/User";
import Users "users/Users";

import Notification "notifications/Notification";
import Notifications "notifications/Notifications";
import Coupon "../../core/affiliate/coupons/Coupon";

import DIP721 "../../core/dip721/Main";
import DIP721Interface "../../core/dip721/Interface";

import ICPUSDInterface "../../core/icpusd/Interface";
import SplitInterface "../../core/split/Interface";
import TreasuryInterface "../../core/treasury/Interface";
import AffiliateInterface "../../core/affiliate/Interface";
import SalesInterface "../../core/sales/Interface";
import EscrowInterface "../../core/escrow/Interface";
import AxiomsInterface "../../core/axioms/Interface";
import DAOInterface "../../periphery/dao/Interface";
import IndicatorInterface "../../periphery/indicator/Interface";

import C "../../common/Constants";
import E "../../common/Errors";

import Base "../../library/Base";
import Configs "../../library/Configs";
import E8S "../../library/E8S";
import Format "../../library/Format";
import Iter "../../library/Iter";
import Map "../../library/Map";
import Pagination "../../library/Pagination";

import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Error "mo:base/Error";

shared ({ caller = indicator }) persistent actor class Facade() = this {
    ////// TEMPORARY IMPLEMENTATION ////////////
    private stable var shiftedTime : Int = 0;
    private func getNow() : Int = shiftedTime + Time.now();
    public shared func shiftToMidnight(days : Nat) : async () {
        for (i in Iter.range(1, days)) {
            shiftedTime += C.ONE_DAY - getNow() % C.ONE_DAY
        }
    };
    ////// TEMPORARY IMPLEMENTATION ////////////

    private stable let Indicator : IndicatorInterface.Indicator = actor (Principal.toText(indicator));

    private stable let users : Users.Users = Users.init();
    private stable let notifications : Notifications.Notifications = Notifications.init();

    private stable let configs : Configs.Configs = Configs.make([
        ("MIN_USERNAME_LENGTH", #Nat(3)), /// Minimum length of a username
        ("MAX_USERNAME_LENGTH", #Nat(21)), /// Maximum length of a username
        ("USERNAME_SPECIAL_CHARACTERS", #Text("._")), /// Allowed special characters in a username

        ("MIN_LOCATION_LENGTH", #Nat(3)), /// Minimum length of a location
        ("MAX_LOCATION_LENGTH", #Nat(21)), /// Maximum length of a location

        ("MIN_ANCHOR_LENGTH", #Nat(3)), /// Minimum length of an anchor
        ("MAX_ANCHOR_LENGTH", #Nat(21)), /// Maximum length of an anchor
        ("MIN_URL_LENGTH", #Nat(11)), /// Minimum length of a link
        ("MAX_URL_LENGTH", #Nat(1000)), /// Maximum length of a link
        ("MAX_HYPERLINKS", #Nat(8)), /// Maximum number of hyperlinks a user can have

        /// Activity costs
        ("UPDATE_USERNAME_FEE", #E8S(E8S.fromFloat(1.0))),
        ("UPDATE_LOCATION_FEE", #E8S(E8S.fromFloat(1.0))),
        ("UPDATE_AVATAR_FEE", #E8S(E8S.fromFloat(10.0))),
        ("UPDATE_HYPERLINKS_FEE", #E8S(E8S.fromFloat(10.0))),

        /// New Configs
        ("MAX_NOTIFICATION_SIZE", #Nat(50)),
        ("MAX_NOTIFICATION_CAPACITY", #Nat(10)),
    ]);

    /// PROTECTED ////// MODIFIERS ////////////

    public shared ({ caller }) func initialize() : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        await Indicator.expectUnreleased();

        let founder : Principal = await Indicator.getPrincipal(#Founder);
        Users.addFounder(users, founder, getNow)
    };
    public shared ({ caller }) func setConfigs(entries : [(Configs.Key, Configs.SharableValue)]) : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        Configs.setBatch(configs, entries)
    };
    public shared ({ caller }) func putConfigs(entries : [(Configs.Key, Configs.SharableValue)]) : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        Configs.putBatch(configs, entries)
    };

    public shared ({ caller }) func updateCapitalRaised(principal : Principal, capitalRaised : Nat) : async () {
        await Indicator.expectAuthorized(caller, [#Sales]);
        let user : User.User = Users.user(users, principal);
        User.updateCapitalRaised(user, capitalRaised)
    };

    public shared ({ caller }) func postUserNotification(principal : Principal, data : Notification.UserVariantParam) : async () {
        await Indicator.expectAuthorized(caller, [#Axioms, #DAO, #Affiliate]);

        let MAX_NOTIFICATION_SIZE : Nat = Configs.Nat(configs, "MAX_NOTIFICATION_SIZE");
        let MAX_NOTIFICATION_CAPACITY : Nat = Configs.Nat(configs, "MAX_NOTIFICATION_CAPACITY");
        Notifications.postUserNotification(notifications, principal, data, MAX_NOTIFICATION_SIZE, MAX_NOTIFICATION_CAPACITY)
    };
    public shared ({ caller }) func postUsersNotification(batch : Notifications.UsersBatch, data : Notification.UserVariantParam) : async () {
        await Indicator.expectAuthorized(caller, [#Axioms, #DAO, #Affiliate]);

        let MAX_NOTIFICATION_SIZE : Nat = Configs.Nat(configs, "MAX_NOTIFICATION_SIZE");
        let MAX_NOTIFICATION_CAPACITY : Nat = Configs.Nat(configs, "MAX_NOTIFICATION_CAPACITY");
        Notifications.postUsersNotification(notifications, batch, data, MAX_NOTIFICATION_SIZE, MAX_NOTIFICATION_CAPACITY)
    };
    public shared ({ caller }) func postUserNotifications(principal : Principal, batch : Notifications.UserNotificationsBatch) : async () {
        await Indicator.expectAuthorized(caller, [#Axioms, #DAO, #Affiliate]);

        let MAX_NOTIFICATION_SIZE : Nat = Configs.Nat(configs, "MAX_NOTIFICATION_SIZE");
        let MAX_NOTIFICATION_CAPACITY : Nat = Configs.Nat(configs, "MAX_NOTIFICATION_CAPACITY");
        Notifications.postUserNotifications(notifications, principal, batch, MAX_NOTIFICATION_SIZE, MAX_NOTIFICATION_CAPACITY)
    };
    public shared ({ caller }) func postUsersNotifications(batch : Notifications.UsersNotificationsBatch) : async () {
        await Indicator.expectAuthorized(caller, [#Axioms, #DAO, #Affiliate]);

        let MAX_NOTIFICATION_SIZE : Nat = Configs.Nat(configs, "MAX_NOTIFICATION_SIZE");
        let MAX_NOTIFICATION_CAPACITY : Nat = Configs.Nat(configs, "MAX_NOTIFICATION_CAPACITY");
        Notifications.postUsersNotifications(notifications, batch, MAX_NOTIFICATION_SIZE, MAX_NOTIFICATION_CAPACITY)
    };

    public shared ({ caller }) func postSystemNotification(data : Notification.SystemVariantParam) : async () {
        await Indicator.expectAuthorized(caller, [#DAO, #Axioms]);

        let MAX_NOTIFICATION_SIZE : Nat = Configs.Nat(configs, "MAX_NOTIFICATION_SIZE");
        Notifications.postSystemNotification(notifications, data, MAX_NOTIFICATION_SIZE)
    };
    public shared ({ caller }) func postSystemNotifications(batch : Notifications.SystemNotificationsBatch) : async () {
        await Indicator.expectAuthorized(caller, [#DAO, #Axioms]);

        let MAX_NOTIFICATION_SIZE : Nat = Configs.Nat(configs, "MAX_NOTIFICATION_SIZE");
        Notifications.postSystemNotifications(notifications, batch, MAX_NOTIFICATION_SIZE)
    };
    public shared ({ caller }) func postSystemGenericNotification(message : Text, link : ?Format.Hyperlink) : async () {
        await Indicator.expectAuthorized(caller, [#Founder]);

        let MAX_NOTIFICATION_SIZE : Nat = Configs.Nat(configs, "MAX_NOTIFICATION_SIZE");
        Notifications.postSystemNotification(notifications, #SystemGeneric({ message; link; timestamp = getNow() }), MAX_NOTIFICATION_SIZE)
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public shared ({ caller }) func register(username : Text, capitalRaised : Nat, referrer : ?Principal) : async () {
        let lowercasedUsername : Text = Text.toLowercase(username);

        Users.expectNotFound(users, caller);
        Users.expectUsernameNotTaken(users, lowercasedUsername);
        Users.expectUsernameValid(lowercasedUsername, configs);

        let Sales : SalesInterface.Sales = await Indicator.Sales();
        let Escrow : EscrowInterface.Escrow = await Indicator.Escrow();
        let Affiliate : AffiliateInterface.Affiliate = await Indicator.Affiliate();
        let ICPUSD : ICPUSDInterface.ICPUSD = await Indicator.ICPUSD();
        let Split : SplitInterface.Split = await Indicator.Split();
        let Axioms : AxiomsInterface.Axioms = await Indicator.Axioms();
        let DAO : DAOInterface.DAO = await Indicator.DAO();

        await Escrow.expectUserNotFound(caller);
        await Affiliate.expectUserNotFound(caller);
        await DAO.expectUserNotFound(caller);
        await Axioms.expectUserNotFound(caller);

        let adjustedUsdPaid : Nat = await Sales.expectPackageFound(capitalRaised);
        let icpPaid : Nat = await ICPUSD.exchange(false, adjustedUsdPaid);

        Users.register(users, caller, lowercasedUsername, capitalRaised, getNow);

        await Split.deposit(caller, icpPaid);
        await Affiliate.fillReferrals(caller, icpPaid, referrer);

        let buriedAmount : Nat = await Sales.mintPackage(caller, capitalRaised);

        await Escrow.register(caller, buriedAmount);
        await DAO.register(caller);
        await Axioms.register(caller);

    };
    public shared ({ caller }) func registerWithCoupon(username : Text, coupon : [Nat8]) : async () {
        let lowercasedUsername : Text = Text.toLowercase(username);

        Users.expectNotFound(users, caller);
        Users.expectUsernameNotTaken(users, lowercasedUsername);
        Users.expectUsernameValid(lowercasedUsername, configs);

        let Sales : SalesInterface.Sales = await Indicator.Sales();
        let Escrow : EscrowInterface.Escrow = await Indicator.Escrow();
        let Affiliate : AffiliateInterface.Affiliate = await Indicator.Affiliate();
        let Axioms : AxiomsInterface.Axioms = await Indicator.Axioms();
        let DAO : DAOInterface.DAO = await Indicator.DAO();

        await Escrow.expectUserNotFound(caller);
        await Affiliate.expectUserNotFound(caller);
        await DAO.expectUserNotFound(caller);
        await Axioms.expectUserNotFound(caller);

        let { capitalRaised } : Coupon.Sharable = await Affiliate.lockCoupon(coupon, caller);

        try {
            Users.register(users, caller, lowercasedUsername, capitalRaised, getNow);

            let buriedAmount : Nat = await Sales.mintPackage(caller, capitalRaised);
            await Escrow.register(caller, buriedAmount);
            await DAO.register(caller);
            await Axioms.register(caller);

            await Affiliate.redeemCoupon(coupon, caller)
        } catch (e) {
            await Affiliate.redeemCouponFailed(coupon, caller, Error.message(e))
        };

    };

    public shared ({ caller }) func editUsername(username : Text) : async () {
        let UPDATE_USERNAME_FEE : E8S.E8S = Configs.E8S(configs, "UPDATE_USERNAME_FEE");
        let user : User.User = Users.user(users, caller);
        let lowercasedUsername : Text = Text.toLowercase(username);
        Users.expectUsernameNotTaken(users, lowercasedUsername);
        Users.expectUsernameValid(lowercasedUsername, configs);

        let Treasury : TreasuryInterface.Treasury = await Indicator.Treasury();
        await Treasury.delegatedClaim(#DAO, caller, UPDATE_USERNAME_FEE.val);

        User.updateUsername(user, lowercasedUsername)
    };
    public shared ({ caller }) func editLocation(location : ?Text) : async () {
        let UPDATE_LOCATION_FEE : E8S.E8S = switch (location) {
            case (?location) Configs.E8S(configs, "UPDATE_LOCATION_FEE");
            case (_) E8S.new()
        };
        let user : User.User = Users.user(users, caller);
        Users.expectLocationValid(location, configs);

        let Treasury : TreasuryInterface.Treasury = await Indicator.Treasury();
        if (UPDATE_LOCATION_FEE.val != 0) await Treasury.delegatedClaim(#DAO, caller, UPDATE_LOCATION_FEE.val);

        User.updateLocation(user, location)
    };
    public shared ({ caller }) func editAvatar(picture : ?Format.Picture) : async () {
        let UPDATE_AVATAR_FEE : E8S.E8S = switch (picture) {
            case (?p) {
                Format.validatePicture(p);
                Configs.E8S(configs, "UPDATE_AVATAR_FEE")
            };
            case (_) E8S.new()
        };
        let user : User.User = Users.user(users, caller);

        let Treasury : TreasuryInterface.Treasury = await Indicator.Treasury();
        if (UPDATE_AVATAR_FEE.val != 0) await Treasury.delegatedClaim(#DAO, caller, UPDATE_AVATAR_FEE.val);

        User.updateAvatar(user, picture)
    };
    public shared ({ caller }) func editLinks(links : [Format.Hyperlink]) : async () {
        let UPDATE_HYPERLINKS_FEE : E8S.E8S = Configs.E8S(configs, "UPDATE_HYPERLINKS_FEE");
        let user : User.User = Users.user(users, caller);
        Users.expectLinksValid(links, configs);

        let Treasury : TreasuryInterface.Treasury = await Indicator.Treasury();
        await Treasury.delegatedClaim(#DAO, caller, UPDATE_HYPERLINKS_FEE.val);

        User.updateLinks(user, links)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public query func getConfig(key : Configs.Key) : async Configs.SharableValue {
        Configs.getConfig(configs, key)
    };
    public query func getConfigs() : async Configs.Sharable {
        Configs.getConfigs(configs)
    };

    public query func getUserCapitalRaised(principal : Principal) : async Nat {
        let user : User.User = Users.user(users, principal);
        user.capitalRaised
    };

    public query func getUserIdentifier(from : User.IdentifierVariant) : async User.Identifier {
        Users.getIdentifier(users, from)
    };
    public query func getUsersIdentifier() : async [User.Identifier] {
        Users.getIdentifiers(users)
    };
    public query func getUsersPrincipal() : async [Principal] {
        Users.getPrincipals(users)
    };
    public query func getUsersCount() : async Nat {
        Users.getCount(users)
    };

    public query func getUser(principal : Principal) : async User.Sharable {
        Users.getUser(users, principal)
    };
    public query func getUsers(filter : Users.Filter, sort : Base.Sort<Users.Sort>) : async [User.Sharable] {
        Users.getUsers(users, filter, sort)
    };
    public query func getUsersPagination(filter : Users.Filter, sort : Base.Sort<Users.Sort>, page : Nat, limit : Nat) : async Pagination.Pagination<User.Sharable> {
        let result : Users.Sharable = Users.getUsers(users, filter, sort);
        Pagination.paginate(result, page, limit)
    };

    public query ({ caller }) func getNotification() : async Notifications.Sharable {
        Notifications.getNotification(notifications, caller)
    }
}
