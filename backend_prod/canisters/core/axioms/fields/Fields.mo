import Field "Field";

import Hypothesis "../hypotheses/Hypothesis";
import User "../users/User";

import E "../../../common/Errors";

import Base "../../../library/Base";
import List "../../../library/List";
import Tree "../../../library/Tree";
import Set "../../../library/Set";

import Time "mo:base/Time";
import Principal "mo:base/Principal";
import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Int "mo:base/Int";
import Text "mo:base/Text";
import Order "mo:base/Order";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type Tree<K, V> = Tree.Tree<K, V>;
    private type Set<T> = Set.Set<T>;
    private type List<T> = List.List<T>;
    private type Compare<T> = Base.Compare<T>;
    private type Sorted<T> = Base.Sort<T>;
    private type Order = Base.Order;
    private type Ordered = Order.Order;
    private type Time = Time.Time;

    private type Field = Field.Field;
    private type Role = Field.Role;
    private type SharableField = Field.Sharable;
    private type Hypothesis = Hypothesis.Hypothesis;
    private type User = User.User;

    private type Entry = (Text, Field);

    private let { TextKey } = Tree;

    private func _alphabetical(orderBy : Order) : Compare<Entry> = switch (orderBy) {
        case (#ascending) func((a, _) : Entry, (b, _) : Entry) = Text.compare(a, b);
        case (#descending) func((a, _) : Entry, (b, _) : Entry) = Text.compare(b, a)
    };
    private func _recent(orderBy : Order) : Compare<Entry> = switch (orderBy) {
        case (#ascending) func((_, a) : Entry, (_, b) : Entry) = Int.compare(a.creationDate, b.creationDate);
        case (#descending) func((_, a) : Entry, (_, b) : Entry) = Int.compare(b.creationDate, a.creationDate)
    };
    private func _popularity(orderBy : Order) : Compare<Entry> = switch (orderBy) {
        case (#ascending) func((_, a) : Entry, (_, b) : Entry) = Nat.compare(Set.size(a.members), Set.size(b.members));
        case (#descending) func((_, a) : Entry, (_, b) : Entry) = Nat.compare(Set.size(b.members), Set.size(a.members))
    };

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Filter = {
        joinedBy : ?Principal;
        containsPattern : ?Text
    };
    public type Sort = {
        #recent;
        #alphabetical;
        #popularity
    };

    /// AXIOMS ////// FIELDS ////////////

    private type Self = Fields;

    public type Fields = Tree<Text, Field>;
    public type Sharable = [SharableField];

    public func init() : Self = Tree.new();

    /// PUBLIC ////// MODIFIERS ////////////

    public func addFounder(__ : Self, founder : Principal) {
        Tree.put(__, TextKey("Axiom governance"), Field.fromFounder(founder));
        Tree.put(__, TextKey("Anthropology"), Field.init("Discussion space for Anthropology field"));
        Tree.put(__, TextKey("Archaeology"), Field.init("Discussion space for Archaeology field"));
        Tree.put(__, TextKey("History"), Field.init("Discussion space for History field"));
        Tree.put(__, TextKey("Linguistics and languages"), Field.init("Discussion space for Linguistics and languages field"));
        Tree.put(__, TextKey("Philosophy"), Field.init("Discussion space for Philosophy field"));
        Tree.put(__, TextKey("Religion"), Field.init("Discussion space for Religion field"));
        Tree.put(__, TextKey("The arts"), Field.init("Discussion space for The arts field"));
        Tree.put(__, TextKey("Economics"), Field.init("Discussion space for Economics field"));
        Tree.put(__, TextKey("Geography"), Field.init("Discussion space for Geography field"));
        Tree.put(__, TextKey("Politics"), Field.init("Discussion space for Politics field"));
        Tree.put(__, TextKey("Psychology"), Field.init("Discussion space for Psychology field"));
        Tree.put(__, TextKey("Sociology"), Field.init("Discussion space for Sociology field"));
        Tree.put(__, TextKey("Biology"), Field.init("Discussion space for Biology field"));
        Tree.put(__, TextKey("Chemistry"), Field.init("Discussion space for Chemistry field"));
        Tree.put(__, TextKey("Earth sciences"), Field.init("Discussion space for Earth sciences field"));
        Tree.put(__, TextKey("Physics"), Field.init("Discussion space for Physics field"));
        Tree.put(__, TextKey("Space sciences"), Field.init("Discussion space for Space sciences field"));
        Tree.put(__, TextKey("Computer sciences"), Field.init("Discussion space for Computer sciences field"));
        Tree.put(__, TextKey("Logic"), Field.init("Discussion space for Logic field"));
        Tree.put(__, TextKey("Mathematics"), Field.init("Discussion space for Mathematics field"))
    };

    public func create(__ : Self, name : Text, description : Text) {
        switch (Tree.get(__, TextKey(name))) {
            case (?field) Field.updateDescription(field, description);
            case (null) Tree.put(__, TextKey(name), Field.init(description))
        };

    };

    /// PUBLIC ////// ACCESSORS ////////////

    public func size(__ : Self) : Nat = Tree.size(__);

    public func found(__ : Self, name : Text) : Bool = Tree.includes(__, TextKey(name));

    public func field(__ : Self, name : Text) : Field {
        switch (Tree.get(__, TextKey(name))) {
            case (?field) field;
            case (_) E.f(#NOT_EXISTED("Field"), "Field " # debug_show name # " not found")
        }
    };
    public func getField(__ : Self, name : Text, callerUser : ?(Principal, User)) : SharableField {
        let getCallerRole : (Field) -> ?Role = Field.callerRoleCallback(callerUser);
        Field.toSharable(field(__, name), name, getCallerRole)
    };
    public func getFields(__ : Self, filter : Filter, sort : Sorted<Sort>, callerUser : ?(Principal, User), getUser : (Principal) -> User) : Sharable {
        let getCallerRole : (Field) -> ?Role = Field.callerRoleCallback(callerUser);

        var filtered : ?[Entry] = null;
        let toEntry : (Text) -> Entry = func(name) = Tree.unwrapEntry(__, TextKey(name));
        let toSharable : (Entry) -> SharableField = func(name, field) = Field.toSharable(field, name, getCallerRole);

        switch (filter.joinedBy) {
            case (null) {};
            case (?joinedBy) filtered := ?Set.toArrayMap(getUser(joinedBy).joinedFields, toEntry)
        };
        switch (filter.containsPattern, filtered) {
            case (null, _) {};
            case (?pattern, null) {
                let patternIns = #text(Text.toLowercase(pattern));
                filtered := ?Tree.getEntriesFilterMap<Text, Field, Entry>(
                    __,
                    func(i, e) = switch (Field.containsPattern(e, patternIns)) {
                        case (true) ?(i, e);
                        case (false) null
                    },
                )
            };
            case (?pattern, ?prev) {
                let patternIns = #text(Text.toLowercase(pattern));
                filtered := ?Array.filter<Entry>(prev, func(_, e) = Field.containsPattern(e, patternIns))
            }
        };

        switch (sort.by, sort.order, filtered) {
            case (#alphabetical, #ascending, null) Tree.getEntriesMap(__, toSharable);
            case (#alphabetical, #descending, null) Tree.getEntriesMapRev(__, toSharable);
            case (#recent, order, null) Array.map<Entry, SharableField>(Array.sort(Tree.getEntries(__), _recent(order)), toSharable);
            case (#popularity, order, null) Array.map<Entry, SharableField>(Array.sort(Tree.getEntries(__), _popularity(order)), toSharable);
            case (#alphabetical, order, ?unsorted) Array.map<Entry, SharableField>(Array.sort(unsorted, _alphabetical(order)), toSharable);
            case (#recent, order, ?unsorted) Array.map<Entry, SharableField>(Array.sort(unsorted, _recent(order)), toSharable);
            case (#popularity, order, ?unsorted) Array.map<Entry, SharableField>(Array.sort(unsorted, _popularity(order)), toSharable)
        }
    };

    /// PUBLIC ////// ASSERTERS ////////////

    public func expectFound(__ : Self, name : Text) {
        if (found(__, name)) return;
        E.f(#NOT_EXISTED("Field"), "Field " # debug_show name # " not found")
    };
    public func expectNotFound(__ : Self, name : Text) {
        if (not found(__, name)) return;
        E.f(#ALREADY_EXISTED("Field"), "Field " # debug_show name # " already exists")
    }
}
