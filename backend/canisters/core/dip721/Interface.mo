import Types "Types";

module {
    public type DIP721 = actor {
        balanceOfDip721 : query (Principal) -> async Nat64;
        ownerOfDip721 : query (Types.TokenId) -> async Types.OwnerResult;
        safeTransferFromDip721 : shared (Principal, Principal, Types.TokenId) -> async Types.TxReceipt;
        transferFromDip721 : shared (Principal, Principal, Types.TokenId) -> async Types.TxReceipt;
        supportedInterfacesDip721 : query () -> async [Types.InterfaceId];
        logoDip721 : query () -> async Types.LogoResult;
        nameDip721 : query () -> async Text;
        symbolDip721 : query () -> async Text;
        totalSupplyDip721 : query () -> async Nat64;
        getMetadataDip721 : query (Types.TokenId) -> async Types.MetadataResult;
        getMaxLimitDip721 : query () -> async Nat16;
        getMetadataForUserDip721 : query (Principal) -> async Types.ExtendedMetadataResult;
        getTokenIdsForUserDip721 : query (Principal) -> async [Types.TokenId];
        mintDip721 : shared (Principal, Types.MetadataDesc) -> async Types.MintReceipt
    }
}
