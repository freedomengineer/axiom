# Affiliate API Specification

## Dependencies


- Attributes: `User`, `Users`, `Coupon`, `Coupons`
- Interfaces: `ICPUSDInterface`, `SalesInterface`, `SplitInterface`, `FacadeInterface`, `IndicatorInterface`
- Commons: `C`, `E`
- Libraries: `Array`, `Base`, `Configs`, `E8S`, `Earning`, `Iter`, `List`, `Pagination`, `Proportion`, `SHA256`
- Bases: `Blob`, `Principal`, `Nat`, `Int`, `Time`, `Random`, `Debug`
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

### 4. `fillReferrals(principal, icpPaid, referrer)` returns `()`

#### Arguments:

```json
{"principal": "Principal", "icpPaid": "Nat", "referrer": "Principal"}
```

### 5. `lockCoupon(code, principal)` returns `Coupon.Sharable`

#### Arguments:

```json
{"code": ["Nat8"], "principal": "Principal"}
```

#### Returns:
```json
{
  "key": "Text",
  "creator": "Principal",
  "creationDate": "Time",
  "capitalRaised": "Nat",
  "icpPaid": "Nat",
  "status": {
    "#AVAILABLE": null,
    "#LOCKED": {"by": "Principal", "timestamp": "Time"},
    "#REDEEMED": {"by": "Principal", "timestamp": "Time"},
    "#FAILED": {"by": "Principal", "reason": "Text", "timestamp": "Time"}
  }
}
```

### 6. `redeemCouponFailed(code, principal, reason)` returns `()`

#### Arguments:

```json
{"code": ["Nat8"], "principal": "Principal", "reason": "Text"}
```

### 7. `redeemCoupon(code, principal)` returns `()`

#### Arguments:

```json
{"code": ["Nat8"], "principal": "Principal"}
```

### 8. `createCoupon(capitalRaised)` returns `Coupon.PrivateSharable`

#### Arguments:

```json
{"capitalRaised": "Nat"}
```

#### Returns:
```json
{
  "key": "Text",
  "creator": "Principal",
  "creationDate": "Time",
  "capitalRaised": "Nat",
  "icpPaid": "Nat",
  "status": {
    "#AVAILABLE": null,
    "#LOCKED": {"by": "Principal", "timestamp": "Time"},
    "#REDEEMED": {"by": "Principal", "timestamp": "Time"},
    "#FAILED": {"by": "Principal", "reason": "Text", "timestamp": "Time"}
  },
  "code": ["Nat8"]
}
```

### 9. `withdrawAll()` returns `()`

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

### 3. `getCoupon(key)` returns `Coupon.Sharable`

#### Arguments:

```json
{"key": "Text"}
```

#### Returns:
```json
{
  "key": "Text",
  "creator": "Principal",
  "creationDate": "Time",
  "capitalRaised": "Nat",
  "icpPaid": "Nat",
  "status": {
    "#AVAILABLE": null,
    "#LOCKED": {"by": "Principal", "timestamp": "Time"},
    "#REDEEMED": {"by": "Principal", "timestamp": "Time"},
    "#FAILED": {"by": "Principal", "reason": "Text", "timestamp": "Time"}
  }
}
```

### 4. `getCoupons(filter, sort)` returns `Coupons.Sharable`

#### Arguments:

```json
{
  "filter": {"creator": "Principal", "capitalRaised": "Nat", "status": "#AVAILABLE | #LOCKED | #REDEEMED | #FAILED"},
  "sort": {"by": "#RECENT | #ICPPAID", "order": "#ASCENDING | #DESCENDING"}
}
```

#### Returns:
```json
[
  {
    "key": "Text",
    "creator": "Principal",
    "creationDate": "Time",
    "capitalRaised": "Nat",
    "icpPaid": "Nat",
    "status": {
      "#AVAILABLE": null,
      "#LOCKED": {"by": "Principal", "timestamp": "Time"},
      "#REDEEMED": {"by": "Principal", "timestamp": "Time"},
      "#FAILED": {"by": "Principal", "reason": "Text", "timestamp": "Time"}
    }
  }
]
```

### 5. `getCouponsPagination(filter, sort, page, limit)` returns `Pagination.Pagination<Coupon.Sharable>`

#### Arguments:

```json
{
  "filter": {"creator": "Principal", "capitalRaised": "Nat", "status": "#AVAILABLE | #LOCKED | #REDEEMED | #FAILED"},
  "sort": {"by": "#RECENT | #ICPPAID", "order": "#ASCENDING | #DESCENDING"},
  "page": "Nat",
  "limit": "Nat"
}
```

#### Returns:
```json
{
  "result": {
    "key": "Text",
    "creator": "Principal",
    "creationDate": "Time",
    "capitalRaised": "Nat",
    "icpPaid": "Nat",
    "status": {
      "#AVAILABLE": null,
      "#LOCKED": {"by": "Principal", "timestamp": "Time"},
      "#REDEEMED": {"by": "Principal", "timestamp": "Time"},
      "#FAILED": {"by": "Principal", "reason": "Text", "timestamp": "Time"}
    }
  },
  "is": "Nat",
  "of": "Nat"
}
```

### 6. `getPrivateCoupon(key)` returns `Coupon.PrivateSharable`

#### Arguments:

```json
{"key": "Text"}
```

#### Returns:
```json
{
  "key": "Text",
  "creator": "Principal",
  "creationDate": "Time",
  "capitalRaised": "Nat",
  "icpPaid": "Nat",
  "status": {
    "#AVAILABLE": null,
    "#LOCKED": {"by": "Principal", "timestamp": "Time"},
    "#REDEEMED": {"by": "Principal", "timestamp": "Time"},
    "#FAILED": {"by": "Principal", "reason": "Text", "timestamp": "Time"}
  },
  "code": ["Nat8"]
}
```

### 7. `getPrivateCoupons(filter, sort)` returns `Coupons.PrivateSharable`

#### Arguments:

```json
{
  "filter": {"capitalRaised": "Nat", "status": "#AVAILABLE | #LOCKED | #REDEEMED | #FAILED"},
  "sort": {"by": "#RECENT | #ICPPAID", "order": "#ASCENDING | #DESCENDING"}
}
```

#### Returns:
```json
[
  {
    "key": "Text",
    "creator": "Principal",
    "creationDate": "Time",
    "capitalRaised": "Nat",
    "icpPaid": "Nat",
    "status": {
      "#AVAILABLE": null,
      "#LOCKED": {"by": "Principal", "timestamp": "Time"},
      "#REDEEMED": {"by": "Principal", "timestamp": "Time"},
      "#FAILED": {"by": "Principal", "reason": "Text", "timestamp": "Time"}
    },
    "code": ["Nat8"]
  }
]
```

### 8. `getPrivateCouponsPagination(filter, sort, page, limit)` returns `Pagination.Pagination<Coupon.PrivateSharable>`

#### Arguments:

```json
{
  "filter": {"capitalRaised": "Nat", "status": "#AVAILABLE | #LOCKED | #REDEEMED | #FAILED"},
  "sort": {"by": "#RECENT | #ICPPAID", "order": "#ASCENDING | #DESCENDING"},
  "page": "Nat",
  "limit": "Nat"
}
```

#### Returns:
```json
{
  "result": {
    "key": "Text",
    "creator": "Principal",
    "creationDate": "Time",
    "capitalRaised": "Nat",
    "icpPaid": "Nat",
    "status": {
      "#AVAILABLE": null,
      "#LOCKED": {"by": "Principal", "timestamp": "Time"},
      "#REDEEMED": {"by": "Principal", "timestamp": "Time"},
      "#FAILED": {"by": "Principal", "reason": "Text", "timestamp": "Time"}
    },
    "code": ["Nat8"]
  },
  "is": "Nat",
  "of": "Nat"
}
```

### 9. `getTop(category)` returns `Pagination.TopNonPagination`

#### Arguments:

```json
{"category": "#REFERRERS | #COUPONGENERATORS"}
```

#### Returns:
```json
{"result": [["Principal", "Nat"]], "callerRank": "Nat"}
```

### 10. `getTopPagination(category, page, limit)` returns `Pagination.TopPagination`

#### Arguments:

```json
{"category": "#REFERRERS | #COUPONGENERATORS", "page": "Nat", "limit": "Nat"}
```

#### Returns:
```json
{"result": [["Principal", "Nat"]], "callerRank": "Nat", "is": "Nat", "of": "Nat"}
```

### 11. `getUser(principal)` returns `User.Sharable`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
{
  "referrer": "Principal",
  "referrals": "Nat",
  "earning": {"revenue": "Nat", "balance": "Nat", "lastWithdrawAt": "Time"},
  "coupons": ["Text"]
}
```

### 12. `getEarning(principal)` returns `Earning.Sharable`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
{"revenue": "Nat", "balance": "Nat", "lastWithdrawAt": "Time"}
```

### 13. `getUserCouponTotal(principal)` returns `(Nat, Nat)`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
["Nat", "Nat"]
```

### 14. `expectUserNotFound(principal)` returns `()`

#### Arguments:

```json
{"principal": "Principal"}
```
