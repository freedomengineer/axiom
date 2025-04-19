import E "../common/Errors";

import Configs "Configs";
import List "List";

import Text "mo:base/Text";
import Blob "mo:base/Blob";

module {
    /// PRIVATE ////// DECLARATIONS ////////////

    private type List<T> = List.List<T>;
    private type Configs = Configs.Configs;

    /// PUBLIC ////// DECLARATIONS ////////////

    public type Picture = { blob : Blob };
    public type Hyperlink = { anchorText : Text; url : Text };
    public type Note = { content : Text; extended : Bool };

    public type FormatVariant = {
        #Picture;
        #Hyperlink;
        #Note
    };

    public func validateHyperlink({ anchorText; url } : Hyperlink, configs : Configs) {
        let MIN_ANCHOR_LENGTH : Nat = Configs.Nat(configs, "MIN_ANCHOR_LENGTH");
        let MAX_ANCHOR_LENGTH : Nat = Configs.Nat(configs, "MAX_ANCHOR_LENGTH");
        let MIN_URL_LENGTH : Nat = Configs.Nat(configs, "MIN_URL_LENGTH");
        let MAX_URL_LENGTH : Nat = Configs.Nat(configs, "MAX_URL_LENGTH");

        let anchorTextSize : Nat = anchorText.size();
        let urlSize : Nat = url.size();

        if (anchorTextSize < MIN_ANCHOR_LENGTH) E.f(#NOT_VALID("Hyperlink"), "Given Hyperlink anchor text must be at least " # debug_show MIN_ANCHOR_LENGTH # " characters long (current: " # debug_show anchorTextSize # ")");
        if (anchorTextSize > MAX_ANCHOR_LENGTH) E.f(#NOT_VALID("Hyperlink"), "Given Hyperlink anchor text must be at most " # debug_show MAX_ANCHOR_LENGTH # " characters long (current: " # debug_show anchorTextSize # ")");
        if (urlSize < MIN_URL_LENGTH) E.f(#NOT_VALID("Hyperlink"), "Given Hyperlink URL must be at least " # debug_show MIN_URL_LENGTH # " characters long (current: " # debug_show urlSize # ")");
        if (urlSize > MAX_URL_LENGTH) E.f(#NOT_VALID("Hyperlink"), "Given Hyperlink URL must be at most " # debug_show MAX_URL_LENGTH # " characters long (current: " # debug_show urlSize # ")");

        switch (Text.stripStart(url, #text("https://"))) {
            case (null) E.f(#NOT_VALID("Hyperlink"), "Hyperlink must start with \"https://\"");
            case (?url) {
                if (not Text.contains(url, #char('.'))) E.f(#NOT_VALID("Hyperlink"), "Hyperlink must contain a domain name");
                if (Text.contains(url, #predicate(func(c) = c == ' ' or c == '\\'))) E.f(#NOT_VALID("Hyperlink"), "Hyperlink must not contain spaces or backslashes");
                if (Text.contains(url, #text("//"))) E.f(#NOT_VALID("Hyperlink"), "Hyperlink must not contain \"//\"");
                if (Text.contains(url, #text(".."))) E.f(#NOT_VALID("Hyperlink"), "Hyperlink must not contain \"..\"");
                if (Text.contains(url, #text("/."))) E.f(#NOT_VALID("Hyperlink"), "Hyperlink must not contain \"/.\"");
                if (Text.contains(url, #text("./"))) E.f(#NOT_VALID("Hyperlink"), "Hyperlink must not contain \"./\"")
            }
        }
    };

    public func validatePicture({ blob } : Picture) {};
    public func validateNote({ content; extended } : Note, noteLimit : Nat, extendedNoteLimit : Nat) {
        let size : Nat = content.size();
        if (size == 0) E.f(#NOT_VALID("Note"), "Given Note content must not empty");
        switch (extended) {
            case (false) if (size > noteLimit) E.f(#NOT_VALID("Note"), "Given Note content exceed " # debug_show noteLimit # " characters limit (current: " # debug_show size # ")");
            case (true) if (size > extendedNoteLimit) E.f(#NOT_VALID("Extended Note"), "Given Extended Note content exceed " # debug_show extendedNoteLimit # " characters limit (current: " # debug_show size # ")")
        }
    }
}
