import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Nat "mo:base/Nat";
import Char "mo:base/Char";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Debug "mo:base/Debug";

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

    private func _fromHexDigit(c : Char) : Nat8 {
        if (c >= '0' and c <= '9') {
            return Nat8.fromNat(Nat32.toNat(Char.toNat32(c) - Char.toNat32('0')))
        };
        if (c >= 'a' and c <= 'f') {
            return Nat8.fromNat(10 + Nat32.toNat(Char.toNat32(c) - Char.toNat32('a')))
        };
        if (c >= 'A' and c <= 'F') {
            return Nat8.fromNat(10 + Nat32.toNat(Char.toNat32(c) - Char.toNat32('A')))
        };
        Debug.trap("Hex decode error: invalid hex digit '" # Char.toText(c) # "'.")
    };

    /// LIBRARY ////// HEXADECIMAL ////////////

    public func encode(array : [Nat8]) : Text = Array.foldLeft<Nat8, Text>(array, "", func(accum, w8) = accum # _encodeW8(w8));

    public func decode(hex : Text) : [Nat8] {
        let chars = Iter.toArray(hex.chars());

        var start : Nat = 0;
        if (chars.size() >= 2 and chars[0] == '0' and (chars[1] == 'x' or chars[1] == 'X')) {
            start := 2
        };

        let count = chars.size() - start;
        if (count % 2 != 0) {
            Debug.trap(
                "Hex decode error: odd number of digits (" #
                Nat.toText(count) # " digits after prefix)."
            )
        };

        let byteCount = count / 2;
        var out : [var Nat8] = Array.init<Nat8>(byteCount, 0);

        var i : Nat = start;
        var j : Nat = 0;
        while (i < chars.size()) {
            let hiChar = chars[i];
            let loChar = chars[i + 1];
            let (hi, lo) = (_fromHexDigit(hiChar), _fromHexDigit(loChar));

            let byte = Nat8.fromNat(Nat8.toNat(hi) * 16 + Nat8.toNat(lo));
            out[j] := byte;
            j += 1;
            i += 2
        };

        Array.freeze(out)
    };

}
