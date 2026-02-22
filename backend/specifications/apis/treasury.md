# Treasury API Specification

## Dependencies


- Attributes: `Allocation`, `Allocations`, `Actor`, `ACORNTypes`
- Interfaces: `ACORNInterface`, `IndicatorInterface`
- Commons: `E`
- Libraries: `Configs`, `E8S`
- Bases: `Principal`
## Modifiers

### 1. `setConfigs(entries)` returns `()`

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

### 2. `putConfigs(entries)` returns `()`

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

### 3. `internalMint(recipient, amount)` returns `()`

#### Arguments:

```json
{
  "recipient": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER",
  "amount": "Nat"
}
```

### 4. `internalTransfer(recipient, amount)` returns `()`

#### Arguments:

```json
{
  "recipient": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER",
  "amount": "Nat"
}
```

### 5. `externalMint(recipient, amount)` returns `()`

#### Arguments:

```json
{"recipient": "Principal", "amount": "Nat"}
```

### 6. `externalTransfer(recipient, amount)` returns `()`

#### Arguments:

```json
{"recipient": "Principal", "amount": "Nat"}
```

### 7. `delegatedExternalTransfer(sender, recipient, amount)` returns `()`

#### Arguments:

```json
{
  "sender": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER",
  "recipient": "Principal",
  "amount": "Nat"
}
```

### 8. `claim(sender, amount)` returns `()`

#### Arguments:

```json
{"sender": "Principal", "amount": "Nat"}
```

### 9. `delegatedClaim(recipient, sender, amount)` returns `()`

#### Arguments:

```json
{
  "recipient": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER",
  "sender": "Principal",
  "amount": "Nat"
}
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

### 3. `getAllocation(actorVariant)` returns `Allocation.Sharable`

#### Arguments:

```json
{
  "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER"
}
```

#### Returns:
```json
{
  "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER",
  "allocated": "Nat",
  "balance": "Nat"
}
```

### 4. `getAllocations()` returns `Allocations.Sharable`

#### Returns:
```json
[
  {
    "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER",
    "allocated": "Nat",
    "balance": "Nat"
  }
]
```

### 5. `getBalance(actorVariant)` returns `E8S.Sharable`

#### Arguments:

```json
{
  "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER"
}
```

#### Returns:
```json
"Nat"
```

### 6. `getAllocated(actorVariant)` returns `E8S.Sharable`

#### Arguments:

```json
{
  "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #ENCYCLOPEDIA | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER"
}
```

#### Returns:
```json
"Nat"
```

### 7. `getTotalSupply()` returns `E8S.Sharable`

#### Returns:
```json
"Nat"
```

### 8. `getReserveSupply()` returns `E8S.Sharable`

#### Returns:
```json
"Nat"
```

### 9. `getCirculatingSupply()` returns `E8S.Sharable`

#### Returns:
```json
"Nat"
```
