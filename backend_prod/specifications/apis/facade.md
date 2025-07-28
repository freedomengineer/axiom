# Facade API Specification

## Dependencies


- Attributes: `User`, `Users`, `Notification`, `Notifications`, `Coupon`, `DIP721`
- Interfaces: `DIP721Interface`, `ICPUSDInterface`, `SplitInterface`, `TreasuryInterface`, `AffiliateInterface`, `SalesInterface`, `EscrowInterface`, `AxiomsInterface`, `DAOInterface`, `IndicatorInterface`
- Commons: `C`, `E`
- Libraries: `Base`, `Configs`, `E8S`, `Format`, `Iter`, `Map`, `Pagination`
- Bases: `Principal`, `Nat`, `Time`, `Text`, `Error`
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

### 4. `updateCapitalRaised(principal, capitalRaised)` returns `()`

#### Arguments:

```json
{"principal": "Principal", "capitalRaised": "Nat"}
```

### 5. `postUserNotification(principal, data)` returns `()`

#### Arguments:

```json
{
  "principal": "Principal",
  "data": {
    "#CUSTODIANELECTIONRESULT": {"result": "#REMOVED | #UNCHANGED | #NEW", "claimable": "Nat", "timestamp": "Time"},
    "#CUSTODIANPROPOSALRESULT": {"proposalId": "Nat", "proposer": "Principal", "result": "#APPROVED | #REJECTED | #EXPIRED", "timestamp": "Time"},
    "#CUSTODIANPROPOSALDELEGATED": {"proposalId": "Nat", "delegator": "Principal", "timestamp": "Time"},
    "#CUSTODIANPROPOSALOPENED": {"proposalId": "Nat", "proposer": "Principal", "retried": "Nat", "timestamp": "Time"},
    "#PROPOSALEXECUTED": {"proposalId": "Nat", "result": "#EXECUTED | #FAILED", "claimable": "Nat", "timestamp": "Time"},
    "#PROPOSALRESULT": {"proposalId": "Nat", "result": "#APPROVED | #REJECTED | #EXPIRED", "timestamp": "Time"},
    "#COUPONREDEEMED": {"key": "Text", "user": "Principal", "timestamp": "Time"},
    "#COUPONEXPIRED": {"key": "Text", "claimable": "Nat", "timestamp": "Time"},
    "#NEWHYPOTHESESFROMFOLLOWINGS": {"publisher": "Principal", "hypothesisId": "Nat", "timestamp": "Time"},
    "#NEWEVIDENCESFROMFOLLOWINGS": {"publisher": "Principal", "evidenceId": "Nat", "timestamp": "Time"},
    "#NEWREFERRALS": {"user": "Principal", "claimable": "Nat", "timestamp": "Time"},
    "#NEWFOLLOWERS": {"user": "Principal", "timestamp": "Time"},
    "#NEWBALLOTS": {"voter": "Principal", "timestamp": "Time"},
    "#NEWEVIDENCESTOHYPOTHESIS": {
      "id": "Nat",
      "data": {"evidenceId": "Nat", "publisher": "Principal", "side": "#POSITIVE | #NEGATIVE", "timestamp": "Time"}
    },
    "#NEWAXIOMSTOHYPOTHESIS": {"id": "Nat", "data": {"user": "Principal", "timestamp": "Time"}},
    "#NEWREPLIESTOEVIDENCE": {"id": "Nat", "data": {"evidenceId": "Nat", "publisher": "Principal", "timestamp": "Time"}},
    "#NEWVOTESTOHYPOTHESIS": {"id": "Nat", "data": {"voter": "Principal", "choice": "#POSITIVE | #NEUTRAL | #NEGATIVE", "timestamp": "Time"}},
    "#NEWVOTESTOEVIDENCE": {"id": "Nat", "data": {"voter": "Principal", "choice": "#POSITIVE | #NEGATIVE", "timestamp": "Time"}},
    "#NEWVOTESTOPROPOSAL": {"id": "Nat", "data": {"voter": "Principal", "choice": "#POSITIVE | #NEGATIVE", "timestamp": "Time"}}
  }
}
```

### 6. `postUsersNotification(batch, data)` returns `()`

#### Arguments:

```json
{
  "batch": ["Principal"],
  "data": {
    "#CUSTODIANELECTIONRESULT": {"result": "#REMOVED | #UNCHANGED | #NEW", "claimable": "Nat", "timestamp": "Time"},
    "#CUSTODIANPROPOSALRESULT": {"proposalId": "Nat", "proposer": "Principal", "result": "#APPROVED | #REJECTED | #EXPIRED", "timestamp": "Time"},
    "#CUSTODIANPROPOSALDELEGATED": {"proposalId": "Nat", "delegator": "Principal", "timestamp": "Time"},
    "#CUSTODIANPROPOSALOPENED": {"proposalId": "Nat", "proposer": "Principal", "retried": "Nat", "timestamp": "Time"},
    "#PROPOSALEXECUTED": {"proposalId": "Nat", "result": "#EXECUTED | #FAILED", "claimable": "Nat", "timestamp": "Time"},
    "#PROPOSALRESULT": {"proposalId": "Nat", "result": "#APPROVED | #REJECTED | #EXPIRED", "timestamp": "Time"},
    "#COUPONREDEEMED": {"key": "Text", "user": "Principal", "timestamp": "Time"},
    "#COUPONEXPIRED": {"key": "Text", "claimable": "Nat", "timestamp": "Time"},
    "#NEWHYPOTHESESFROMFOLLOWINGS": {"publisher": "Principal", "hypothesisId": "Nat", "timestamp": "Time"},
    "#NEWEVIDENCESFROMFOLLOWINGS": {"publisher": "Principal", "evidenceId": "Nat", "timestamp": "Time"},
    "#NEWREFERRALS": {"user": "Principal", "claimable": "Nat", "timestamp": "Time"},
    "#NEWFOLLOWERS": {"user": "Principal", "timestamp": "Time"},
    "#NEWBALLOTS": {"voter": "Principal", "timestamp": "Time"},
    "#NEWEVIDENCESTOHYPOTHESIS": {
      "id": "Nat",
      "data": {"evidenceId": "Nat", "publisher": "Principal", "side": "#POSITIVE | #NEGATIVE", "timestamp": "Time"}
    },
    "#NEWAXIOMSTOHYPOTHESIS": {"id": "Nat", "data": {"user": "Principal", "timestamp": "Time"}},
    "#NEWREPLIESTOEVIDENCE": {"id": "Nat", "data": {"evidenceId": "Nat", "publisher": "Principal", "timestamp": "Time"}},
    "#NEWVOTESTOHYPOTHESIS": {"id": "Nat", "data": {"voter": "Principal", "choice": "#POSITIVE | #NEUTRAL | #NEGATIVE", "timestamp": "Time"}},
    "#NEWVOTESTOEVIDENCE": {"id": "Nat", "data": {"voter": "Principal", "choice": "#POSITIVE | #NEGATIVE", "timestamp": "Time"}},
    "#NEWVOTESTOPROPOSAL": {"id": "Nat", "data": {"voter": "Principal", "choice": "#POSITIVE | #NEGATIVE", "timestamp": "Time"}}
  }
}
```

### 7. `postUserNotifications(principal, batch)` returns `()`

#### Arguments:

```json
{
  "principal": "Principal",
  "batch": [
    {
      "#CUSTODIANELECTIONRESULT": {"result": "#REMOVED | #UNCHANGED | #NEW", "claimable": "Nat", "timestamp": "Time"},
      "#CUSTODIANPROPOSALRESULT": {"proposalId": "Nat", "proposer": "Principal", "result": "#APPROVED | #REJECTED | #EXPIRED", "timestamp": "Time"},
      "#CUSTODIANPROPOSALDELEGATED": {"proposalId": "Nat", "delegator": "Principal", "timestamp": "Time"},
      "#CUSTODIANPROPOSALOPENED": {"proposalId": "Nat", "proposer": "Principal", "retried": "Nat", "timestamp": "Time"},
      "#PROPOSALEXECUTED": {"proposalId": "Nat", "result": "#EXECUTED | #FAILED", "claimable": "Nat", "timestamp": "Time"},
      "#PROPOSALRESULT": {"proposalId": "Nat", "result": "#APPROVED | #REJECTED | #EXPIRED", "timestamp": "Time"},
      "#COUPONREDEEMED": {"key": "Text", "user": "Principal", "timestamp": "Time"},
      "#COUPONEXPIRED": {"key": "Text", "claimable": "Nat", "timestamp": "Time"},
      "#NEWHYPOTHESESFROMFOLLOWINGS": {"publisher": "Principal", "hypothesisId": "Nat", "timestamp": "Time"},
      "#NEWEVIDENCESFROMFOLLOWINGS": {"publisher": "Principal", "evidenceId": "Nat", "timestamp": "Time"},
      "#NEWREFERRALS": {"user": "Principal", "claimable": "Nat", "timestamp": "Time"},
      "#NEWFOLLOWERS": {"user": "Principal", "timestamp": "Time"},
      "#NEWBALLOTS": {"voter": "Principal", "timestamp": "Time"},
      "#NEWEVIDENCESTOHYPOTHESIS": {
        "id": "Nat",
        "data": {"evidenceId": "Nat", "publisher": "Principal", "side": "#POSITIVE | #NEGATIVE", "timestamp": "Time"}
      },
      "#NEWAXIOMSTOHYPOTHESIS": {"id": "Nat", "data": {"user": "Principal", "timestamp": "Time"}},
      "#NEWREPLIESTOEVIDENCE": {"id": "Nat", "data": {"evidenceId": "Nat", "publisher": "Principal", "timestamp": "Time"}},
      "#NEWVOTESTOHYPOTHESIS": {"id": "Nat", "data": {"voter": "Principal", "choice": "#POSITIVE | #NEUTRAL | #NEGATIVE", "timestamp": "Time"}},
      "#NEWVOTESTOEVIDENCE": {"id": "Nat", "data": {"voter": "Principal", "choice": "#POSITIVE | #NEGATIVE", "timestamp": "Time"}},
      "#NEWVOTESTOPROPOSAL": {"id": "Nat", "data": {"voter": "Principal", "choice": "#POSITIVE | #NEGATIVE", "timestamp": "Time"}}
    }
  ]
}
```

### 8. `postUsersNotifications(batch)` returns `()`

#### Arguments:

```json
{
  "batch": [
    [
      "Principal",
      {
        "#CUSTODIANELECTIONRESULT": {"result": "#REMOVED | #UNCHANGED | #NEW", "claimable": "Nat", "timestamp": "Time"},
        "#CUSTODIANPROPOSALRESULT": {
          "proposalId": "Nat",
          "proposer": "Principal",
          "result": "#APPROVED | #REJECTED | #EXPIRED",
          "timestamp": "Time"
        },
        "#CUSTODIANPROPOSALDELEGATED": {"proposalId": "Nat", "delegator": "Principal", "timestamp": "Time"},
        "#CUSTODIANPROPOSALOPENED": {"proposalId": "Nat", "proposer": "Principal", "retried": "Nat", "timestamp": "Time"},
        "#PROPOSALEXECUTED": {"proposalId": "Nat", "result": "#EXECUTED | #FAILED", "claimable": "Nat", "timestamp": "Time"},
        "#PROPOSALRESULT": {"proposalId": "Nat", "result": "#APPROVED | #REJECTED | #EXPIRED", "timestamp": "Time"},
        "#COUPONREDEEMED": {"key": "Text", "user": "Principal", "timestamp": "Time"},
        "#COUPONEXPIRED": {"key": "Text", "claimable": "Nat", "timestamp": "Time"},
        "#NEWHYPOTHESESFROMFOLLOWINGS": {"publisher": "Principal", "hypothesisId": "Nat", "timestamp": "Time"},
        "#NEWEVIDENCESFROMFOLLOWINGS": {"publisher": "Principal", "evidenceId": "Nat", "timestamp": "Time"},
        "#NEWREFERRALS": {"user": "Principal", "claimable": "Nat", "timestamp": "Time"},
        "#NEWFOLLOWERS": {"user": "Principal", "timestamp": "Time"},
        "#NEWBALLOTS": {"voter": "Principal", "timestamp": "Time"},
        "#NEWEVIDENCESTOHYPOTHESIS": {
          "id": "Nat",
          "data": {"evidenceId": "Nat", "publisher": "Principal", "side": "#POSITIVE | #NEGATIVE", "timestamp": "Time"}
        },
        "#NEWAXIOMSTOHYPOTHESIS": {"id": "Nat", "data": {"user": "Principal", "timestamp": "Time"}},
        "#NEWREPLIESTOEVIDENCE": {"id": "Nat", "data": {"evidenceId": "Nat", "publisher": "Principal", "timestamp": "Time"}},
        "#NEWVOTESTOHYPOTHESIS": {"id": "Nat", "data": {"voter": "Principal", "choice": "#POSITIVE | #NEUTRAL | #NEGATIVE", "timestamp": "Time"}},
        "#NEWVOTESTOEVIDENCE": {"id": "Nat", "data": {"voter": "Principal", "choice": "#POSITIVE | #NEGATIVE", "timestamp": "Time"}},
        "#NEWVOTESTOPROPOSAL": {"id": "Nat", "data": {"voter": "Principal", "choice": "#POSITIVE | #NEGATIVE", "timestamp": "Time"}}
      }
    ]
  ]
}
```

### 9. `postSystemNotification(data)` returns `()`

#### Arguments:

```json
{
  "data": {
    "#SYSTEMGENERIC": {"message": "Text", "link": {"anchorText": "Text", "url": "Text"}, "timestamp": "Time"},
    "#FLAGREQUESTED": {"header": {"id": "Nat", "category": "#HYPOTHESIS | #EVIDENCE"}, "timestamp": "Time"},
    "#FLAGRESULT": {
      "header": {"id": "Nat", "category": "#HYPOTHESIS | #EVIDENCE"},
      "result": "#APPROVED | #REJECTED | #EXPIRED",
      "timestamp": "Time"
    },
    "#TALLYRESULT": {"new": ["Principal"], "removed": ["Principal"], "unchanged": ["Principal"], "timestamp": "Time"},
    "#PROPOSALEXECUTED": {"proposalId": "Nat", "proposer": "Principal", "result": "#EXECUTED | #FAILED", "timestamp": "Time"}
  }
}
```

### 10. `postSystemNotifications(batch)` returns `()`

#### Arguments:

```json
{
  "batch": [
    {
      "#SYSTEMGENERIC": {"message": "Text", "link": {"anchorText": "Text", "url": "Text"}, "timestamp": "Time"},
      "#FLAGREQUESTED": {"header": {"id": "Nat", "category": "#HYPOTHESIS | #EVIDENCE"}, "timestamp": "Time"},
      "#FLAGRESULT": {
        "header": {"id": "Nat", "category": "#HYPOTHESIS | #EVIDENCE"},
        "result": "#APPROVED | #REJECTED | #EXPIRED",
        "timestamp": "Time"
      },
      "#TALLYRESULT": {"new": ["Principal"], "removed": ["Principal"], "unchanged": ["Principal"], "timestamp": "Time"},
      "#PROPOSALEXECUTED": {"proposalId": "Nat", "proposer": "Principal", "result": "#EXECUTED | #FAILED", "timestamp": "Time"}
    }
  ]
}
```

### 11. `postSystemGenericNotification(message, link)` returns `()`

#### Arguments:

```json
{"message": "Text", "link": {"anchorText": "Text", "url": "Text"}}
```

### 12. `register(username, capitalRaised, referrer)` returns `()`

#### Arguments:

```json
{"username": "Text", "capitalRaised": "Nat", "referrer": "Principal"}
```

### 13. `registerWithCoupon(username, coupon)` returns `()`

#### Arguments:

```json
{"username": "Text", "coupon": ["Nat8"]}
```

### 14. `editUsername(username)` returns `()`

#### Arguments:

```json
{"username": "Text"}
```

### 15. `editLocation(location)` returns `()`

#### Arguments:

```json
{"location": "Text"}
```

### 16. `editAvatar(picture)` returns `()`

#### Arguments:

```json
{"picture": {"blob": "Blob"}}
```

### 17. `editLinks(links)` returns `()`

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

### 3. `getUserCapitalRaised(principal)` returns `Nat`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
"Nat"
```

### 4. `getUserIdentifier(from)` returns `User.Identifier`

#### Arguments:

```json
{"from": {"#PRINCIPAL": "Principal", "#USERNAME": "Text"}}
```

#### Returns:
```json
{"principal": "Principal", "username": "Text", "capitalRaised": "Nat"}
```

### 5. `getUsersIdentifier()` returns `[User.Identifier]`

#### Returns:
```json
[{"principal": "Principal", "username": "Text", "capitalRaised": "Nat"}]
```

### 6. `getUsersPrincipal()` returns `[Principal]`

#### Returns:
```json
["Principal"]
```

### 7. `getUsersCount()` returns `Nat`

#### Returns:
```json
"Nat"
```

### 8. `getUser(principal)` returns `User.Sharable`

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

### 9. `getUsers(filter, sort)` returns `[User.Sharable]`

#### Arguments:

```json
{
  "filter": {"capitalRaised": "Nat", "q": "Text"},
  "sort": {"by": "#RECENT | #CAPITALRAISED | #ALPHABETICAL", "order": "#ASCENDING | #DESCENDING"}
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

### 10. `getUsersPagination(filter, sort, page, limit)` returns `Pagination.Pagination<User.Sharable>`

#### Arguments:

```json
{
  "filter": {"capitalRaised": "Nat", "q": "Text"},
  "sort": {"by": "#RECENT | #CAPITALRAISED | #ALPHABETICAL", "order": "#ASCENDING | #DESCENDING"},
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

### 11. `getNotification()` returns `Notifications.Sharable`

#### Returns:
```json
[
  [
    {
      "#CUSTODIANELECTIONRESULT": {"result": "#REMOVED | #UNCHANGED | #NEW", "claimable": "Nat", "timestamp": "Time"},
      "#CUSTODIANPROPOSALRESULT": {"proposalId": "Nat", "proposer": "Principal", "result": "#APPROVED | #REJECTED | #EXPIRED", "timestamp": "Time"},
      "#CUSTODIANPROPOSALDELEGATED": {"proposalId": "Nat", "delegator": "Principal", "timestamp": "Time"},
      "#CUSTODIANPROPOSALOPENED": {"proposalId": "Nat", "proposer": "Principal", "retried": "Nat", "timestamp": "Time"},
      "#PROPOSALEXECUTED": {"proposalId": "Nat", "result": "#EXECUTED | #FAILED", "claimable": "Nat", "timestamp": "Time"},
      "#PROPOSALRESULT": {"proposalId": "Nat", "result": "#APPROVED | #REJECTED | #EXPIRED", "timestamp": "Time"},
      "#COUPONREDEEMED": {"key": "Text", "user": "Principal", "timestamp": "Time"},
      "#COUPONEXPIRED": {"key": "Text", "claimable": "Nat", "timestamp": "Time"},
      "#NEWHYPOTHESESFROMFOLLOWINGS": {"capacity": [{"publisher": "Principal", "hypothesisId": "Nat", "timestamp": "Time"}], "total": "Nat"},
      "#NEWEVIDENCESFROMFOLLOWINGS": {"capacity": [{"publisher": "Principal", "evidenceId": "Nat", "timestamp": "Time"}], "total": "Nat"},
      "#NEWREFERRALS": {"capacity": [{"user": "Principal", "claimable": "Nat", "timestamp": "Time"}], "total": "Nat"},
      "#NEWFOLLOWERS": {"capacity": [{"user": "Principal", "timestamp": "Time"}], "total": "Nat"},
      "#NEWBALLOTS": {"capacity": [{"voter": "Principal", "timestamp": "Time"}], "total": "Nat"},
      "#NEWEVIDENCESTOHYPOTHESIS": {
        "id": "Nat",
        "capacity": [{"evidenceId": "Nat", "publisher": "Principal", "side": "#POSITIVE | #NEGATIVE", "timestamp": "Time"}],
        "total": "Nat"
      },
      "#NEWAXIOMSTOHYPOTHESIS": {"id": "Nat", "capacity": [{"user": "Principal", "timestamp": "Time"}], "total": "Nat"},
      "#NEWREPLIESTOEVIDENCE": {"id": "Nat", "capacity": [{"evidenceId": "Nat", "publisher": "Principal", "timestamp": "Time"}], "total": "Nat"},
      "#NEWVOTESTOHYPOTHESIS": {
        "id": "Nat",
        "capacity": [{"voter": "Principal", "choice": "#POSITIVE | #NEUTRAL | #NEGATIVE", "timestamp": "Time"}],
        "total": "Nat"
      },
      "#NEWVOTESTOEVIDENCE": {
        "id": "Nat",
        "capacity": [{"voter": "Principal", "choice": "#POSITIVE | #NEGATIVE", "timestamp": "Time"}],
        "total": "Nat"
      },
      "#NEWVOTESTOPROPOSAL": {
        "id": "Nat",
        "capacity": [{"voter": "Principal", "choice": "#POSITIVE | #NEGATIVE", "timestamp": "Time"}],
        "total": "Nat"
      }
    }
  ],
  [
    {
      "#SYSTEMGENERIC": {"message": "Text", "link": {"anchorText": "Text", "url": "Text"}, "timestamp": "Time"},
      "#FLAGREQUESTED": {"header": {"id": "Nat", "category": "#HYPOTHESIS | #EVIDENCE"}, "timestamp": "Time"},
      "#FLAGRESULT": {
        "header": {"id": "Nat", "category": "#HYPOTHESIS | #EVIDENCE"},
        "result": "#APPROVED | #REJECTED | #EXPIRED",
        "timestamp": "Time"
      },
      "#TALLYRESULT": {"new": ["Principal"], "removed": ["Principal"], "unchanged": ["Principal"], "timestamp": "Time"},
      "#PROPOSALEXECUTED": {"proposalId": "Nat", "proposer": "Principal", "result": "#EXECUTED | #FAILED", "timestamp": "Time"}
    }
  ]
]
```
