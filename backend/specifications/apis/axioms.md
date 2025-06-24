# Axioms API Specification

## Dependencies


- Attributes: `Age`, `Ages`, `Evidence`, `Evidences`, `Field`, `Fields`, `Hypothesis`, `Hypotheses`, `Payout`, `Payouts`, `Ranks`, `User`, `Users`, `Flag`, `Flags`, `Notification`
- Interfaces: `EscrowInterface`, `TreasuryInterface`, `FacadeInterface`, `IndicatorInterface`
- Commons: `C`, `E`
- Libraries: `Array`, `Base`, `Configs`, `ClusterTree`, `Count`, `Date`, `DoubleClusterTree`, `DoubleRankTree`, `E8S`, `Earning`, `Format`, `Iter`, `List`, `Map`, `Pagination`, `Proportion`, `Set`, `BinaryVotes`, `TernaryVotes`
- Bases: `Time`, `Principal`, `Text`, `Int`, `Nat`, `Timer`, `Float`, `Debug`
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

### 5. `register(principal)` returns `()`

#### Arguments:

```json
{"principal": "Principal"}
```

### 6. `createField(name, description)` returns `()`

#### Arguments:

```json
{"name": "Text", "description": "Text"}
```

### 7. `joinField(fieldId)` returns `()`

#### Arguments:

```json
{"fieldId": "Text"}
```

### 8. `leaveField(fieldId)` returns `()`

#### Arguments:

```json
{"fieldId": "Text"}
```

### 9. `publishHypothesis(fieldId, content)` returns `Nat`

#### Arguments:

```json
{"fieldId": "Text", "content": "Text"}
```

#### Returns:
```json
"Nat"
```

### 10. `editHypothesis(hypothesisId, content)` returns `()`

#### Arguments:

```json
{"hypothesisId": "Nat", "content": "Text"}
```

### 11. `publishEvidence(hypothesisId, form, choice, repliedTo)` returns `Nat`

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
  "choice": "#POSITIVE | #NEGATIVE",
  "repliedTo": "Nat"
}
```

#### Returns:
```json
"Nat"
```

### 12. `requestFlag(header, reason)` returns `()`

#### Arguments:

```json
{"header": {"id": "Nat", "category": "#HYPOTHESIS | #EVIDENCE"}, "reason": "Text"}
```

### 13. `voteHypothesis(hypothesisId, choice)` returns `()`

#### Arguments:

```json
{"hypothesisId": "Nat", "choice": "#POSITIVE | #NEUTRAL | #NEGATIVE"}
```

### 14. `voteEvidence(evidenceId, choice)` returns `()`

#### Arguments:

```json
{"evidenceId": "Nat", "choice": "#POSITIVE | #NEGATIVE"}
```

### 15. `voteFlag(header, choice)` returns `()`

#### Arguments:

```json
{"header": {"id": "Nat", "category": "#HYPOTHESIS | #EVIDENCE"}, "choice": "#POSITIVE | #NEGATIVE"}
```

### 16. `removeHypothesisVote(hypothesisId)` returns `()`

#### Arguments:

```json
{"hypothesisId": "Nat"}
```

### 17. `removeEvidenceVote(evidenceId)` returns `()`

#### Arguments:

```json
{"evidenceId": "Nat"}
```

### 18. `removeFlagVote(header)` returns `()`

#### Arguments:

```json
{"header": {"id": "Nat", "category": "#HYPOTHESIS | #EVIDENCE"}}
```

### 19. `addToAxioms(hypothesisId)` returns `()`

#### Arguments:

```json
{"hypothesisId": "Nat"}
```

### 20. `addToBookmarks(hypothesisId)` returns `()`

#### Arguments:

```json
{"hypothesisId": "Nat"}
```

### 21. `removeFromAxioms(hypothesisId)` returns `()`

#### Arguments:

```json
{"hypothesisId": "Nat"}
```

### 22. `removeFromBookmarks(hypothesisId)` returns `()`

#### Arguments:

```json
{"hypothesisId": "Nat"}
```

### 23. `follow(principal)` returns `()`

#### Arguments:

```json
{"principal": "Principal"}
```

### 24. `unfollow(principal)` returns `()`

#### Arguments:

```json
{"principal": "Principal"}
```

### 25. `withdrawAll()` returns `()`

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

### 3. `getField(name)` returns `Field.Sharable`

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

### 4. `getFields(filter, sort)` returns `Fields.Sharable`

#### Arguments:

```json
{
  "filter": {"member": "Principal", "q": "Text"},
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

### 5. `getFieldsPagination(filter, sort, page, limit)` returns `Pagination.Pagination<Field.Sharable>`

#### Arguments:

```json
{
  "filter": {"member": "Principal", "q": "Text"},
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

### 6. `getHypothesis(hypothesisId)` returns `Hypothesis.Sharable`

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

### 7. `getHypotheses(filter, sort)` returns `Hypotheses.Sharable`

#### Arguments:

```json
{
  "filter": {
    "age": "Nat",
    "field": "Text",
    "publisher": "Principal",
    "voter": "Principal",
    "axiomsFrom": "Principal",
    "bookmarksFrom": "Principal",
    "userJoinedFields": "Principal",
    "userFollowedPublishers": "Principal",
    "q": "Text"
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

### 8. `getHypothesesPagination(filter, sort, page, limit)` returns `Pagination.Pagination<Hypothesis.Sharable>`

#### Arguments:

```json
{
  "filter": {
    "age": "Nat",
    "field": "Text",
    "publisher": "Principal",
    "voter": "Principal",
    "axiomsFrom": "Principal",
    "bookmarksFrom": "Principal",
    "userJoinedFields": "Principal",
    "userFollowedPublishers": "Principal",
    "q": "Text"
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

### 9. `getEvidence(evidenceId)` returns `Evidence.Sharable`

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
  "callerVote": {"choice": "#POSITIVE | #NEGATIVE", "value": "Nat"},
  "repliedTo": "Nat",
  "replies": ["Nat"]
}
```

### 10. `getEvidences(filter, sort)` returns `Evidences.Sharable`

#### Arguments:

```json
{
  "filter": {
    "hypothesis": "Nat",
    "publisher": "Principal",
    "voter": "Principal",
    "side": "#POSITIVE | #NEGATIVE",
    "repliedTo": "Nat",
    "q": "Text"
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
    "callerVote": {"choice": "#POSITIVE | #NEGATIVE", "value": "Nat"},
    "repliedTo": "Nat",
    "replies": ["Nat"]
  }
]
```

### 11. `getEvidencesPagination(filter, sort, page, limit)` returns `Pagination.Pagination<Evidence.Sharable>`

#### Arguments:

```json
{
  "filter": {
    "hypothesis": "Nat",
    "publisher": "Principal",
    "voter": "Principal",
    "side": "#POSITIVE | #NEGATIVE",
    "repliedTo": "Nat",
    "q": "Text"
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
    "callerVote": {"choice": "#POSITIVE | #NEGATIVE", "value": "Nat"},
    "repliedTo": "Nat",
    "replies": ["Nat"]
  },
  "is": "Nat",
  "of": "Nat"
}
```

### 12. `getFlag(header)` returns `Flag.Sharable`

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

### 13. `getFlags(filter, sort)` returns `Flags.Sharable`

#### Arguments:

```json
{
  "filter": {
    "requester": "Principal",
    "voter": "Principal",
    "category": "#HYPOTHESIS | #EVIDENCE",
    "status": "#REQUESTED | #APPROVED | #REJECTED | #EXPIRED"
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

### 14. `getFlagsPagination(filter, sort, page, limit)` returns `Pagination.Pagination<Flag.Sharable>`

#### Arguments:

```json
{
  "filter": {
    "requester": "Principal",
    "voter": "Principal",
    "category": "#HYPOTHESIS | #EVIDENCE",
    "status": "#REQUESTED | #APPROVED | #REJECTED | #EXPIRED"
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

### 15. `getTop(category)` returns `Pagination.TopNonPagination`

#### Arguments:

```json
{
  "category": "#INFLUENCERS | #HYPOTHESISPUBLISHERS | #EVIDENCEPUBLISHERS | #HYPOTHESISVOTERS | #EVIDENCEVOTERS | #ACORNEARNERS"
}
```

#### Returns:
```json
{"result": [["Principal", "Nat"]], "callerRank": "Nat"}
```

### 16. `getTopPagination(category, page, limit)` returns `Pagination.TopPagination`

#### Arguments:

```json
{
  "category": "#INFLUENCERS | #HYPOTHESISPUBLISHERS | #EVIDENCEPUBLISHERS | #HYPOTHESISVOTERS | #EVIDENCEVOTERS | #ACORNEARNERS",
  "page": "Nat",
  "limit": "Nat"
}
```

#### Returns:
```json
{"result": [["Principal", "Nat"]], "callerRank": "Nat", "is": "Nat", "of": "Nat"}
```

### 17. `getAgePayout(ageId, ago)` returns `Payout.Sharable`

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
      "regularEntry": {"rank": "Int", "score": "Int"},
      "poweredEntry": {"rank": "Int", "score": "Int"}
    }
  ],
  "callerRevenue": "Nat"
}
```

### 18. `getAgePayouts(ageId)` returns `Payouts.Sharable`

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
        "regularEntry": {"rank": "Int", "score": "Int"},
        "poweredEntry": {"rank": "Int", "score": "Int"}
      }
    ],
    "callerRevenue": "Nat"
  }
]
```

### 19. `getAgesPayout(ago)` returns `Payouts.Sharable`

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
        "regularEntry": {"rank": "Int", "score": "Int"},
        "poweredEntry": {"rank": "Int", "score": "Int"}
      }
    ],
    "callerRevenue": "Nat"
  }
]
```

### 20. `getAgesPayouts()` returns `[Payouts.Sharable]`

#### Returns:
```json
[
  {
    "ranks": [
      {
        "hypothesisId": "Nat",
        "averageRank": "Float",
        "regularEntry": {"rank": "Int", "score": "Int"},
        "poweredEntry": {"rank": "Int", "score": "Int"}
      }
    ],
    "callerRevenue": "Nat"
  }
]
```

### 21. `getUser(principal)` returns `User.Sharable`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
{
  "principal": "Principal",
  "earning": {"revenue": "Nat", "balance": "Nat", "lastWithdrawAt": "Time"},
  "followers": ["Principal"],
  "followings": ["Principal"],
  "axioms": ["Nat"],
  "bookmarks": ["Nat"],
  "joinedFields": ["Text"],
  "hypotheses": ["Nat"],
  "evidences": ["Nat"],
  "votedHypotheses": [["Nat", {"choice": "#POSITIVE | #NEUTRAL | #NEGATIVE", "value": "Nat"}]],
  "votedEvidences": [["Nat", {"choice": "#POSITIVE | #NEGATIVE", "value": "Nat"}]],
  "callerFollowing": "Bool",
  "callerFollower": "Bool"
}
```

### 22. `getEarning(principal)` returns `Earning.Sharable`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
{"revenue": "Nat", "balance": "Nat", "lastWithdrawAt": "Time"}
```

### 23. `expectUserNotFound(principal)` returns `()`

#### Arguments:

```json
{"principal": "Principal"}
```
