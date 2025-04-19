# Split API Specification

## Dependencies


- Attributes: `Distribution`, `Distributions`, `Actor`, `ICP`
- Interfaces: `IndicatorInterface`
- Commons: `C`, `E`
- Libraries: `Configs`, `E8S`, `Earning`, `Iter`, `Proportion`
- Bases: `Principal`, `Time`
## Modifiers

### 1. `shiftToMidnight(days)` returns `()`

#### Arguments:

```json
{"days": "Nat"}
```

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

### 4. `deposit(sender, amount)` returns `()`

#### Arguments:

```json
{"sender": "Principal", "amount": "Nat"}
```

### 5. `internalTransfer(recipientVariant, amount)` returns `()`

#### Arguments:

```json
{
  "recipientVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER",
  "amount": "Nat"
}
```

### 6. `externalTransfer(recipient, amount)` returns `()`

#### Arguments:

```json
{"recipient": "Principal", "amount": "Nat"}
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

### 3. `getDistribution(actorVariant)` returns `Distribution.Sharable`

#### Arguments:

```json
{
  "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER"
}
```

#### Returns:
```json
{
  "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER",
  "earning": {"revenue": "Nat", "balance": "Nat", "lastWithdrawAt": "Time"},
  "proportion": ["Nat", "Nat"]
}
```

### 4. `getDistributions()` returns `Distributions.Sharable`

#### Returns:
```json
[
  {
    "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER",
    "earning": {"revenue": "Nat", "balance": "Nat", "lastWithdrawAt": "Time"},
    "proportion": ["Nat", "Nat"]
  }
]
```

### 5. `getEarning(actorVariant)` returns `Earning.Sharable`

#### Arguments:

```json
{
  "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER"
}
```

#### Returns:
```json
{"revenue": "Nat", "balance": "Nat", "lastWithdrawAt": "Time"}
```

### 6. `getBalance(actorVariant)` returns `E8S.Sharable`

#### Arguments:

```json
{
  "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER"
}
```

#### Returns:
```json
"Nat"
```

### 7. `getTotalRevenue()` returns `E8S.Sharable`

#### Returns:
```json
"Nat"
```

### 8. `getTotalBalance()` returns `E8S.Sharable`

#### Returns:
```json
"Nat"
```
