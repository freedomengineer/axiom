import AchievementPackage "AchievementPackage";

import E "../../../common/Errors";

import Configs "../../../library/Configs";
import E8S "../../../library/E8S";
import Iter "../../../library/Iter";
import List "../../../library/List";
import Map "../../../library/Map";

import Principal "mo:base/Principal";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Configs = Configs.Configs;
    private type E8S = E8S.E8S;
    private type List<T> = List.List<T>;
    private type Iter<T> = Iter.Iter<T>;
    private type Map<K, V> = Map.Map<K, V>;

    private type Achievement = AchievementPackage.Achievement;
    private type AchievementPackage = AchievementPackage.AchievementPackage;
    private type SharableAchievementPackage = AchievementPackage.Sharable;

    private let { AchievementKey = Key } = AchievementPackage;

    /// SALES ////// PACKAGES ////////////

    private type Self = AchievementPackages;

    public type AchievementPackages = Map<Achievement, AchievementPackage>;
    public type Sharable = [SharableAchievementPackage];

    public func init() : Self = Map.fromEntries<Achievement, AchievementPackage>([
        (Key(#Referral), AchievementPackage.init("PAMPH", "Pamphleteer", "https://axiom.show/wp-content/uploads/2025/03/Pamphleteer-Card-.png")),
        (Key(#OctupleBurial), AchievementPackage.init("PLANTR", "Planter of Trees", "https://axiom.show/wp-content/uploads/2025/03/The-Planter-of-Trees.png")),
    ]);

    /// PUBLIC ////// MODIFIERS ////////////

    public func add(__ : Self, achievement : Achievement, name : Text, symbol : Text, logoUri : Text) {
        let package : AchievementPackage = AchievementPackage.init(name, symbol, logoUri);
        Map.put(__ : Self, Key(achievement), package)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func package(__ : Self, achievement : Achievement) : AchievementPackage {
        Map.unwrap<Achievement, AchievementPackage>(__, Key(achievement))
    };
    public func getAchievementPackages(__ : Self) : Sharable {
        Map.getEntriesMap<Achievement, AchievementPackage, SharableAchievementPackage>(__, func(i, e) = AchievementPackage.toSharable(e, i))
    };
    public func getDeployedAchievementPackages(__ : Self) : Sharable {
        Map.getEntriesFilterMap<Achievement, AchievementPackage, SharableAchievementPackage>(
            __,
            func(i, e) = switch (e.principal) {
                case (?_) ?AchievementPackage.toSharable(e, i);
                case (null) null
            },
        )
    };
    public func getAchievementPackagePrincipals(__ : Self) : [(Achievement, Principal)] {
        Map.getEntriesFilterMap<Achievement, AchievementPackage, (Achievement, Principal)>(
            __,
            func(i, package) = switch (package.principal) {
                case (?p) ?(i, p);
                case (null) null
            },
        )
    };

    public func found(__ : Self, achievement : Achievement) : Bool = Map.includes<Achievement, AchievementPackage>(__, Key(achievement));

    /// PUBLIC ////// ITERATORS ////////////

    public func packages(__ : Self) : Iter<(Achievement, AchievementPackage)> = Map.entries<Achievement, AchievementPackage>(__);
    public func deployedAchievementPackages(__ : Self) : Iter<(Achievement, AchievementPackage)> = Iter.filter<(Achievement, AchievementPackage)>(Map.entries(__), func(i, e) = e.principal != null);

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectNotFound(__ : Self, achievement : Achievement) {
        if (not found(__, achievement)) return;
        E.f(#ALREADY_EXISTED("AchievementPackage"), "Cannot add AchievementPackages whose capital raised has already existed")
    };
    public func expectFound(__ : Self, achievement : Achievement) {
        if (found(__, achievement)) return;
        E.f(#NOT_EXISTED("AchievementPackage"), "Cannot find AchievementPackages whose capital raised does not exist")
    }
}
