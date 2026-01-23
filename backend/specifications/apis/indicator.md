# Indicator API Specification

## Dependencies


- Attributes: `Actor`, `Actors`, `Installation`, `Installations`, `Commitment`, `Commitments`, `UpgradeTasks`
- Commons: `C`, `E`
- Interfaces: `ACORNInterface`, `ICPUSDInterface`, `TreasuryInterface`, `SplitInterface`, `AffiliateInterface`, `EscrowInterface`, `SalesInterface`, `AxiomsInterface`, `EncyclopediaInterface`, `ChatInterface`, `AssetsInterface`, `DAOInterface`, `FacadeInterface`
- Libraries: `Base`, `BlobCommitment`, `CircularBuffer`, `Configs`, `Date`, `Hexadecimal`, `Iter`, `Management`, `Map`, `Version`
- Bases: `Principal`, `Blob`, `Nat`, `Time`, `List`, `ExperimentalCycles`, `Error`, `Debug`, `Timer`, `Int`, `Text`, `Array`
## Modifiers

### 1. `shiftToMidnight(days)` returns `()`

#### Arguments:

```json
{"days": "Nat"}
```

### 2. `addController()` returns `()`

### 3. `initialize()` returns `()`

### 4. `setConfigs(entries)` returns `()`

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

### 5. `putConfigs(entries)` returns `()`

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

### 6. `setActorsConfigs(actorsConfigs)` returns `()`

#### Arguments:

```json
{
  "actorsConfigs": [
    [
      "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR",
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
    ]
  ]
}
```

### 7. `putActorsConfigs(actorsConfigs)` returns `()`

#### Arguments:

```json
{
  "actorsConfigs": [
    [
      "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR",
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
    ]
  ]
}
```

### 8. `initializeFirstSession(updateLevel, releaseNotes, commitments)` returns `()`

#### Arguments:

```json
{
  "updateLevel": "#MAJOR | #MINOR | #PATCH",
  "releaseNotes": [{"#ADDED": ["Text"], "#CHANGED": ["Text"], "#REMOVED": ["Text"], "#FIXED": ["Text"], "#SECURITY": ["Text"]}],
  "commitments": [
    {
      "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN",
      "args": ["Nat8"],
      "moduleHash": "Text"
    }
  ]
}
```

### 9. `initializeSession(issuer, commitHash, updateLevel, releaseNotes, commitments)` returns `()`

#### Arguments:

```json
{
  "issuer": "Principal",
  "commitHash": "Text",
  "updateLevel": "#MAJOR | #MINOR | #PATCH",
  "releaseNotes": [{"#ADDED": ["Text"], "#CHANGED": ["Text"], "#REMOVED": ["Text"], "#FIXED": ["Text"], "#SECURITY": ["Text"]}],
  "commitments": [
    {
      "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN",
      "args": ["Nat8"],
      "moduleHash": "Text"
    }
  ]
}
```

### 10. `deleteSession(issuer)` returns `()`

#### Arguments:

```json
{"issuer": "Principal"}
```

### 11. `installCanisters()` returns `()`

### 12. `enqueueUpgradeTask(proposalId, issuer, actorsConfigs)` returns `()`

#### Arguments:

```json
{
  "proposalId": "Nat",
  "issuer": "Principal",
  "actorsConfigs": [
    [
      "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR",
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
    ]
  ]
}
```

### 13. `extendInstallationExpiryDate(issuer, duration)` returns `()`

#### Arguments:

```json
{"issuer": "Principal", "duration": "Nat"}
```

### 14. `takeArbitrarySnapshots(actorVariants)` returns `()`

#### Arguments:

```json
{
  "actorVariants": [
    "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN"
  ]
}
```

### 15. `loadSnapshots(snapshots)` returns `()`

#### Arguments:

```json
{
  "snapshots": [
    [
      "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN",
      "Text"
    ]
  ]
}
```

### 16. `popSnapshots(actorVariants)` returns `()`

#### Arguments:

```json
{
  "actorVariants": [
    "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN"
  ]
}
```

### 17. `updateSettings(actorVariants, settings)` returns `()`

#### Arguments:

```json
{
  "actorVariants": [
    "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER"
  ],
  "settings": {
    "controllers": ["Principal"],
    "compute_allocation": "Nat",
    "memory_allocation": "Nat",
    "freezing_threshold": "Nat",
    "reserved_cycles_limit": "Nat",
    "log_visibility": {"#CONTROLLERS": null, "// #PUBLIC": null, "#ALLOWED_VIEWERS": ["Principal"]},
    "wasm_memory_limit": "Nat",
    "wasm_memory_threshold": "Nat",
    "environment_variables": [{"name": "Text", "value": "Text"}]
  }
}
```

### 18. `createNewCanisters()` returns `()`

### 19. `uploadCommitmentChunk(actorVariant, id, chunk, expectedModuleHash)` returns `()`

#### Arguments:

```json
{
  "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN",
  "id": "Nat8",
  "chunk": "Blob",
  "expectedModuleHash": "Text"
}
```

### 20. `settleCommitment(actorVariant)` returns `()`

#### Arguments:

```json
{
  "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN"
}
```

### 21. `clearCommitment(actorVariant)` returns `()`

#### Arguments:

```json
{
  "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN"
}
```

### 22. `getActorInfo(actorVariant)` returns `Actor.Info`

#### Arguments:

```json
{
  "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER"
}
```

#### Returns:
```json
{
  "status": "#STOPPED | #STOPPING | #RUNNING",
  "memorySize": "Nat",
  "cycles": "Nat",
  "args": ["Nat8"],
  "moduleHash": "Text",
  "commitHash": "Text",
  "snapshots": [
    {
      "id": "Text",
      "taken_at_timestamp": "Nat64",
      "total_size": "Nat64",
      "from": {"#BEFOREPROPOSAL": "Nat", "#AFTERPROPOSAL": "Nat", "#ARBITRARY": null},
      "moduleHash": "Text"
    }
  ]
}
```

### 23. `getActorsInfo()` returns `[(Actor.Variant, Actor.Info)]`

#### Returns:
```json
[
  [
    "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER",
    {
      "status": "#STOPPED | #STOPPING | #RUNNING",
      "memorySize": "Nat",
      "cycles": "Nat",
      "args": ["Nat8"],
      "moduleHash": "Text",
      "commitHash": "Text",
      "snapshots": [
        {
          "id": "Text",
          "taken_at_timestamp": "Nat64",
          "total_size": "Nat64",
          "from": {"#BEFOREPROPOSAL": "Nat", "#AFTERPROPOSAL": "Nat", "#ARBITRARY": null},
          "moduleHash": "Text"
        }
      ]
    }
  ]
]
```

## Accessors

### 1. `getCanisterTime()` returns `Int`

#### Returns:
```json
"Int"
```

### 2. `getInstallation(issuer)` returns `Installation.Sharable`

#### Arguments:

```json
{"issuer": "Principal"}
```

#### Returns:
```json
{
  "commitments": [
    {
      "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN",
      "args": ["Nat8"],
      "moduleHash": "Text"
    }
  ],
  "commitHash": "Text",
  "updateLevel": "#MAJOR | #MINOR | #PATCH",
  "releaseNotes": [{"#ADDED": ["Text"], "#CHANGED": ["Text"], "#REMOVED": ["Text"], "#FIXED": ["Text"], "#SECURITY": ["Text"]}]
}
```

### 3. `getInstallationWithTitle(issuer)` returns `(Installation.Sharable, Text)`

#### Arguments:

```json
{"issuer": "Principal"}
```

#### Returns:
```json
[
  {
    "commitments": [
      {
        "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN",
        "args": ["Nat8"],
        "moduleHash": "Text"
      }
    ],
    "commitHash": "Text",
    "updateLevel": "#MAJOR | #MINOR | #PATCH",
    "releaseNotes": [{"#ADDED": ["Text"], "#CHANGED": ["Text"], "#REMOVED": ["Text"], "#FIXED": ["Text"], "#SECURITY": ["Text"]}]
  },
  "Text"
]
```

### 4. `getCommitmentUploadedChunks(issuer, actorVariant)` returns `[Nat8]`

#### Arguments:

```json
{
  "issuer": "Principal",
  "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN"
}
```

#### Returns:
```json
["Nat8"]
```

### 5. `getCommitmentComputedModuleHash(issuer, actorVariant)` returns `Text`

#### Arguments:

```json
{
  "issuer": "Principal",
  "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN"
}
```

#### Returns:
```json
"Text"
```

### 6. `checkInstallationSettled(issuer)` returns `Bool`

#### Arguments:

```json
{"issuer": "Principal"}
```

#### Returns:
```json
"Bool"
```

### 7. `getVersion()` returns `Version.Sharable`

#### Returns:
```json
"Text"
```

### 8. `getVariant(principal)` returns `Actor.Variant`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
"#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER"
```

### 9. `getPrincipal(name)` returns `Principal`

#### Arguments:

```json
{
  "name": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER"
}
```

#### Returns:
```json
"Principal"
```

### 10. `getPrincipals()` returns `[(Actor.Variant, Principal)]`

#### Returns:
```json
[
  [
    "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER",
    "Principal"
  ]
]
```

### 11. `getConfig(key)` returns `Configs.SharableValue`

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

### 12. `getConfigs()` returns `Configs.Sharable`

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

### 13. `expectAuthorized(caller, toBe)` returns `()`

#### Arguments:

```json
{
  "caller": "Principal",
  "toBe": [
    "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER"
  ]
}
```

### 14. `expectUnreleased()` returns `()`

### 15. `ACORN()` returns `ACORNInterface.ACORN`

#### Returns:
```json
"ACORN"
```

### 16. `ICPUSD()` returns `ICPUSDInterface.ICPUSD`

#### Returns:
```json
"ICPUSD"
```

### 17. `Treasury()` returns `TreasuryInterface.Treasury`

#### Returns:
```json
"Treasury"
```

### 18. `Split()` returns `SplitInterface.Split`

#### Returns:
```json
"Split"
```

### 19. `Affiliate()` returns `AffiliateInterface.Affiliate`

#### Returns:
```json
"Affiliate"
```

### 20. `Escrow()` returns `EscrowInterface.Escrow`

#### Returns:
```json
"Escrow"
```

### 21. `Sales()` returns `SalesInterface.Sales`

#### Returns:
```json
"Sales"
```

### 22. `Axioms()` returns `AxiomsInterface.Axioms`

#### Returns:
```json
"Axioms"
```

### 23. `DAO()` returns `DAOInterface.DAO`

#### Returns:
```json
"DAO"
```

### 24. `Facade()` returns `FacadeInterface.Facade`

#### Returns:
```json
"Facade"
```

### 25. `Encyclopedia()` returns `EncyclopediaInterface.Encyclopedia`

#### Returns:
```json
"Encyclopedia"
```

### 26. `Chat()` returns `ChatInterface.Chat`

#### Returns:
```json
"Chat"
```

### 27. `Assets()` returns `AssetsInterface.Assets`

#### Returns:
```json
"Assets"
```
