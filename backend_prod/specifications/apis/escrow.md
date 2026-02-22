# Escrow API Specification

## Dependencies


- Attributes: `Burials`, `Burial`, `Users`, `User`
- Interfaces: `TreasuryInterface`, `IndicatorInterface`
- Commons: `C`, `E`
- Libraries: `E8S`, `Configs`, `Iter`, `Pagination`, `Proportion`
- Bases: `Principal`, `Time`
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

### 4. `register(principal, initialAmount)` returns `()`

#### Arguments:

```json
{"principal": "Principal", "initialAmount": "Nat"}
```

### 5. `transferFounderBurial(from, to)` returns `()`

#### Arguments:

```json
{"from": "Principal", "to": "Principal"}
```

### 6. `bury(amount, option)` returns `()`

#### Arguments:

```json
{"amount": "Nat", "option": "#SINGLE | #DOUBLE | #QUADRUPLE | #OCTUPLE | #PERPETUAL"}
```

### 7. `withdrawAll()` returns `()`

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

### 3. `getTop(category)` returns `Pagination.TopNonPagination`

#### Arguments:

```json
{"category": "#POWEREDVOTERS | #ACORNBURIERS"}
```

#### Returns:
```json
{"result": [["Principal", "Nat"]], "callerRank": "Nat"}
```

### 4. `getTopPagination(category, page, limit)` returns `Pagination.TopPagination`

#### Arguments:

```json
{"category": "#POWEREDVOTERS | #ACORNBURIERS", "page": "Nat", "limit": "Nat"}
```

#### Returns:
```json
{"result": [["Principal", "Nat"]], "callerRank": "Nat", "is": "Nat", "of": "Nat"}
```

### 5. `getUser(principal)` returns `User.Sharable`

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

### 6. `getBurials(principal)` returns `Burials.Sharable`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
[{"amount": "Nat", "coefficient": "Nat", "issueDate": "Time", "expiryDate": "Time", "claimableInterest": "Nat"}]
```

### 7. `getVotingPower(principal)` returns `Nat`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
"Nat"
```

### 8. `getBuriedAmount(principal)` returns `Nat`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
"Nat"
```

### 9. `getInterestAmount(principal)` returns `Nat`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
"Nat"
```

### 10. `getExpiredAmount(principal)` returns `Nat`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
"Nat"
```

### 11. `getClaimableAmount(principal)` returns `Nat`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
"Nat"
```

### 12. `expectUserNotFound(principal)` returns `()`

#### Arguments:

```json
{"principal": "Principal"}
```
