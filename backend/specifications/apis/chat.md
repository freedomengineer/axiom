# Chat API Specification

## Dependencies


- Attributes: `User`, `Users`, `Channel`, `Channels`, `DM`, `DMs`, `Group`, `Groups`, `Message`, `Messages`
- Interfaces: `IndicatorInterface`
- Commons: `C`
- Libraries: `Configs`, `Iter`, `Management`
- Bases: `Principal`, `Text`, `Time`
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

### 5. `register(principal, username)` returns `()`

#### Arguments:

```json
{"principal": "Principal", "username": "Text"}
```

### 6. `setUsername(principal, username)` returns `()`

#### Arguments:

```json
{"principal": "Principal", "username": "Text"}
```

### 7. `createDM(ownedDek, to)` returns `Text`

#### Arguments:

```json
{"ownedDek": "Blob", "to": ["Principal", "Blob"]}
```

#### Returns:
```json
"Text"
```

### 8. `createPublicGroup(plainDek, name, disableLogs, admins, members)` returns `Nat`

#### Arguments:

```json
{"plainDek": "Blob", "name": "Text", "disableLogs": "Bool", "admins": ["Principal"], "members": ["Principal"]}
```

#### Returns:
```json
"Nat"
```

### 9. `createPrivateGroup(name, disableLogs, admins, members)` returns `Nat`

#### Arguments:

```json
{"name": "Text", "disableLogs": "Bool", "admins": ["Principal"], "members": [["Principal", "Blob"]]}
```

#### Returns:
```json
"Nat"
```

### 10. `joinPublicGroup(id)` returns `Message.MemberDEKsSharable`

#### Arguments:

```json
{"id": "Nat"}
```

#### Returns:
```json
[["Nat", {"#ENCRYPTED": "Blob", "#PLAIN": "Blob"}]]
```

### 11. `leavePublicGroup(id)` returns `()`

#### Arguments:

```json
{"id": "Nat"}
```

### 12. `getIbeMasterPublicKey()` returns `Blob`

#### Returns:
```json
"Blob"
```

### 13. `getMyVetKey(transportPublicKey)` returns `Blob`

#### Arguments:

```json
{"transportPublicKey": "Blob"}
```

#### Returns:
```json
"Blob"
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

### 3. `expectUserNotFound(principal)` returns `()`

#### Arguments:

```json
{"principal": "Principal"}
```
