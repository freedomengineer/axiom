import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";

module {
    /// LIBRARY ////// PAGINATION ////////////

    public type Pagination<T> = { result : [T]; is : Nat; of : Nat };

    public type TopResult = [(Principal, Nat)];
    public type TopNonPagination = {
        result : TopResult;
        callerRank : ?Nat
    };
    public type TopPagination = {
        result : TopResult;
        callerRank : ?Nat;
        is : Nat;
        of : Nat
    };

    public func paginate<T>(result : [T], page : Nat, limit : Nat) : Pagination<T> {
        let size : Nat = result.size();

        if (size == 0) return { result = []; is = 1; of = 1 };

        let of : Nat = (size - 1) / limit + 1;
        let is = switch (page >= of) {
            case (true) of;
            case (false) page
        };

        let start : Nat = (is - 1) * limit;
        let end : Nat = switch (is >= of) {
            case (true) size;
            case (false) start + limit
        };
        let trimmedResult : [T] = Iter.toArray(Array.slice<T>(result, start, end));

        { result = trimmedResult; is; of }
    };

    public func topPaginate(result : [(Principal, Nat)], page : Nat, limit : Nat, caller : Principal) : TopPagination {
        let sortedResult : [(Principal, Nat)] = Array.sort<(Principal, Nat)>(result, func((_, a), (_, b)) = Nat.compare(a, b));
        let callerRank : ?Nat = switch (Array.find<(Principal, Nat)>(sortedResult, func((p, _)) = p == caller)) {
            case (?(_, rank)) ?rank;
            case (null) null
        };

        { paginate<(Principal, Nat)>(sortedResult, page, limit) with callerRank }
    };

    public func topNonPaginate(result : TopResult, caller : Principal) : TopNonPagination {
        let sortedResult : [(Principal, Nat)] = Array.sort<(Principal, Nat)>(result, func((_, a), (_, b)) = Nat.compare(a, b));
        let callerRank : ?Nat = switch (Array.find<(Principal, Nat)>(sortedResult, func((p, _)) = p == caller)) {
            case (?(_, rank)) ?rank;
            case (null) null
        };

        { result = sortedResult; callerRank }
    }
}
