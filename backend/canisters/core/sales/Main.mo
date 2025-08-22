import Package "packages/Package";
import Packages "packages/Packages";
import AchievementPackage "achievement_packages/AchievementPackage";
import AchievementPackages "achievement_packages/AchievementPackages";

import EscrowBurial "../escrow/burials/Burial";
import FacadeUser "../../periphery/facade/users/User";

import DIP721 "../dip721/Main";
import DIP721Interface "../dip721/Interface";

import AffiliateInterface "../affiliate/Interface";
import EscrowInterface "../escrow/Interface";
import FacadeInterface "../../periphery/facade/Interface";
import IndicatorInterface "../../periphery/indicator/Interface";
import TreasuryInterface "../treasury/Interface";

import E "../../common/Errors";

import Array "../../library/Array";
import Base "../../library/Base";
import Configs "../../library/Configs";
import E8S "../../library/E8S";
import List "../../library/List";
import Proportion "../../library/Proportion";

import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import ExperimentalCycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import Error "mo:base/Error";

shared ({ caller = indicator }) persistent actor class Sales() = this {
    private stable let Indicator : IndicatorInterface.Indicator = actor (Principal.toText(indicator));

    private stable let packages : Packages.Packages = Packages.init();
    private stable let achievementPackages : AchievementPackages.AchievementPackages = AchievementPackages.init();

    private stable let configs : Configs.Configs = Configs.make([
        ("ACORN_LIQUID_MINT_PROPORTION", #Proportion(Proportion.make(10, 2))), /// In relation to unadjusted USD price
        ("ACORN_BURIED_MINT_PROPORTION", #Proportion(Proportion.make(10, 2))), /// In relation to unadjusted USD price
        ("PRICE_ADJUSTMENT_PROPORTION", #Proportion(Proportion.make(1, 1))), /// In relation to unadjusted USD price

        ("REFERRAL_ACHIEVEMENT_THRESHOLD", #Nat(10)),
        ("OCTUPLE_BURIAL_ACHIEVEMENT_THRESHOLD", #E8S(E8S.fromFloat(1000.0))),
    ]);

    /// PRIVATE ////// MODIFIERS ////////////

    private func _deployPackage(package : Package.Package) : async DIP721.Dip721NFT {
        ExperimentalCycles.add<system>(1_000_000_000_000);
        let NFT : DIP721.Dip721NFT = await DIP721.Dip721NFT(Principal.fromActor(this), package.metadata);
        Package.deploy(package, Principal.fromActor(NFT));
        NFT
    };
    private func _deployAchievementPackage(package : AchievementPackage.AchievementPackage) : async DIP721.Dip721NFT {
        ExperimentalCycles.add<system>(1_000_000_000_000);
        let NFT : DIP721.Dip721NFT = await DIP721.Dip721NFT(Principal.fromActor(this), package.metadata);
        AchievementPackage.deploy(package, Principal.fromActor(NFT));
        NFT
    };

    /// PROTECTED ////// MODIFIERS ////////////

    public shared ({ caller }) func initialize() : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        await Indicator.expectUnreleased();

        for ((_, package) in Packages.packages(packages)) {
            switch (package.principal) {
                case (null) ignore await _deployPackage(package);
                case (?_) {}
            }
        };
        for ((_, package) in AchievementPackages.packages(achievementPackages)) {
            switch (package.principal) {
                case (null) ignore await _deployAchievementPackage(package);
                case (?_) {}
            }
        }
    };

    public shared ({ caller }) func setConfigs(entries : [(Configs.Key, Configs.SharableValue)]) : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        Configs.setBatch(configs, entries)
    };
    public shared ({ caller }) func putConfigs(entries : [(Configs.Key, Configs.SharableValue)]) : async () {
        await Indicator.expectAuthorized(caller, [#Indicator]);
        Configs.putBatch(configs, entries)
    };

    public shared ({ caller }) func mintPackage(recipient : Principal, capitalRaised : Nat) : async Nat {
        await Indicator.expectAuthorized(caller, [#Facade]);

        let Treasury : TreasuryInterface.Treasury = await Indicator.Treasury();
        let packagesToMint : [(Nat, Package.Package)] = Packages.getPackagesToMint(packages, capitalRaised);

        for ((capitalRaised, package) in packagesToMint.vals()) {
            let NFT : DIP721.Dip721NFT = switch (package.principal) {
                case (?p) actor (Principal.toText(p));
                case (null) await _deployPackage(package)
            };
            let mintResult = await NFT.mintDip721(recipient, []);
            switch (mintResult) {
                case (#Err(e)) E.f(#EXTERNAL_FAILURE("NFT Mint"), debug_show e);
                case (#Ok(_)) {}
            }
        };

        let { liquid; buried } : Package.ACORNToMint<Nat> = _computeAcornToMint(capitalRaised);
        await Treasury.externalMint(recipient, liquid);
        await Treasury.internalMint(#Escrow, buried);

        buried
    };

    public shared ({ caller }) func addPackage(capitalRaised : Nat, name : Text, symbol : Text, logoUri : Text) : async () {
        await Indicator.expectAuthorized(caller, [#Sales, #Founder]);
        Packages.expectNotFound(packages, capitalRaised);
        Packages.add(packages, capitalRaised, name, symbol, logoUri);
        await deployPackage(capitalRaised)
    };
    public shared ({ caller }) func deployPackage(capitalRaised : Nat) : async () {
        await Indicator.expectAuthorized(caller, [#Sales, #Founder]);
        let package : Package.Package = Packages.package(packages, capitalRaised);
        Package.expectNotDeployed(package);
        ignore await _deployPackage(package)
    };

    public shared ({ caller }) func addAchievementPackage(achievement : AchievementPackage.Achievement, name : Text, symbol : Text, logoUri : Text) : async () {
        await Indicator.expectAuthorized(caller, [#Sales, #Founder]);
        AchievementPackages.expectNotFound(achievementPackages, achievement);
        AchievementPackages.add(achievementPackages, achievement, name, symbol, logoUri);
        await deployAchievementPackage(achievement)
    };
    public shared ({ caller }) func deployAchievementPackage(achievement : AchievementPackage.Achievement) : async () {
        await Indicator.expectAuthorized(caller, [#Sales, #Founder]);
        let package : AchievementPackage.AchievementPackage = AchievementPackages.package(achievementPackages, achievement);
        AchievementPackage.expectNotDeployed(package);
        ignore await _deployAchievementPackage(package)
    };

    public shared ({ caller }) func forceUpdateCapitalRaised(users : [Principal]) : async Packages.ForceUpdateCapitalRaisedResult {
        let Facade : FacadeInterface.Facade = await Indicator.Facade();
        var usersCapitalRaised : List.List<(Principal, async [Package.Sharable])> = List.nil();
        for (user in users.vals()) {
            let packagesFuture : async [Package.Sharable] = getOwnedPackages(user);
            usersCapitalRaised := List.push<(Principal, async [Package.Sharable])>((user, packagesFuture), usersCapitalRaised)
        };

        var success : List.List<Principal> = List.nil();
        var failed : List.List<(Principal, Text)> = List.nil();
        var updatesFutures : List.List<(Principal, async ())> = List.nil();

        for ((user, packagesFuture) in List.toIter(List.reverse(usersCapitalRaised))) {
            let ownedPackages : [Package.Sharable] = await packagesFuture;
            var highestCapitalRaised : Nat = 0;
            for (package in ownedPackages.vals()) {
                if (package.capitalRaised > highestCapitalRaised) highestCapitalRaised := package.capitalRaised
            };
            updatesFutures := List.push<(Principal, async ())>((user, Facade.updateCapitalRaised(user, highestCapitalRaised)), updatesFutures);

        };

        for ((principal, updateFuture) in List.toIter(List.reverse(updatesFutures))) {
            try {
                await updateFuture;
                success := List.push<Principal>(principal, success)
            } catch (e) {
                failed := List.push<(Principal, Text)>((principal, Error.message(e)), failed)
            }
        };

        { success = List.toArray(success); failed = List.toArray(failed) }
    };

    /// PUBLIC ////// MODIFIERS ////////////

    public shared ({ caller }) func upgradePackage() : async () {
        let ACORN_BURIED_MINT_PROPORTION : Proportion.Proportion = Configs.Proportion(configs, "ACORN_BURIED_MINT_PROPORTION");
        let ACORN_LIQUID_MINT_PROPORTION : Proportion.Proportion = Configs.Proportion(configs, "ACORN_LIQUID_MINT_PROPORTION");
        let Escrow : EscrowInterface.Escrow = await Indicator.Escrow();

        let acornAmount : Nat = await Escrow.getBuriedAmount(caller);
        if (acornAmount == 0) E.f(#NOT_VALID("Upgrade Package"), "No ACORN buried to upgrade");

        let acornE8S : E8S.E8S = E8S.make(acornAmount);

        let acornScaled : Proportion.Proportion = Proportion.getAdd(ACORN_BURIED_MINT_PROPORTION, ACORN_LIQUID_MINT_PROPORTION);
        let capitalRaised : Nat = E8S.getScaleBy(acornE8S, Proportion.getInverse(acornScaled)).val;

        let packagesToMint : [(Nat, Package.Package)] = Packages.getPackagesToMint(packages, capitalRaised);
        var highestCapitalRaised : Nat = 0;

        for ((capitalRaised, package) in packagesToMint.vals()) {
            if (capitalRaised > highestCapitalRaised) highestCapitalRaised := capitalRaised;

            let NFT : DIP721.Dip721NFT = switch (package.principal) {
                case (?p) actor (Principal.toText(p));
                case (null) await _deployPackage(package)
            };
            let existed = await NFT.getTokenIdsForUserDip721(caller);
            if (existed.size() == 0) {
                let mintResult = await NFT.mintDip721(caller, []);
                switch (mintResult) {
                    case (#Err(e)) E.f(#EXTERNAL_FAILURE("NFT Mint"), debug_show e);
                    case (#Ok(_)) {}
                }
            }
        };

        let Facade : FacadeInterface.Facade = await Indicator.Facade();
        await Facade.updateCapitalRaised(caller, highestCapitalRaised)
    };

    public shared ({ caller }) func mintAchievementPackage(achievement : AchievementPackage.Achievement) : async () {
        switch (achievement) {
            case (#Referral) {
                let threshold : Nat = Configs.Nat(configs, "REFERRAL_ACHIEVEMENT_THRESHOLD");
                let Affiliate : AffiliateInterface.Affiliate = await Indicator.Affiliate();
                let { referrals } = await Affiliate.getUser(caller);
                switch (referrals >= threshold) {
                    case (true) {};
                    case (false) E.f(#NOT_VALID("Achievement"), "You have not reached the referral achievement yet, expected " # debug_show threshold # ", got " # debug_show referrals)
                }
            };
            case (#OctupleBurial) {
                let threshold : E8S.E8S = Configs.E8S(configs, "OCTUPLE_BURIAL_ACHIEVEMENT_THRESHOLD");
                let Escrow : EscrowInterface.Escrow = await Indicator.Escrow();
                let { burials } = await Escrow.getUser(caller);
                var buried : Nat = 0;
                for (burial in burials.vals()) {
                    if (burial.coefficient == 8) buried += burial.amount
                };
                switch (buried >= threshold.val) {
                    case (true) {};
                    case (false) E.f(#NOT_VALID("Achievement"), "You have not reached the octuple burial achievement yet")
                }
            }
        };
        let package : AchievementPackage.AchievementPackage = AchievementPackages.package(achievementPackages, achievement);
        let NFT : DIP721.Dip721NFT = switch (package.principal) {
            case (?p) actor (Principal.toText(p));
            case (null) await _deployAchievementPackage(package)
        };
        let existed = await NFT.getTokenIdsForUserDip721(caller);
        switch (existed.size() > 0) {
            case (true) E.f(#ALREADY_EXISTED("Achievement"), "You have already minted this achievement");
            case (false) {}
        };
        let mintResult = await NFT.mintDip721(caller, []);
        switch (mintResult) {
            case (#Err(e)) E.f(#EXTERNAL_FAILURE("NFT Mint"), debug_show e);
            case (#Ok(_)) {}
        }
    };

    /// PRIVATE ////// ACCESSORS ////////////

    private func _getAdjustedPrice(capitalRaised : Nat) : E8S.E8S {
        let PRICE_ADJUSTMENT_PROPORTION : Proportion.Proportion = Configs.Proportion(configs, "PRICE_ADJUSTMENT_PROPORTION");
        E8S.getScaleBy(E8S.make(capitalRaised), PRICE_ADJUSTMENT_PROPORTION)
    };
    private func _computeAcornToMint(capitalRaised : Nat) : Package.ACORNToMint<Nat> {
        let ACORN_LIQUID_MINT_PROPORTION : Proportion.Proportion = Configs.Proportion(configs, "ACORN_LIQUID_MINT_PROPORTION");
        let ACORN_BURIED_MINT_PROPORTION : Proportion.Proportion = Configs.Proportion(configs, "ACORN_BURIED_MINT_PROPORTION");
        let liquid : E8S.E8S = E8S.getScaleBy(E8S.make(capitalRaised), ACORN_LIQUID_MINT_PROPORTION);
        let buried : E8S.E8S = E8S.getScaleBy(E8S.make(capitalRaised), ACORN_BURIED_MINT_PROPORTION);
        { liquid = liquid.val; buried = buried.val }
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public query func getConfig(key : Configs.Key) : async Configs.SharableValue {
        Configs.getConfig(configs, key)
    };
    public query func getConfigs() : async Configs.Sharable {
        Configs.getConfigs(configs)
    };

    public shared func computeAcornToMint(capitalRaised : Nat) : async Package.ACORNToMint<Nat> {
        _computeAcornToMint(capitalRaised)
    };

    public query func getPackagePrincipals() : async [(Nat, Principal)] {
        Packages.getPackagePrincipals(packages)
    };
    public query func getPackages() : async Packages.Sharable {
        Packages.getPackages(packages)
    };
    public shared func getOwnedPackages(principal : Principal) : async Packages.Sharable {
        let deployedPackages = Packages.getDeployedPackages(packages);
        var futures : List.List<(Package.Sharable, async [Nat64])> = List.nil();

        for (package in deployedPackages.vals()) {
            let NFT : DIP721Interface.DIP721 = actor (Principal.toText(Base.unwrap(package.principal)));
            let tokenIdsFuture = NFT.getTokenIdsForUserDip721(principal);
            futures := List.push<(Package.Sharable, async [Nat64])>((package, tokenIdsFuture), futures)
        };

        var ownedPackagesList : List.List<Package.Sharable> = List.nil();
        for ((package, future) in List.toIter(List.reverse(futures))) {
            let tokenIds = await future;
            if (tokenIds.size() > 0) {
                ownedPackagesList := List.push(package, ownedPackagesList)
            }
        };
        return List.toArray(ownedPackagesList)
    };

    public query func getAchievementPackagePrincipals() : async [(AchievementPackage.Achievement, Principal)] {
        AchievementPackages.getAchievementPackagePrincipals(achievementPackages)
    };
    public query func getAchievementPackages() : async AchievementPackages.Sharable {
        AchievementPackages.getAchievementPackages(achievementPackages)
    };
    public shared func getOwnedAchievementPackages(principal : Principal) : async AchievementPackages.Sharable {
        var ownedAchievementPackages : List.List<AchievementPackage.Sharable> = List.nil();
        for (sharableAchievementPackage in AchievementPackages.getDeployedAchievementPackages(achievementPackages).vals()) {
            let unwrappedPrincipal : Principal = Base.unwrap(sharableAchievementPackage.principal);
            let NFT : DIP721Interface.DIP721 = actor (Principal.toText(unwrappedPrincipal));

            let ids = await NFT.getTokenIdsForUserDip721(principal);
            if (ids.size() > 0) ownedAchievementPackages := List.push(sharableAchievementPackage, ownedAchievementPackages)
        };
        List.toArray(ownedAchievementPackages)
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public query func expectPackageNotFound(capitalRaised : Nat) : async () {
        Packages.expectNotFound(packages, capitalRaised)
    };
    public query func expectPackageFound(capitalRaised : Nat) : async Nat {
        Packages.expectFound(packages, capitalRaised);
        _getAdjustedPrice(capitalRaised).val
    }
}
