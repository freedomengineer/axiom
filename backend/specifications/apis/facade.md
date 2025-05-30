# Facade API Specification

## Dependencies


- Attributes: `User`, `Users`, `DIP721`
- Interfaces: `DIP721Interface`, `ICPUSDInterface`, `SplitInterface`, `TreasuryInterface`, `AffiliateInterface`, `SalesInterface`, `EscrowInterface`, `AxiomsInterface`, `DAOInterface`, `IndicatorInterface`
- Commons: `C`, `E`
- Libraries: `Base`, `Configs`, `Date`, `E8S`, `Format`, `Iter`, `Pagination`
- Bases: `Principal`, `Nat`, `Time`, `Text`
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

### 5. `updateCapitalRaised(principal, capitalRaised)` returns `()`

#### Arguments:

```json
{"principal": "Principal", "capitalRaised": "Nat"}
```

### 6. `register(username, capitalRaised, referrer)` returns `()`

#### Arguments:

```json
{"username": "Text", "capitalRaised": "Nat", "referrer": "Principal"}
```

### 7. `editUsername(username)` returns `()`

#### Arguments:

```json
{"username": "Text"}
```

### 8. `editLocation(location)` returns `()`

#### Arguments:

```json
{"location": "Text"}
```

### 9. `editAvatar(picture)` returns `()`

#### Arguments:

```json
{"picture": {"blob": "Blob"}}
```

### 10. `editLinks(links)` returns `()`

#### Arguments:

```json
{"links": [{"anchorText": "Text", "url": "Text"}]}
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

### 3. `getUserIdentifier(from)` returns `User.Identifier`

#### Arguments:

```json
{"from": {"#PRINCIPAL": "Principal", "#USERNAME": "Text"}}
```

#### Returns:
```json
{"principal": "Principal", "username": "Text", "capitalRaised": "Nat"}
```

### 4. `getUsersIdentifier()` returns `[User.Identifier]`

#### Returns:
```json
[{"principal": "Principal", "username": "Text", "capitalRaised": "Nat"}]
```

### 5. `getUsersPrincipal()` returns `[Principal]`

#### Returns:
```json
["Principal"]
```

### 6. `getUsersCount()` returns `Nat`

#### Returns:
```json
"Nat"
```

### 7. `getUser(principal)` returns `User.Sharable`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
{
  "principal": "Principal",
  "avatar": {"blob": "Blob"},
  "username": "Text",
  "capitalRaised": "Nat",
  "creationDate": "Time",
  "links": [{"anchorText": "Text", "url": "Text"}],
  "location": "Text"
}
```

### 8. `getUsers(filter, sort)` returns `[User.Sharable]`

#### Arguments:

```json
{
  "filter": {"capitalRaised": "Nat", "q": "Text"},
  "sort": {"by": "#RECENT | #CAPITALRAISED | #ALPHABETICAL | #FOLLOWERS | #FOLLOWINGS", "order": "#ASCENDING | #DESCENDING"}
}
```

#### Returns:
```json
[
  {
    "principal": "Principal",
    "avatar": {"blob": "Blob"},
    "username": "Text",
    "capitalRaised": "Nat",
    "creationDate": "Time",
    "links": [{"anchorText": "Text", "url": "Text"}],
    "location": "Text"
  }
]
```

### 9. `getUsersPagination(filter, sort, page, limit)` returns `Pagination.Pagination<User.Sharable>`

#### Arguments:

```json
{
  "filter": {"capitalRaised": "Nat", "q": "Text"},
  "sort": {"by": "#RECENT | #CAPITALRAISED | #ALPHABETICAL | #FOLLOWERS | #FOLLOWINGS", "order": "#ASCENDING | #DESCENDING"},
  "page": "Nat",
  "limit": "Nat"
}
```

#### Returns:
```json
{
  "result": {
    "principal": "Principal",
    "avatar": {"blob": "Blob"},
    "username": "Text",
    "capitalRaised": "Nat",
    "creationDate": "Time",
    "links": [{"anchorText": "Text", "url": "Text"}],
    "location": "Text"
  },
  "is": "Nat",
  "of": "Nat"
}
```
