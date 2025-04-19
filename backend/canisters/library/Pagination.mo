import Iter "mo:base/Iter";
import Array "mo:base/Array";

module {
    /// LIBRARY ////// PAGINATION ////////////

    public type Pagination<T> = { result : [T]; is : Nat; of : Nat };

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
    }
}
