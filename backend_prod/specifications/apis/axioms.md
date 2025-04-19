# Axioms API Specification

## Dependencies


- Attributes: `Age`, `Ages`, `Evidence`, `Evidences`, `Field`, `Fields`, `Hypothesis`, `Hypotheses`, `Payout`, `Payouts`, `Ranks`, `User`, `Users`, `Flag`, `Flags`
- Interfaces: `EscrowInterface`, `TreasuryInterface`, `IndicatorInterface`
- Commons: `C`, `E`
- Libraries: `Array`, `Base`, `Configs`, `ClusterTree`, `Count`, `Date`, `DoubleClusterTree`, `DoubleRankTree`, `E8S`, `Earning`, `Format`, `Iter`, `List`, `Map`, `Pagination`, `Proportion`, `Set`, `BinaryVotes`, `TernaryVotes`
- Bases: `Time`, `Principal`, `Text`, `Int`, `Nat`, `Timer`, `Float`, `Debug`
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

### 4. `register(principal)` returns `()`

#### Arguments:

```json
{"principal": "Principal"}
```

### 5. `createField(name, description)` returns `()`

#### Arguments:

```json
{"name": "Text", "description": "Text"}
```

### 6. `joinField(fieldId)` returns `()`

#### Arguments:

```json
{"fieldId": "Text"}
```

### 7. `leaveField(fieldId)` returns `()`

#### Arguments:

```json
{"fieldId": "Text"}
```

### 8. `publishHypothesis(fieldId, content)` returns `Nat`

#### Arguments:

```json
{"fieldId": "Text", "content": "Text"}
```

#### Returns:
```json
"Nat"
```

### 9. `publishEvidence(hypothesisId, form, choice)` returns `Nat`

#### Arguments:

```json
{
  "hypothesisId": "Nat",
  "form": [
    {
      "#PICTURE": {"blob": "Blob"},
      "#HYPERLINK": {"anchorText": "Text", "url": "Text"},
      "#NOTE": {"content": "Text", "extended": "Bool"}
    }
  ],
  "choice": "#POSITIVE | #NEGATIVE"
}
```

#### Returns:
```json
"Nat"
```

### 10. `requestFlag(header, reason)` returns `()`

#### Arguments:

```json
{"header": {"id": "Nat", "category": "#HYPOTHESIS | #EVIDENCE"}, "reason": "Text"}
```

### 11. `voteHypothesis(hypothesisId, choice)` returns `()`

#### Arguments:

```json
{"hypothesisId": "Nat", "choice": "#POSITIVE | #NEUTRAL | #NEGATIVE"}
```

### 12. `voteEvidence(evidenceId, choice)` returns `()`

#### Arguments:

```json
{"evidenceId": "Nat", "choice": "#POSITIVE | #NEGATIVE"}
```

### 13. `voteFlag(header, choice)` returns `()`

#### Arguments:

```json
{"header": {"id": "Nat", "category": "#HYPOTHESIS | #EVIDENCE"}, "choice": "#POSITIVE | #NEGATIVE"}
```

### 14. `removeHypothesisVote(hypothesisId)` returns `()`

#### Arguments:

```json
{"hypothesisId": "Nat"}
```

### 15. `removeEvidenceVote(evidenceId)` returns `()`

#### Arguments:

```json
{"evidenceId": "Nat"}
```

### 16. `removeFlagVote(header)` returns `()`

#### Arguments:

```json
{"header": {"id": "Nat", "category": "#HYPOTHESIS | #EVIDENCE"}}
```

### 17. `addToAxioms(hypothesisId)` returns `()`

#### Arguments:

```json
{"hypothesisId": "Nat"}
```

### 18. `addToBookmarks(hypothesisId)` returns `()`

#### Arguments:

```json
{"hypothesisId": "Nat"}
```

### 19. `removeFromAxioms(hypothesisId)` returns `()`

#### Arguments:

```json
{"hypothesisId": "Nat"}
```

### 20. `removeFromBookmarks(hypothesisId)` returns `()`

#### Arguments:

```json
{"hypothesisId": "Nat"}
```

### 21. `withdrawAll()` returns `()`

## Accessors

### 1. `getEarnings(principal)` returns `[Earning.Sharable]`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
[{"revenue": "Nat", "balance": "Nat", "lastWithdrawAt": "Time"}]
```

### 2. `getConfig(key)` returns `Configs.SharableValue`

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

### 3. `getConfigs()` returns `Configs.Sharable`

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

### 4. `getField(name)` returns `Field.Sharable`

#### Arguments:

```json
{"name": "Text"}
```

#### Returns:
```json
{
  "name": "Text",
  "description": "Text",
  "creationDate": "Time",
  "members": ["Principal"],
  "hypothesisIds": ["Nat"],
  "callerRole": "#MEMBER | #GUEST"
}
```

### 5. `getFields(filter, sort)` returns `Fields.Sharable`

#### Arguments:

```json
{
  "filter": {"joinedBy": "Principal", "containsPattern": "Text"},
  "sort": {"by": "#RECENT | #ALPHABETICAL | #POPULARITY", "order": "#ASCENDING | #DESCENDING"}
}
```

#### Returns:
```json
[
  {
    "name": "Text",
    "description": "Text",
    "creationDate": "Time",
    "members": ["Principal"],
    "hypothesisIds": ["Nat"],
    "callerRole": "#MEMBER | #GUEST"
  }
]
```

### 6. `getFieldsPagination(filter, sort, page, limit)` returns `Pagination.Pagination<Field.Sharable>`

#### Arguments:

```json
{
  "filter": {"joinedBy": "Principal", "containsPattern": "Text"},
  "sort": {"by": "#RECENT | #ALPHABETICAL | #POPULARITY", "order": "#ASCENDING | #DESCENDING"},
  "page": "Nat",
  "limit": "Nat"
}
```

#### Returns:
```json
{
  "result": {
    "name": "Text",
    "description": "Text",
    "creationDate": "Time",
    "members": ["Principal"],
    "hypothesisIds": ["Nat"],
    "callerRole": "#MEMBER | #GUEST"
  },
  "is": "Nat",
  "of": "Nat"
}
```

### 7. `getHypothesis(hypothesisId)` returns `Hypothesis.Sharable`

#### Arguments:

```json
{"hypothesisId": "Nat"}
```

#### Returns:
```json
{
  "id": "Nat",
  "content": "Text",
  "publisher": "Principal",
  "publishDate": "Int",
  "fieldId": "Text",
  "votes": {"powered": ["Nat", "Nat", "Nat"], "regular": ["Nat", "Nat", "Nat"]},
  "evidenceIds": ["Nat"],
  "axioms": "Nat",
  "callerVote": {"choice": "#POSITIVE | #NEUTRAL | #NEGATIVE", "value": "Nat"},
  "callerAxiom": "Bool",
  "callerBookmark": "Bool"
}
```

### 8. `getHypotheses(filter, sort)` returns `Hypotheses.Sharable`

#### Arguments:

```json
{
  "filter": {
    "publishedAt": "Nat",
    "publishedIn": "Text",
    "publishedBy": "Principal",
    "votedBy": "Principal",
    "axiomsFrom": "Principal",
    "bookmarksFrom": "Principal",
    "containsPattern": "Text"
  },
  "sort": {
    "by": "#RECENT | #CONTROVERSY | #POPULARITY | #POSITIVITY | #NEUTRALITY | #NEGATIVITY",
    "order": "#ASCENDING | #DESCENDING"
  }
}
```

#### Returns:
```json
[
  {
    "id": "Nat",
    "content": "Text",
    "publisher": "Principal",
    "publishDate": "Int",
    "fieldId": "Text",
    "votes": {"powered": ["Nat", "Nat", "Nat"], "regular": ["Nat", "Nat", "Nat"]},
    "evidenceIds": ["Nat"],
    "axioms": "Nat",
    "callerVote": {"choice": "#POSITIVE | #NEUTRAL | #NEGATIVE", "value": "Nat"},
    "callerAxiom": "Bool",
    "callerBookmark": "Bool"
  }
]
```

### 9. `getHypothesesPagination(filter, sort, page, limit)` returns `Pagination.Pagination<Hypothesis.Sharable>`

#### Arguments:

```json
{
  "filter": {
    "publishedAt": "Nat",
    "publishedIn": "Text",
    "publishedBy": "Principal",
    "votedBy": "Principal",
    "axiomsFrom": "Principal",
    "bookmarksFrom": "Principal",
    "containsPattern": "Text"
  },
  "sort": {
    "by": "#RECENT | #CONTROVERSY | #POPULARITY | #POSITIVITY | #NEUTRALITY | #NEGATIVITY",
    "order": "#ASCENDING | #DESCENDING"
  },
  "page": "Nat",
  "limit": "Nat"
}
```

#### Returns:
```json
{
  "result": {
    "id": "Nat",
    "content": "Text",
    "publisher": "Principal",
    "publishDate": "Int",
    "fieldId": "Text",
    "votes": {"powered": ["Nat", "Nat", "Nat"], "regular": ["Nat", "Nat", "Nat"]},
    "evidenceIds": ["Nat"],
    "axioms": "Nat",
    "callerVote": {"choice": "#POSITIVE | #NEUTRAL | #NEGATIVE", "value": "Nat"},
    "callerAxiom": "Bool",
    "callerBookmark": "Bool"
  },
  "is": "Nat",
  "of": "Nat"
}
```

### 10. `getEvidence(evidenceId)` returns `Evidence.Sharable`

#### Arguments:

```json
{"evidenceId": "Nat"}
```

#### Returns:
```json
{
  "id": "Nat",
  "form": [
    {
      "#PICTURE": {"blob": "Blob"},
      "#HYPERLINK": {"anchorText": "Text", "url": "Text"},
      "#NOTE": {"content": "Text", "extended": "Bool"}
    }
  ],
  "publisher": "Principal",
  "publishDate": "Int",
  "hypothesisId": "Nat",
  "votes": {"powered": ["Nat", "Nat"], "regular": ["Nat", "Nat"]},
  "choice": "#POSITIVE | #NEGATIVE",
  "callerVote": {"choice": "#POSITIVE | #NEGATIVE", "value": "Nat"}
}
```

### 11. `getEvidences(filter, sort)` returns `Evidences.Sharable`

#### Arguments:

```json
{
  "filter": {
    "publishedIn": "Nat",
    "publishedBy": "Principal",
    "votedBy": "Principal",
    "onSide": "#POSITIVE | #NEGATIVE",
    "containsPattern": "Text"
  },
  "sort": {"by": "#RECENT | #POPULARITY | #POSITIVITY | #NEGATIVITY", "order": "#ASCENDING | #DESCENDING"}
}
```

#### Returns:
```json
[
  {
    "id": "Nat",
    "form": [
      {
        "#PICTURE": {"blob": "Blob"},
        "#HYPERLINK": {"anchorText": "Text", "url": "Text"},
        "#NOTE": {"content": "Text", "extended": "Bool"}
      }
    ],
    "publisher": "Principal",
    "publishDate": "Int",
    "hypothesisId": "Nat",
    "votes": {"powered": ["Nat", "Nat"], "regular": ["Nat", "Nat"]},
    "choice": "#POSITIVE | #NEGATIVE",
    "callerVote": {"choice": "#POSITIVE | #NEGATIVE", "value": "Nat"}
  }
]
```

### 12. `getEvidencesPagination(filter, sort, page, limit)` returns `Pagination.Pagination<Evidence.Sharable>`

#### Arguments:

```json
{
  "filter": {
    "publishedIn": "Nat",
    "publishedBy": "Principal",
    "votedBy": "Principal",
    "onSide": "#POSITIVE | #NEGATIVE",
    "containsPattern": "Text"
  },
  "sort": {"by": "#RECENT | #POPULARITY | #POSITIVITY | #NEGATIVITY", "order": "#ASCENDING | #DESCENDING"},
  "page": "Nat",
  "limit": "Nat"
}
```

#### Returns:
```json
{
  "result": {
    "id": "Nat",
    "form": [
      {
        "#PICTURE": {"blob": "Blob"},
        "#HYPERLINK": {"anchorText": "Text", "url": "Text"},
        "#NOTE": {"content": "Text", "extended": "Bool"}
      }
    ],
    "publisher": "Principal",
    "publishDate": "Int",
    "hypothesisId": "Nat",
    "votes": {"powered": ["Nat", "Nat"], "regular": ["Nat", "Nat"]},
    "choice": "#POSITIVE | #NEGATIVE",
    "callerVote": {"choice": "#POSITIVE | #NEGATIVE", "value": "Nat"}
  },
  "is": "Nat",
  "of": "Nat"
}
```

### 13. `getFlag(header)` returns `Flag.Sharable`

#### Arguments:

```json
{"header": {"id": "Nat", "category": "#HYPOTHESIS | #EVIDENCE"}}
```

#### Returns:
```json
{
  "id": "Nat",
  "requester": "Principal",
  "requestDate": "Time",
  "votes": {"powered": ["Nat", "Nat"], "regular": ["Nat", "Nat"]},
  "reason": "Text",
  "category": "#HYPOTHESIS | #EVIDENCE",
  "status": "#REQUESTED | #APPROVED | #REJECTED | #EXPIRED",
  "callerVote": {"choice": "#POSITIVE | #NEGATIVE", "value": "Nat"}
}
```

### 14. `getFlags(filter, sort)` returns `Flags.Sharable`

#### Arguments:

```json
{
  "filter": {
    "requestedBy": "Principal",
    "requestedIn": "#HYPOTHESIS | #EVIDENCE",
    "votedBy": "Principal",
    "withStatus": "#REQUESTED | #APPROVED | #REJECTED | #EXPIRED"
  },
  "sort": {"by": "#RECENT | #DIFFERENCE", "order": "#ASCENDING | #DESCENDING"}
}
```

#### Returns:
```json
[
  {
    "id": "Nat",
    "requester": "Principal",
    "requestDate": "Time",
    "votes": {"powered": ["Nat", "Nat"], "regular": ["Nat", "Nat"]},
    "reason": "Text",
    "category": "#HYPOTHESIS | #EVIDENCE",
    "status": "#REQUESTED | #APPROVED | #REJECTED | #EXPIRED",
    "callerVote": {"choice": "#POSITIVE | #NEGATIVE", "value": "Nat"}
  }
]
```

### 15. `getFlagsPagination(filter, sort, page, limit)` returns `Pagination.Pagination<Flag.Sharable>`

#### Arguments:

```json
{
  "filter": {
    "requestedBy": "Principal",
    "requestedIn": "#HYPOTHESIS | #EVIDENCE",
    "votedBy": "Principal",
    "withStatus": "#REQUESTED | #APPROVED | #REJECTED | #EXPIRED"
  },
  "sort": {"by": "#RECENT | #DIFFERENCE", "order": "#ASCENDING | #DESCENDING"},
  "page": "Nat",
  "limit": "Nat"
}
```

#### Returns:
```json
{
  "result": {
    "id": "Nat",
    "requester": "Principal",
    "requestDate": "Time",
    "votes": {"powered": ["Nat", "Nat"], "regular": ["Nat", "Nat"]},
    "reason": "Text",
    "category": "#HYPOTHESIS | #EVIDENCE",
    "status": "#REQUESTED | #APPROVED | #REJECTED | #EXPIRED",
    "callerVote": {"choice": "#POSITIVE | #NEGATIVE", "value": "Nat"}
  },
  "is": "Nat",
  "of": "Nat"
}
```

### 16. `getAgePayout(ageId, ago)` returns `Payout.Sharable`

#### Arguments:

```json
{"ageId": "Nat", "ago": "Nat"}
```

#### Returns:
```json
{
  "ranks": [
    {
      "hypothesisId": "Nat",
      "averageRank": "Float",
      "regularEntry": {"rank": "Nat", "score": "Nat"},
      "poweredEntry": {"rank": "Nat", "score": "Nat"}
    }
  ],
  "callerRevenue": "Nat"
}
```

### 17. `getAgePayouts(ageId)` returns `Payouts.Sharable`

#### Arguments:

```json
{"ageId": "Nat"}
```

#### Returns:
```json
[
  {
    "ranks": [
      {
        "hypothesisId": "Nat",
        "averageRank": "Float",
        "regularEntry": {"rank": "Nat", "score": "Nat"},
        "poweredEntry": {"rank": "Nat", "score": "Nat"}
      }
    ],
    "callerRevenue": "Nat"
  }
]
```

### 18. `getAgesPayout(ago)` returns `Payouts.Sharable`

#### Arguments:

```json
{"ago": "Nat"}
```

#### Returns:
```json
[
  {
    "ranks": [
      {
        "hypothesisId": "Nat",
        "averageRank": "Float",
        "regularEntry": {"rank": "Nat", "score": "Nat"},
        "poweredEntry": {"rank": "Nat", "score": "Nat"}
      }
    ],
    "callerRevenue": "Nat"
  }
]
```

### 19. `getAgesPayouts()` returns `[Payouts.Sharable]`

#### Returns:
```json
[
  {
    "ranks": [
      {
        "hypothesisId": "Nat",
        "averageRank": "Float",
        "regularEntry": {"rank": "Nat", "score": "Nat"},
        "poweredEntry": {"rank": "Nat", "score": "Nat"}
      }
    ],
    "callerRevenue": "Nat"
  }
]
```

### 20. `getUser(principal)` returns `User.Sharable`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
{
  "earning": {"revenue": "Nat", "balance": "Nat", "lastWithdrawAt": "Time"},
  "axioms": ["Nat"],
  "bookmarks": ["Nat"],
  "joinedFields": ["Text"],
  "hypotheses": ["Nat"],
  "evidences": ["Nat"],
  "votedHypotheses": [["Nat", {"choice": "#POSITIVE | #NEUTRAL | #NEGATIVE", "value": "Nat"}]],
  "votedEvidences": [["Nat", {"choice": "#POSITIVE | #NEGATIVE", "value": "Nat"}]]
}
```

### 21. `getEarning(principal)` returns `Earning.Sharable`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
{"revenue": "Nat", "balance": "Nat", "lastWithdrawAt": "Time"}
```

### 22. `expectUserNotFound(principal)` returns `()`

#### Arguments:

```json
{"principal": "Principal"}
```
