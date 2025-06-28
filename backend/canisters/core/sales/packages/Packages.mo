import Package "Package";

import E "../../../common/Errors";

import Base "../../../library/Base";
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

    private type Package = Package.Package;
    private type SharablePackage = Package.Sharable;

    private let { NatKey } = Map;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type ForceUpdateCapitalRaisedResult = {
        success : [Text];
        failed : [(Text, Text)];
        unchanged : [Text]
    };

    /// SALES ////// PACKAGES ////////////

    private type Self = Packages;

    public type Packages = Map<Nat, Package>;
    public type Sharable = [SharablePackage];

    public func init() : Self = Map.fromEntries<Nat, Package>([
        (NatKey(E8S.fromFloat(00_010.0).val), Package.init("Hobo", "HOBO", "https://axiom.show/wp-content/uploads/2025/03/Hobo-Card.png")),
        (NatKey(E8S.fromFloat(00_020.0).val), Package.init("Seeker", "SEEKER", "https://axiom.show/wp-content/uploads/2025/03/Seeker-Card.png")),
        (NatKey(E8S.fromFloat(00_050.0).val), Package.init("Scribe", "SCRIBE", "https://axiom.show/wp-content/uploads/2025/03/Scribe-Card.png")),
        (NatKey(E8S.fromFloat(00_100.0).val), Package.init("Scientist", "SCIENT", "https://axiom.show/wp-content/uploads/2025/03/Scientist-Card-.png")),
        (NatKey(E8S.fromFloat(00_500.0).val), Package.init("Philosopher", "PHILOS", "https://axiom.show/wp-content/uploads/2025/03/Philosopher-Card-.png")),
        (NatKey(E8S.fromFloat(01_000.0).val), Package.init("Engineer", "ENGINE", "https://axiom.show/wp-content/uploads/2025/03/Engineer-Card.png")),
        (NatKey(E8S.fromFloat(05_000.0).val), Package.init("Explorer", "EXPLOR", "https://axiom.show/wp-content/uploads/2025/03/Explorer-Card.png")),
        (NatKey(E8S.fromFloat(10_000.0).val), Package.init("Liberator", "LIBER", "https://axiom.show/wp-content/uploads/2025/03/Liberator-Card-.png")),
    ]);

    /// PUBLIC ////// MODIFIERS ////////////

    public func add(__ : Self, capitalRaised : Nat, name : Text, symbol : Text, logoUri : Text) {
        let package : Package = Package.init(name, symbol, logoUri);
        Map.put(__ : Self, NatKey(capitalRaised), package)
    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func package(__ : Self, capitalRaised : Nat) : Package {
        Map.unwrap<Nat, Package>(__, NatKey(capitalRaised))
    };
    public func getPackages(__ : Self) : Sharable {
        Map.getEntriesMap<Nat, Package, SharablePackage>(__, func(i, e) = Package.toSharable(e, i))
    };
    public func getDeployedPackages(__ : Self) : Sharable {
        Map.getEntriesFilterMap<Nat, Package, SharablePackage>(
            __,
            func(i, e) = switch (e.principal) {
                case (?_) ?Package.toSharable(e, i);
                case (null) null
            },
        )
    };
    public func getPackagePrincipals(__ : Self) : [(Nat, Principal)] {
        Map.getEntriesFilterMap<Nat, Package, (Nat, Principal)>(
            __,
            func(i, package) = switch (package.principal) {
                case (?p) ?(i, p);
                case (null) null
            },
        )
    };
    public func getPackagesToMint(__ : Self, capitalRaised : Nat) : [(Nat, Package)] {
        switch (capitalRaised) {
            case (0)[(0, package(__, 0))];
            case (usdPaid) Map.getEntriesFilter<Nat, Package>(__, func(i, _) = i != 0 and i <= usdPaid)
        }
    };

    public func getMinIcpPaid(__ : Self) : Nat {
        var minIcpPaid : ?Nat = null;
        func minIsGreaterThan(target : Nat) : Bool = switch (minIcpPaid) {
            case (null) true;
            case (?icpPaid) icpPaid > target
        };
        for (icpPaid in Map.keys(__)) {
            if (icpPaid != 0 and minIsGreaterThan(icpPaid)) minIcpPaid := ?icpPaid
        };
        Base.unwrap(minIcpPaid)
    };

    public func found(__ : Self, capitalRaised : Nat) : Bool = Map.includes<Nat, Package>(__, NatKey(capitalRaised));

    /// PUBLIC ////// ITERATORS ////////////

    public func packages(__ : Self) : Iter<(Nat, Package)> = Map.entries<Nat, Package>(__);
    public func deployedPackages(__ : Self) : Iter<(Nat, Package)> = Iter.filter<(Nat, Package)>(Map.entries(__), func(i, e) = e.principal != null);

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectNotFound(__ : Self, capitalRaised : Nat) {
        if (not found(__, capitalRaised)) return;
        E.f(#ALREADY_EXISTED("Package"), "Cannot add Packages whose capital raised has already existed")
    };
    public func expectFound(__ : Self, capitalRaised : Nat) {
        if (found(__, capitalRaised)) return;
        E.f(#NOT_EXISTED("Package"), "Cannot find Packages whose capital raised does not exist")
    }
}
