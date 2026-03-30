# Chat API Specification

## Dependencies


- Attributes: `User`, `Users`, `Channel`, `Channels`, `DM`, `DMs`, `Group`, `Groups`, `Message`, `Messages`
- Interfaces: `IndicatorInterface`
- Commons: `C`
- Libraries: `Configs`, `Iter`, `Management`
- Bases: `Principal`, `Text`, `Time`
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

### 4. `register(principal, username)` returns `()`

#### Arguments:

```json
{"principal": "Principal", "username": "Text"}
```

### 5. `setUsername(principal, username)` returns `()`

#### Arguments:

```json
{"principal": "Principal", "username": "Text"}
```

### 6. `createDM(ownedDek, to)` returns `Text`

#### Arguments:

```json
{"ownedDek": "Blob", "to": ["Principal", "Blob"]}
```

#### Returns:
```json
"Text"
```

### 7. `createPublicGroup(plainDek, name, disableLogs, admins, members)` returns `Nat`

#### Arguments:

```json
{"plainDek": "Blob", "name": "Text", "disableLogs": "Bool", "admins": ["Principal"], "members": ["Principal"]}
```

#### Returns:
```json
"Nat"
```

### 8. `createPrivateGroup(name, disableLogs, admins, members)` returns `Nat`

#### Arguments:

```json
{"name": "Text", "disableLogs": "Bool", "admins": ["Principal"], "members": [["Principal", "Blob"]]}
```

#### Returns:
```json
"Nat"
```

### 9. `joinPublicGroup(id)` returns `Message.MemberDEKsSharable`

#### Arguments:

```json
{"id": "Nat"}
```

#### Returns:
```json
[["Nat", {"#ENCRYPTED": "Blob", "#PLAIN": "Blob"}]]
```

### 10. `leavePublicGroup(id)` returns `()`

#### Arguments:

```json
{"id": "Nat"}
```

### 11. `getIbeMasterPublicKey()` returns `Blob`

#### Returns:
```json
"Blob"
```

### 12. `getMyVetKey(transportPublicKey)` returns `Blob`

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
