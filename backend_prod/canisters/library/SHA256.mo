import Hexadecimal "Hexadecimal";

import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Nat8 "mo:base/Nat8";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Blob "mo:base/Blob";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private let ROUNDS : [Nat32] = [
        0x428a2f98,
        0x71374491,
        0xb5c0fbcf,
        0xe9b5dba5,
        0x3956c25b,
        0x59f111f1,
        0x923f82a4,
        0xab1c5ed5,
        0xd807aa98,
        0x12835b01,
        0x243185be,
        0x550c7dc3,
        0x72be5d74,
        0x80deb1fe,
        0x9bdc06a7,
        0xc19bf174,
        0xe49b69c1,
        0xefbe4786,
        0x0fc19dc6,
        0x240ca1cc,
        0x2de92c6f,
        0x4a7484aa,
        0x5cb0a9dc,
        0x76f988da,
        0x983e5152,
        0xa831c66d,
        0xb00327c8,
        0xbf597fc7,
        0xc6e00bf3,
        0xd5a79147,
        0x06ca6351,
        0x14292967,
        0x27b70a85,
        0x2e1b2138,
        0x4d2c6dfc,
        0x53380d13,
        0x650a7354,
        0x766a0abb,
        0x81c2c92e,
        0x92722c85,
        0xa2bfe8a1,
        0xa81a664b,
        0xc24b8b70,
        0xc76c51a3,
        0xd192e819,
        0xd6990624,
        0xf40e3585,
        0x106aa070,
        0x19a4c116,
        0x1e376c08,
        0x2748774c,
        0x34b0bcb5,
        0x391c0cb3,
        0x4ed8aa4a,
        0x5b9cca4f,
        0x682e6ff3,
        0x748f82ee,
        0x78a5636f,
        0x84c87814,
        0x8cc70208,
        0x90befffa,
        0xa4506ceb,
        0xbef9a3f7,
        0xc67178f2,
    ];
    private let SHIFTS : [Nat32] = [
        0x6a09e667,
        0xbb67ae85,
        0x3c6ef372,
        0xa54ff53a,
        0x510e527f,
        0x9b05688c,
        0x1f83d9ab,
        0x5be0cd19,
    ];

    private let _rot : (Nat32, Nat32) -> Nat32 = Nat32.bitrotRight;

    private class Digest() {
        private let _s = Array.thaw<Nat32>(SHIFTS);
        private let _x = Array.init<Nat8>(64, 0);
        private var _nx = 0;
        private var _len : Nat64 = 0;

        ///

        private func _block(data : [Nat8]) {
            var w = Array.init<Nat32>(64, 0);
            var start = 0;
            var len = data.size();
            while (len >= 64) {
                var j = 0;
                for (i in Iter.range(0, 15)) {
                    j := i * 4;
                    w[i] := Nat32.fromIntWrap(Nat8.toNat(data[start + j + 0])) << 24 | Nat32.fromIntWrap(Nat8.toNat(data[start + j + 1])) << 16 | Nat32.fromIntWrap(Nat8.toNat(data[start + j + 2])) << 08 | Nat32.fromIntWrap(Nat8.toNat(data[start + j + 3])) << 00
                };
                var v1 : Nat32 = 0;
                var v2 : Nat32 = 0;
                var t1 : Nat32 = 0;
                var t2 : Nat32 = 0;
                for (i in Iter.range(16, 63)) {
                    v1 := w[i - 02];
                    v2 := w[i - 15];
                    t1 := _rot(v1, 17) ^ _rot(v1, 19) ^ (v1 >> 10);
                    t2 := _rot(v2, 07) ^ _rot(v2, 18) ^ (v2 >> 03);
                    w[i] := t1 +% w[i - 07] +% t2 +% w[i - 16]
                };
                var a = _s[0];
                var b = _s[1];
                var c = _s[2];
                var d = _s[3];
                var e = _s[4];
                var f = _s[5];
                var g = _s[6];
                var h = _s[7];
                for (i in Iter.range(0, 63)) {
                    t1 := _rot(e, 06) ^ _rot(e, 11) ^ _rot(e, 25);
                    t1 +%= (e & f) ^ (^ e & g) +% h +% ROUNDS[i] +% w[i];
                    t2 := _rot(a, 02) ^ _rot(a, 13) ^ _rot(a, 22);
                    t2 +%= (a & b) ^ (a & c) ^ (b & c);
                    h := g;
                    g := f;
                    f := e;
                    e := d +% t1;
                    d := c;
                    c := b;
                    b := a;
                    a := t1 +% t2
                };
                _s[0] +%= a;
                _s[1] +%= b;
                _s[2] +%= c;
                _s[3] +%= d;
                _s[4] +%= e;
                _s[5] +%= f;
                _s[6] +%= g;
                _s[7] +%= h;
                start += 64;
                len -= 64
            }
        };

        ///

        public func reset() {
            for (i in Iter.range(0, 7)) {
                _s[i] := SHIFTS[i]
            };
            _nx := 0;
            _len := 0
        };

        public func write(data : [Nat8]) {
            var p = data;
            _len +%= Nat64.fromIntWrap(p.size());
            if (_nx > 0) {
                let n = Nat.min(p.size(), 64 - _nx);
                for (i in Iter.range(0, n - 1)) {
                    _x[_nx + i] := p[i]
                };
                _nx += n;
                if (_nx == 64) {
                    let buf = Array.freeze<Nat8>(_x);
                    _block(buf);
                    _nx := 0
                };
                p := Array.tabulate<Nat8>(
                    p.size() - n,
                    func(i) {
                        return p[n + i]
                    },
                )
            };
            if (p.size() >= 64) {
                let n = Nat64.toNat(Nat64.fromIntWrap(p.size()) & (^ 63));
                let buf = Array.tabulate<Nat8>(
                    n,
                    func(i) {
                        return p[i]
                    },
                );
                _block(buf);
                p := Array.tabulate<Nat8>(
                    p.size() - n,
                    func(i) {
                        return p[n + i]
                    },
                )
            };
            if (p.size() > 0) {
                for (i in Iter.range(0, p.size() - 1)) {
                    _x[i] := p[i]
                };
                _nx := p.size()
            }
        };

        public func sum() : [Nat8] {
            var m = 0;
            var n = _len;
            var t = Nat64.toNat(n) % 64;
            var buf : [var Nat8] = [var];
            if (56 > t) {
                m := 56 - t
            } else {
                m := 120 - t
            };
            n := n << 3;
            buf := Array.init<Nat8>(m, 0);
            if (m > 0) {
                buf[0] := 0x80
            };
            write(Array.freeze<Nat8>(buf));
            buf := Array.init<Nat8>(8, 0);
            for (i in Iter.range(0, 7)) {
                let j : Nat64 = 56 -% 8 *% Nat64.fromIntWrap(i);
                buf[i] := Nat8.fromIntWrap(Nat64.toNat(n >> j))
            };
            write(Array.freeze<Nat8>(buf));
            let hash = Array.init<Nat8>(32, 0);
            for (i in Iter.range(0, 7)) {
                for (j in Iter.range(0, 3)) {
                    let k : Nat32 = 24 -% 8 *% Nat32.fromIntWrap(j);
                    hash[4 * i + j] := Nat8.fromIntWrap(Nat32.toNat(_s[i] >> k))
                }
            };
            return Array.freeze<Nat8>(hash)
        }
    };

    /// LIBRARY ////// SHA256 ////////////

    public func fromBytes(data : [Nat8]) : Text {
        let digest = Digest();
        digest.write(data);
        let sum : [Nat8] = digest.sum();
        Hexadecimal.encode(sum)
    };
    public func fromBlob(data : Blob) : Text {
        let bytes = Blob.toArray(data);
        fromBytes(bytes)
    };
    public func fromBytesRaw(data : [Nat8]) : Blob {
        let digest = Digest();
        digest.write(data);
        let sum : [Nat8] = digest.sum();
        Blob.fromArray(sum)
    };
    public func fromBlobRaw(data : Blob) : Blob {
        let bytes = Blob.toArray(data);
        fromBytesRaw(bytes)
    }
}
