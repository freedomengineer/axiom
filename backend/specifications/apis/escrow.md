# Escrow API Specification

## Dependencies


- Attributes: `Burials`, `Burial`, `Users`, `User`
- Interfaces: `TreasuryInterface`, `IndicatorInterface`
- Commons: `C`, `E`
- Libraries: `E8S`, `Configs`, `Iter`, `Proportion`
- Bases: `Principal`, `Time`
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

### 5. `register(principal, initialAmount)` returns `()`

#### Arguments:

```json
{"principal": "Principal", "initialAmount": "Nat"}
```

### 6. `transferFounderBurial(from, to)` returns `()`

#### Arguments:

```json
{"from": "Principal", "to": "Principal"}
```

### 7. `bury(amount, option)` returns `()`

#### Arguments:

```json
{"amount": "Nat", "option": "#SINGLE | #DOUBLE | #QUADRUPLE | #OCTUPLE | #PERPETUAL"}
```

### 8. `withdrawAll()` returns `()`

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
{
  "burials": [{"amount": "Nat", "coefficient": "Nat", "issueDate": "Time", "expiryDate": "Time", "claimableInterest": "Nat"}]
}
```

### 4. `getBurials(principal)` returns `Burials.Sharable`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
[{"amount": "Nat", "coefficient": "Nat", "issueDate": "Time", "expiryDate": "Time", "claimableInterest": "Nat"}]
```

### 5. `getVotingPower(principal)` returns `Nat`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
"Nat"
```

### 6. `getBuriedAmount(principal)` returns `Nat`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
"Nat"
```

### 7. `getInterestAmount(principal)` returns `Nat`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
"Nat"
```

### 8. `getExpiredAmount(principal)` returns `Nat`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
"Nat"
```

### 9. `getClaimableAmount(principal)` returns `Nat`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
"Nat"
```

### 10. `expectUserNotFound(principal)` returns `()`

#### Arguments:

```json
{"principal": "Principal"}
```
