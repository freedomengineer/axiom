import Nat8 "mo:base/Nat8";
import Char "mo:base/Char";
import Array "mo:base/Array";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private let BASE : Nat8 = 0x10;
    private let SYMBOLS = [
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
    ];

    private func _encodeW8(w8 : Nat8) : Text = Char.toText(SYMBOLS[Nat8.toNat(w8 / BASE)]) # Char.toText(SYMBOLS[Nat8.toNat(w8 % BASE)]);

    /// LIBRARY ////// HEXADECIMAL ////////////

    public func encode(array : [Nat8]) : Text = Array.foldLeft<Nat8, Text>(array, "", func(accum, w8) = accum # _encodeW8(w8))
}
