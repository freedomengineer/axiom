# Indicator API Specification

## Dependencies


- Attributes: `Actor`, `Actors`, `Installation`, `Installations`, `Commitment`, `Commitments`, `UpgradeTasks`
- Commons: `C`, `E`
- Interfaces: `ACORNInterface`, `ICPUSDInterface`, `TreasuryInterface`, `SplitInterface`, `AffiliateInterface`, `EscrowInterface`, `SalesInterface`, `AxiomsInterface`, `DAOInterface`, `FacadeInterface`
- Libraries: `Base`, `BlobCommitment`, `CircularBuffer`, `Configs`, `Date`, `Hexadecimal`, `Iter`, `Management`, `Map`, `Version`
- Bases: `Principal`, `Blob`, `Nat`, `Time`, `List`, `ExperimentalCycles`, `Error`, `Debug`, `Timer`, `Int`, `Text`, `Array`
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

### 4. `setActorsConfigs(actorsConfigs)` returns `()`

#### Arguments:

```json
{
  "actorsConfigs": [
    [
      "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR",
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

### 5. `putActorsConfigs(actorsConfigs)` returns `()`

#### Arguments:

```json
{
  "actorsConfigs": [
    [
      "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR",
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

### 6. `initializeFirstSession(updateLevel, releaseNotes, commitments)` returns `()`

#### Arguments:

```json
{
  "updateLevel": "#MAJOR | #MINOR | #PATCH",
  "releaseNotes": [{"#ADDED": ["Text"], "#CHANGED": ["Text"], "#REMOVED": ["Text"], "#FIXED": ["Text"], "#SECURITY": ["Text"]}],
  "commitments": [
    {
      "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN",
      "args": ["Nat8"],
      "moduleHash": "Text"
    }
  ]
}
```

### 7. `initializeSession(issuer, commitHash, updateLevel, releaseNotes, commitments)` returns `()`

#### Arguments:

```json
{
  "issuer": "Principal",
  "commitHash": "Text",
  "updateLevel": "#MAJOR | #MINOR | #PATCH",
  "releaseNotes": [{"#ADDED": ["Text"], "#CHANGED": ["Text"], "#REMOVED": ["Text"], "#FIXED": ["Text"], "#SECURITY": ["Text"]}],
  "commitments": [
    {
      "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN",
      "args": ["Nat8"],
      "moduleHash": "Text"
    }
  ]
}
```

### 8. `deleteSession(issuer)` returns `()`

#### Arguments:

```json
{"issuer": "Principal"}
```

### 9. `installCanisters()` returns `()`

### 10. `enqueueUpgradeTask(proposalId, issuer, actorsConfigs)` returns `()`

#### Arguments:

```json
{
  "proposalId": "Nat",
  "issuer": "Principal",
  "actorsConfigs": [
    [
      "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR",
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

### 11. `extendInstallationExpiryDate(issuer, duration)` returns `()`

#### Arguments:

```json
{"issuer": "Principal", "duration": "Nat"}
```

### 12. `takeArbitrarySnapshots(actorVariants)` returns `()`

#### Arguments:

```json
{
  "actorVariants": [
    "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN"
  ]
}
```

### 13. `loadSnapshots(snapshots)` returns `()`

#### Arguments:

```json
{
  "snapshots": [
    [
      "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN",
      "Text"
    ]
  ]
}
```

### 14. `updateSettings(actorVariants, settings)` returns `()`

#### Arguments:

```json
{
  "actorVariants": [
    "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER"
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

### 15. `createNewCanisters()` returns `()`

### 16. `uploadCommitmentChunk(actorVariant, id, chunk, expectedModuleHash)` returns `()`

#### Arguments:

```json
{
  "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN",
  "id": "Nat8",
  "chunk": "Blob",
  "expectedModuleHash": "Text"
}
```

### 17. `settleCommitment(actorVariant)` returns `()`

#### Arguments:

```json
{
  "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN"
}
```

### 18. `clearCommitment(actorVariant)` returns `()`

#### Arguments:

```json
{
  "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN"
}
```

### 19. `getActorInfo(actorVariant)` returns `Actor.Info`

#### Arguments:

```json
{
  "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER"
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

### 20. `getActorsInfo()` returns `[(Actor.Variant, Actor.Info)]`

#### Returns:
```json
[
  [
    "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER",
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

### 1. `getInstallation(issuer)` returns `Installation.Sharable`

#### Arguments:

```json
{"issuer": "Principal"}
```

#### Returns:
```json
{
  "commitments": [
    {
      "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN",
      "args": ["Nat8"],
      "moduleHash": "Text"
    }
  ],
  "commitHash": "Text",
  "updateLevel": "#MAJOR | #MINOR | #PATCH",
  "releaseNotes": [{"#ADDED": ["Text"], "#CHANGED": ["Text"], "#REMOVED": ["Text"], "#FIXED": ["Text"], "#SECURITY": ["Text"]}]
}
```

### 2. `getInstallationWithTitle(issuer)` returns `(Installation.Sharable, Text)`

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
        "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN",
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

### 3. `getCommitmentUploadedChunks(issuer, actorVariant)` returns `[Nat8]`

#### Arguments:

```json
{
  "issuer": "Principal",
  "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN"
}
```

#### Returns:
```json
["Nat8"]
```

### 4. `getCommitmentComputedModuleHash(issuer, actorVariant)` returns `Text`

#### Arguments:

```json
{
  "issuer": "Principal",
  "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN"
}
```

#### Returns:
```json
"Text"
```

### 5. `checkInstallationSettled(issuer)` returns `Bool`

#### Arguments:

```json
{"issuer": "Principal"}
```

#### Returns:
```json
"Bool"
```

### 6. `getVersion()` returns `Version.Sharable`

#### Returns:
```json
"Text"
```

### 7. `getVariant(principal)` returns `Actor.Variant`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
"#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER"
```

### 8. `getPrincipal(name)` returns `Principal`

#### Arguments:

```json
{
  "name": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER"
}
```

#### Returns:
```json
"Principal"
```

### 9. `getPrincipals()` returns `[(Actor.Variant, Principal)]`

#### Returns:
```json
[
  [
    "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER",
    "Principal"
  ]
]
```

### 10. `getConfig(key)` returns `Configs.SharableValue`

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

### 11. `getConfigs()` returns `Configs.Sharable`

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

### 12. `expectAuthorized(caller, toBe)` returns `()`

#### Arguments:

```json
{
  "caller": "Principal",
  "toBe": [
    "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER"
  ]
}
```

### 13. `expectUnreleased()` returns `()`

### 14. `ACORN()` returns `ACORNInterface.ACORN`

#### Returns:
```json
"ACORN"
```

### 15. `ICPUSD()` returns `ICPUSDInterface.ICPUSD`

#### Returns:
```json
"ICPUSD"
```

### 16. `Treasury()` returns `TreasuryInterface.Treasury`

#### Returns:
```json
"Treasury"
```

### 17. `Split()` returns `SplitInterface.Split`

#### Returns:
```json
"Split"
```

### 18. `Affiliate()` returns `AffiliateInterface.Affiliate`

#### Returns:
```json
"Affiliate"
```

### 19. `Escrow()` returns `EscrowInterface.Escrow`

#### Returns:
```json
"Escrow"
```

### 20. `Sales()` returns `SalesInterface.Sales`

#### Returns:
```json
"Sales"
```

### 21. `Axioms()` returns `AxiomsInterface.Axioms`

#### Returns:
```json
"Axioms"
```

### 22. `DAO()` returns `DAOInterface.DAO`

#### Returns:
```json
"DAO"
```

### 23. `Facade()` returns `FacadeInterface.Facade`

#### Returns:
```json
"Facade"
```
