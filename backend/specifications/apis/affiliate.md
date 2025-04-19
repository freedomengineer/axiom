# Affiliate API Specification

## Dependencies


- Attributes: `User`, `Users`
- Interfaces: `IndicatorInterface`, `SplitInterface`
- Commons: `C`, `E`
- Libraries: `Configs`, `E8S`, `Earning`, `Iter`, `Proportion`
- Bases: `Principal`, `Nat`, `Time`
## Modifiers

### 1. `shiftToMidnight(days)` returns `()`

#### Arguments:

```json
{"days": "Nat"}
```

### 2. `initialize()` returns `()`

### 3. `setConfigs(entries)` returns `()`

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

### 4. `putConfigs(entries)` returns `()`

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

### 5. `fillReferrals(principal, icpPaid, referrer)` returns `()`

#### Arguments:

```json
{"principal": "Principal", "icpPaid": "Nat", "referrer": "Principal"}
```

### 6. `withdrawAll()` returns `()`

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

### 3. `getUser(principal)` returns `User.Sharable`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
{"referrer": "Principal", "referrals": "Nat", "earning": {"revenue": "Nat", "balance": "Nat", "lastWithdrawAt": "Time"}}
```

### 4. `getEarning(principal)` returns `Earning.Sharable`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
{"revenue": "Nat", "balance": "Nat", "lastWithdrawAt": "Time"}
```

### 5. `expectUserNotFound(principal)` returns `()`

#### Arguments:

```json
{"principal": "Principal"}
```
