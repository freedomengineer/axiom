# Sales API Specification

## Dependencies


- Attributes: `Package`, `Packages`, `AchievementPackage`, `AchievementPackages`, `EscrowBurial`, `FacadeUser`, `DIP721`
- Interfaces: `DIP721Interface`, `AffiliateInterface`, `EscrowInterface`, `TreasuryInterface`, `FacadeInterface`, `IndicatorInterface`, `IndicatorInterfaceOld`
- Commons: `E`
- Libraries: `Array`, `Base`, `Configs`, `E8S`, `List`, `Proportion`
- Bases: `Nat`, `Principal`, `ExperimentalCycles`, `Debug`, `Error`
## Modifiers

### 1. `initialize()` returns `()`

### 2. `setConfigs(entries)` returns `()`

#### Arguments:

```json
{
  "entries": [
    [
      "Text",
      {
        "#BOOL": "Bool",
        "#NAT": "Nat",
        "#FLOAT": "Float",
        "#TEXT": "Text",
        "#E8S": "Nat",
        "#DURATION": "Nat",
        "#DATE": "Nat",
        "#PROPORTION": ["Nat", "Nat"],
        "#RANGENAT": ["Nat"],
        "#RANGEINT": ["Int"],
        "#RANGEFLOAT": ["Float"]
      }
    ]
  ]
}
```

### 3. `putConfigs(entries)` returns `()`

#### Arguments:

```json
{
  "entries": [
    [
      "Text",
      {
        "#BOOL": "Bool",
        "#NAT": "Nat",
        "#FLOAT": "Float",
        "#TEXT": "Text",
        "#E8S": "Nat",
        "#DURATION": "Nat",
        "#DATE": "Nat",
        "#PROPORTION": ["Nat", "Nat"],
        "#RANGENAT": ["Nat"],
        "#RANGEINT": ["Int"],
        "#RANGEFLOAT": ["Float"]
      }
    ]
  ]
}
```

### 4. `mintPackage(recipient, capitalRaised)` returns `Nat`

#### Arguments:

```json
{"recipient": "Principal", "capitalRaised": "Nat"}
```

#### Returns:
```json
"Nat"
```

### 5. `addPackage(capitalRaised, name, symbol, logoUri)` returns `()`

#### Arguments:

```json
{"capitalRaised": "Nat", "name": "Text", "symbol": "Text", "logoUri": "Text"}
```

### 6. `deployPackage(capitalRaised)` returns `()`

#### Arguments:

```json
{"capitalRaised": "Nat"}
```

### 7. `addAchievementPackage(achievement, name, symbol, logoUri)` returns `()`

#### Arguments:

```json
{"achievement": "#REFERRAL | #OCTUPLEBURIAL", "name": "Text", "symbol": "Text", "logoUri": "Text"}
```

### 8. `deployAchievementPackage(achievement)` returns `()`

#### Arguments:

```json
{"achievement": "#REFERRAL | #OCTUPLEBURIAL"}
```

### 9. `forceUpdateCapitalRaised(users)` returns `Packages.ForceUpdateCapitalRaisedResult`

#### Arguments:

```json
{"users": ["Principal"]}
```

#### Returns:
```json
{"success": ["Principal"], "failed": [["Principal", "Text"]]}
```

### 10. `upgradePackage()` returns `()`

### 11. `mintAchievementPackage(achievement)` returns `()`

#### Arguments:

```json
{"achievement": "#REFERRAL | #OCTUPLEBURIAL"}
```

### 12. `computeAcornToMint(capitalRaised)` returns `Package.ACORNToMint<Nat>`

#### Arguments:

```json
{"capitalRaised": "Nat"}
```

#### Returns:
```json
{"liquid": "Nat", "buried": "Nat"}
```

### 13. `getOwnedPackages(principal)` returns `Packages.Sharable`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
[
  {
    "capitalRaised": "Nat",
    "principal": "Principal",
    "metadata": {"logo": {"logo_type": "Text", "data": "Text"}, "name": "Text", "symbol": "Text", "maxLimit": "Nat16"}
  }
]
```

### 14. `getOwnedAchievementPackages(principal)` returns `AchievementPackages.Sharable`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
[
  {
    "achievement": "#REFERRAL | #OCTUPLEBURIAL",
    "principal": "Principal",
    "metadata": {"logo": {"logo_type": "Text", "data": "Text"}, "name": "Text", "symbol": "Text", "maxLimit": "Nat16"}
  }
]
```

## Accessors

### 1. `getConfig(key)` returns `Configs.SharableValue`

#### Arguments:

```json
{"key": "Text"}
```

#### Returns:
```json
{
  "#BOOL": "Bool",
  "#NAT": "Nat",
  "#FLOAT": "Float",
  "#TEXT": "Text",
  "#E8S": "Nat",
  "#DURATION": "Nat",
  "#DATE": "Nat",
  "#PROPORTION": ["Nat", "Nat"],
  "#RANGENAT": ["Nat"],
  "#RANGEINT": ["Int"],
  "#RANGEFLOAT": ["Float"]
}
```

### 2. `getConfigs()` returns `Configs.Sharable`

#### Returns:
```json
[
  [
    "Text",
    {
      "#BOOL": "Bool",
      "#NAT": "Nat",
      "#FLOAT": "Float",
      "#TEXT": "Text",
      "#E8S": "Nat",
      "#DURATION": "Nat",
      "#DATE": "Nat",
      "#PROPORTION": ["Nat", "Nat"],
      "#RANGENAT": ["Nat"],
      "#RANGEINT": ["Int"],
      "#RANGEFLOAT": ["Float"]
    }
  ]
]
```

### 3. `getPackagePrincipals()` returns `[(Nat, Principal)]`

#### Returns:
```json
[["Nat", "Principal"]]
```

### 4. `getPackages()` returns `Packages.Sharable`

#### Returns:
```json
[
  {
    "capitalRaised": "Nat",
    "principal": "Principal",
    "metadata": {"logo": {"logo_type": "Text", "data": "Text"}, "name": "Text", "symbol": "Text", "maxLimit": "Nat16"}
  }
]
```

### 5. `getAchievementPackagePrincipals()` returns `[(AchievementPackage.Achievement, Principal)]`

#### Returns:
```json
[["#REFERRAL | #OCTUPLEBURIAL", "Principal"]]
```

### 6. `getAchievementPackages()` returns `AchievementPackages.Sharable`

#### Returns:
```json
[
  {
    "achievement": "#REFERRAL | #OCTUPLEBURIAL",
    "principal": "Principal",
    "metadata": {"logo": {"logo_type": "Text", "data": "Text"}, "name": "Text", "symbol": "Text", "maxLimit": "Nat16"}
  }
]
```

### 7. `expectPackageNotFound(capitalRaised)` returns `()`

#### Arguments:

```json
{"capitalRaised": "Nat"}
```

### 8. `expectPackageFound(capitalRaised)` returns `Nat`

#### Arguments:

```json
{"capitalRaised": "Nat"}
```

#### Returns:
```json
"Nat"
```
