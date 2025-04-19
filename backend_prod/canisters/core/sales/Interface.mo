import AchievementPackage "achievement_packages/AchievementPackage";
import AchievementPackages "achievement_packages/AchievementPackages";
import Package "packages/Package";
import Packages "packages/Packages";
import Configs "../../library/Configs";

module {
    public type Sales = actor {
        initialize : shared () -> async ();
        setConfigs : shared ([(Configs.Key, Configs.SharableValue)]) -> async ();
        putConfigs : shared ([(Configs.Key, Configs.SharableValue)]) -> async ();
        mintPackage : shared (Principal, Nat) -> async Nat;
        addPackage : shared (Nat, Text, Text, Text) -> async ();
        deployPackage : shared (Nat) -> async ();
        addAchievementPackage : shared (AchievementPackage.Achievement, Text, Text, Text) -> async ();
        deployAchievementPackage : shared (AchievementPackage.Achievement) -> async ();
        upgradePackage : shared () -> async ();
        mintAchievementPackage : shared (AchievementPackage.Achievement) -> async ();
        getConfig : query (Configs.Key) -> async Configs.SharableValue;
        getConfigs : query () -> async Configs.Sharable;
        computeAcornToMint : shared (Nat) -> async Package.ACORNToMint<Nat>;
        getPackagePrincipals : query () -> async [(Nat, Principal)];
        getPackages : query () -> async Packages.Sharable;
        getOwnedPackages : shared (Principal) -> async Packages.Sharable;
        getAchievementPackagePrincipals : query () -> async [(AchievementPackage.Achievement, Principal)];
        getAchievementPackages : query () -> async AchievementPackages.Sharable;
        getOwnedAchievementPackages : shared (Principal) -> async AchievementPackages.Sharable;
        expectPackageNotFound : query (Nat) -> async ();
        expectPackageFound : query (Nat) -> async Nat;
    };
};