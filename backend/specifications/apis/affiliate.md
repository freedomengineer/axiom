# Affiliate API Specification

## Dependencies


- Attributes: `User`, `Users`, `Coupon`, `Coupons`, `Actor`, `Notification`, `Distributions`
- Interfaces: `IndicatorInterface`, `FacadeInterface`, `ICPUSDInterface`, `SalesInterface`, `SplitInterface`
- Commons: `C`, `E`
- Libraries: `Array`, `Base`, `Configs`, `E8S`, `Earning`, `Hexadecimal`, `Iter`, `List`, `Pagination`, `Proportion`, `SHA256`
- Bases: `Blob`, `Principal`, `Nat`, `Int`, `Time`, `Timer`, `Random`
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

### 6. `lockCoupon(code, principal)` returns `Coupon.Sharable`

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
  "splitAmounts": [
    [
      "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER",
      "Nat"
    ]
  ],
  "status": {
    "#AVAILABLE": null,
    "#LOCKED": {"by": "Principal", "timestamp": "Time"},
    "#REDEEMED": {"by": "Principal", "timestamp": "Time"},
    "#FAILED": {"by": "Principal", "reason": "Text", "timestamp": "Time"},
    "#EXPIRED": {"timestamp": "Time"}
  }
}
```

### 7. `redeemCouponFailed(code, principal, reason)` returns `()`

#### Arguments:

```json
{"code": ["Nat8"], "principal": "Principal", "reason": "Text"}
```

### 8. `redeemCoupon(code, principal)` returns `()`

#### Arguments:

```json
{"code": ["Nat8"], "principal": "Principal"}
```

### 9. `createCoupon(capitalRaised)` returns `[Nat8]`

#### Arguments:

```json
{"capitalRaised": "Nat"}
```

#### Returns:
```json
["Nat8"]
```

### 10. `withdrawAll()` returns `()`

### 11. `withdrawExpiredCoupons()` returns `()`

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
  "splitAmounts": [
    [
      "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER",
      "Nat"
    ]
  ],
  "status": {
    "#AVAILABLE": null,
    "#LOCKED": {"by": "Principal", "timestamp": "Time"},
    "#REDEEMED": {"by": "Principal", "timestamp": "Time"},
    "#FAILED": {"by": "Principal", "reason": "Text", "timestamp": "Time"},
    "#EXPIRED": {"timestamp": "Time"}
  }
}
```

### 4. `getCoupons(filter, sort)` returns `Coupons.Sharable`

#### Arguments:

```json
{
  "filter": {"creator": "Principal", "capitalRaised": "Nat", "status": "#AVAILABLE | #LOCKED | #REDEEMED | #FAILED | #EXPIRED"},
  "sort": {"by": "#RECENT | #CAPITALRAISED | #ICPPAID", "order": "#ASCENDING | #DESCENDING"}
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
    "splitAmounts": [
      [
        "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER",
        "Nat"
      ]
    ],
    "status": {
      "#AVAILABLE": null,
      "#LOCKED": {"by": "Principal", "timestamp": "Time"},
      "#REDEEMED": {"by": "Principal", "timestamp": "Time"},
      "#FAILED": {"by": "Principal", "reason": "Text", "timestamp": "Time"},
      "#EXPIRED": {"timestamp": "Time"}
    }
  }
]
```

### 5. `getCouponsPagination(filter, sort, page, limit)` returns `Pagination.Pagination<Coupon.Sharable>`

#### Arguments:

```json
{
  "filter": {"creator": "Principal", "capitalRaised": "Nat", "status": "#AVAILABLE | #LOCKED | #REDEEMED | #FAILED | #EXPIRED"},
  "sort": {"by": "#RECENT | #CAPITALRAISED | #ICPPAID", "order": "#ASCENDING | #DESCENDING"},
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
    "splitAmounts": [
      [
        "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER",
        "Nat"
      ]
    ],
    "status": {
      "#AVAILABLE": null,
      "#LOCKED": {"by": "Principal", "timestamp": "Time"},
      "#REDEEMED": {"by": "Principal", "timestamp": "Time"},
      "#FAILED": {"by": "Principal", "reason": "Text", "timestamp": "Time"},
      "#EXPIRED": {"timestamp": "Time"}
    }
  },
  "is": "Nat",
  "of": "Nat"
}
```

### 6. `getPrivateCoupon(key)` returns `Coupon.Sharable`

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
  "splitAmounts": [
    [
      "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER",
      "Nat"
    ]
  ],
  "status": {
    "#AVAILABLE": null,
    "#LOCKED": {"by": "Principal", "timestamp": "Time"},
    "#REDEEMED": {"by": "Principal", "timestamp": "Time"},
    "#FAILED": {"by": "Principal", "reason": "Text", "timestamp": "Time"},
    "#EXPIRED": {"timestamp": "Time"}
  }
}
```

### 7. `getPrivateCoupons(filter, sort)` returns `Coupons.PrivateSharable`

#### Arguments:

```json
{
  "filter": {"capitalRaised": "Nat", "status": "#AVAILABLE | #LOCKED | #REDEEMED | #FAILED | #EXPIRED"},
  "sort": {"by": "#RECENT | #CAPITALRAISED | #ICPPAID", "order": "#ASCENDING | #DESCENDING"}
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
    "splitAmounts": [
      [
        "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER",
        "Nat"
      ]
    ],
    "status": {
      "#AVAILABLE": null,
      "#LOCKED": {"by": "Principal", "timestamp": "Time"},
      "#REDEEMED": {"by": "Principal", "timestamp": "Time"},
      "#FAILED": {"by": "Principal", "reason": "Text", "timestamp": "Time"},
      "#EXPIRED": {"timestamp": "Time"}
    },
    "code": "Text"
  }
]
```

### 8. `getPrivateCouponsPagination(filter, sort, page, limit)` returns `Pagination.Pagination<Coupon.Sharable>`

#### Arguments:

```json
{
  "filter": {"capitalRaised": "Nat", "status": "#AVAILABLE | #LOCKED | #REDEEMED | #FAILED | #EXPIRED"},
  "sort": {"by": "#RECENT | #CAPITALRAISED | #ICPPAID", "order": "#ASCENDING | #DESCENDING"},
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
    "splitAmounts": [
      [
        "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN | #FOUNDER",
        "Nat"
      ]
    ],
    "status": {
      "#AVAILABLE": null,
      "#LOCKED": {"by": "Principal", "timestamp": "Time"},
      "#REDEEMED": {"by": "Principal", "timestamp": "Time"},
      "#FAILED": {"by": "Principal", "reason": "Text", "timestamp": "Time"},
      "#EXPIRED": {"timestamp": "Time"}
    }
  },
  "is": "Nat",
  "of": "Nat"
}
```

### 9. `getTop(category)` returns `Pagination.TopNonPagination`

#### Arguments:

```json
{"category": "#REFERRERS"}
```

#### Returns:
```json
{"result": [["Principal", "Nat"]], "callerRank": "Nat"}
```

### 10. `getTopPagination(category, page, limit)` returns `Pagination.TopPagination`

#### Arguments:

```json
{"category": "#REFERRERS", "page": "Nat", "limit": "Nat"}
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

### 13. `getCouponsEarning(principal)` returns `Earning.Sharable`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
{"revenue": "Nat", "balance": "Nat", "lastWithdrawAt": "Time"}
```

### 14. `expectUserNotFound(principal)` returns `()`

#### Arguments:

```json
{"principal": "Principal"}
```
