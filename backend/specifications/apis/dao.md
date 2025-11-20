# DAO API Specification

## Dependencies


- Attributes: `Proposal`, `Proposals`, `Nominees`, `Nominee`, `Users`, `User`, `Detachment`, `Commitments`, `Installation`, `Notification`, `Actor`
- Interfaces: `IndicatorInterface`, `FacadeInterface`, `EscrowInterface`, `SplitInterface`, `TreasuryInterface`, `AxiomsInterface`
- Commons: `C`, `E`
- Libraries: `Base`, `Configs`, `Count`, `Delegable`, `E8S`, `Earning`, `Iter`, `List`, `Pagination`, `Proportion`, `Set`, `UniformBinaryVotes`, `Version`, `Vector`
- Bases: `Principal`, `Text`, `Time`, `Error`, `Nat`, `Int`, `Timer`, `Array`
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

### 6. `setCodeProposalFailed(proposalId, error)` returns `()`

#### Arguments:

```json
{"proposalId": "Nat", "error": "Text"}
```

### 7. `setCodeProposalExecuted(proposalId)` returns `()`

#### Arguments:

```json
{"proposalId": "Nat"}
```

### 8. `initializeCodeUploadSession(commitHash, updateLevel, releaseNotes, commitments)` returns `()`

#### Arguments:

```json
{
  "commitHash": "Text",
  "updateLevel": "#MAJOR | #MINOR | #PATCH",
  "releaseNotes": [{"#ADDED": ["Text"], "#CHANGED": ["Text"], "#REMOVED": ["Text"], "#FIXED": ["Text"], "#SECURITY": ["Text"]}],
  "commitments": [
    {
      "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN",
      "args": ["Nat8"],
      "moduleHash": "Text"
    }
  ]
}
```

### 9. `cancelCodeUpload()` returns `()`

### 10. `openCodeProposal(content, acornReward, icpReward, actorsConfigs)` returns `Nat`

#### Arguments:

```json
{
  "content": "Text",
  "acornReward": "Nat",
  "icpReward": "Nat",
  "actorsConfigs": [
    [
      "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR",
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
    ]
  ]
}
```

#### Returns:
```json
"Nat"
```

### 11. `openConfigsProposal(content, acornReward, icpReward, actorsConfigs)` returns `Nat`

#### Arguments:

```json
{
  "content": "Text",
  "acornReward": "Nat",
  "icpReward": "Nat",
  "actorsConfigs": [
    [
      "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR",
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
    ]
  ]
}
```

#### Returns:
```json
"Nat"
```

### 12. `openWorkerProposal(title, content, acornReward, icpReward)` returns `Nat`

#### Arguments:

```json
{"title": "Text", "content": "Text", "acornReward": "Nat", "icpReward": "Nat"}
```

#### Returns:
```json
"Nat"
```

### 13. `openFieldProposal(content, name, description)` returns `Nat`

#### Arguments:

```json
{"content": "Text", "name": "Text", "description": "Text"}
```

#### Returns:
```json
"Nat"
```

### 14. `retryConfigsProposal(proposalId, updatedContent, updatedAcornReward, updatedIcpReward, updatedActorsConfigs)` returns `()`

#### Arguments:

```json
{
  "proposalId": "Nat",
  "updatedContent": "Text",
  "updatedAcornReward": "Nat",
  "updatedIcpReward": "Nat",
  "updatedActorsConfigs": [
    [
      "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR",
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
    ]
  ]
}
```

### 15. `retryWorkerProposal(proposalId, updatedContent, updatedAcornReward, updatedIcpReward)` returns `()`

#### Arguments:

```json
{"proposalId": "Nat", "updatedContent": "Text", "updatedAcornReward": "Nat", "updatedIcpReward": "Nat"}
```

### 16. `retryFieldProposal(proposalId, updatedContent, updatedName, updatedDescription)` returns `()`

#### Arguments:

```json
{"proposalId": "Nat", "updatedContent": "Text", "updatedName": "Text", "updatedDescription": "Text"}
```

### 17. `voteProposal(proposalId, choice)` returns `()`

#### Arguments:

```json
{"proposalId": "Nat", "choice": {"#DEFAULT": "#POSITIVE | #NEGATIVE | #DELEGATED", "#DELEGATED": "Principal"}}
```

### 18. `enterElection(title)` returns `()`

#### Arguments:

```json
{"title": "Text"}
```

### 19. `leaveElection()` returns `()`

### 20. `updateNomineeTitle(title)` returns `()`

#### Arguments:

```json
{"title": "Text"}
```

### 21. `castBallots(principals)` returns `()`

#### Arguments:

```json
{"principals": ["Principal"]}
```

### 22. `withdrawAll()` returns `()`

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

### 3. `getDaysInPeriod()` returns `Count.Sharable`

#### Returns:
```json
"Nat"
```

### 4. `getNominee(nomineePrincipal)` returns `Nominee.Sharable`

#### Arguments:

```json
{"nomineePrincipal": "Principal"}
```

#### Returns:
```json
{"principal": "Principal", "title": "Text", "ballots": ["Nat", "Nat"], "isCustodian": "Bool", "callerBallot": "Nat"}
```

### 5. `getNominees(filter, sort)` returns `Nominees.Sharable`

#### Arguments:

```json
{
  "filter": {"voter": "Principal", "isCustodian": "Bool"},
  "sort": {"by": "#VOTER | #TOKEN", "order": "#ASCENDING | #DESCENDING"}
}
```

#### Returns:
```json
[{"principal": "Principal", "title": "Text", "ballots": ["Nat", "Nat"], "isCustodian": "Bool", "callerBallot": "Nat"}]
```

### 6. `getNomineesPagination(filter, sort, page, limit)` returns `Pagination.Pagination<Nominee.Sharable>`

#### Arguments:

```json
{
  "filter": {"voter": "Principal", "isCustodian": "Bool"},
  "sort": {"by": "#VOTER | #TOKEN", "order": "#ASCENDING | #DESCENDING"},
  "page": "Nat",
  "limit": "Nat"
}
```

#### Returns:
```json
{
  "result": {"principal": "Principal", "title": "Text", "ballots": ["Nat", "Nat"], "isCustodian": "Bool", "callerBallot": "Nat"},
  "is": "Nat",
  "of": "Nat"
}
```

### 7. `getProposal(proposalId)` returns `Proposal.Sharable`

#### Arguments:

```json
{"proposalId": "Nat"}
```

#### Returns:
```json
{
  "id": "Nat",
  "proposer": "Principal",
  "title": "Text",
  "content": "Text",
  "timeline": [
    {
      "status": {
        "#RETRIED": null,
        "#PROPOSED": null,
        "#APPROVED": null,
        "#EXECUTED": null,
        "#FAILED": "Text",
        "#REJECTED": null,
        "#EXPIRED": null
      },
      "date": "Time"
    }
  ],
  "acornReward": "Nat",
  "icpReward": "Nat",
  "votes": [["Principal"], ["Principal"], ["Principal"], ["Principal"]],
  "detachment": {
    "#CODE": {
      "actorsConfigs": [
        [
          "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR",
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
        ]
      ],
      "installation": {
        "commitments": [
          {
            "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN",
            "args": ["Nat8"],
            "moduleHash": "Text"
          }
        ],
        "commitHash": "Text",
        "updateLevel": "#MAJOR | #MINOR | #PATCH",
        "releaseNotes": [{"#ADDED": ["Text"], "#CHANGED": ["Text"], "#REMOVED": ["Text"], "#FIXED": ["Text"], "#SECURITY": ["Text"]}]
      }
    },
    "#FIELD": {"name": "Text", "description": "Text"},
    "#WORKER": null,
    "#CONFIGS": {
      "actorsConfigs": [
        [
          "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR",
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
        ]
      ]
    }
  },
  "callerVote": [{"choice": "#POSITIVE | #NEGATIVE | #DELEGATED"}]
}
```

### 8. `getProposals(filter, sort)` returns `Proposals.Sharable`

#### Arguments:

```json
{
  "filter": {
    "proposer": "Principal",
    "category": "#CODE | #FIELD | #WORKER | #CONFIGS",
    "voter": "Principal",
    "status": "#RETRIED | #PROPOSED | #APPROVED | #EXECUTED | #FAILED | #REJECTED | #EXPIRED"
  },
  "sort": {"by": "#RECENT | #UPDATED | #ACORNREWARD | #ICPREWARD", "order": "#ASCENDING | #DESCENDING"}
}
```

#### Returns:
```json
[
  {
    "id": "Nat",
    "proposer": "Principal",
    "title": "Text",
    "content": "Text",
    "timeline": [
      {
        "status": {
          "#RETRIED": null,
          "#PROPOSED": null,
          "#APPROVED": null,
          "#EXECUTED": null,
          "#FAILED": "Text",
          "#REJECTED": null,
          "#EXPIRED": null
        },
        "date": "Time"
      }
    ],
    "acornReward": "Nat",
    "icpReward": "Nat",
    "votes": [["Principal"], ["Principal"], ["Principal"], ["Principal"]],
    "detachment": {
      "#CODE": {
        "actorsConfigs": [
          [
            "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR",
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
          ]
        ],
        "installation": {
          "commitments": [
            {
              "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN",
              "args": ["Nat8"],
              "moduleHash": "Text"
            }
          ],
          "commitHash": "Text",
          "updateLevel": "#MAJOR | #MINOR | #PATCH",
          "releaseNotes": [{"#ADDED": ["Text"], "#CHANGED": ["Text"], "#REMOVED": ["Text"], "#FIXED": ["Text"], "#SECURITY": ["Text"]}]
        }
      },
      "#FIELD": {"name": "Text", "description": "Text"},
      "#WORKER": null,
      "#CONFIGS": {
        "actorsConfigs": [
          [
            "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR",
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
          ]
        ]
      }
    },
    "callerVote": [{"choice": "#POSITIVE | #NEGATIVE | #DELEGATED"}]
  }
]
```

### 9. `getProposalsPagination(filter, sort, page, limit)` returns `Pagination.Pagination<Proposal.Sharable>`

#### Arguments:

```json
{
  "filter": {
    "proposer": "Principal",
    "category": "#CODE | #FIELD | #WORKER | #CONFIGS",
    "voter": "Principal",
    "status": "#RETRIED | #PROPOSED | #APPROVED | #EXECUTED | #FAILED | #REJECTED | #EXPIRED"
  },
  "sort": {"by": "#RECENT | #UPDATED | #ACORNREWARD | #ICPREWARD", "order": "#ASCENDING | #DESCENDING"},
  "page": "Nat",
  "limit": "Nat"
}
```

#### Returns:
```json
{
  "result": {
    "id": "Nat",
    "proposer": "Principal",
    "title": "Text",
    "content": "Text",
    "timeline": [
      {
        "status": {
          "#RETRIED": null,
          "#PROPOSED": null,
          "#APPROVED": null,
          "#EXECUTED": null,
          "#FAILED": "Text",
          "#REJECTED": null,
          "#EXPIRED": null
        },
        "date": "Time"
      }
    ],
    "acornReward": "Nat",
    "icpReward": "Nat",
    "votes": [["Principal"], ["Principal"], ["Principal"], ["Principal"]],
    "detachment": {
      "#CODE": {
        "actorsConfigs": [
          [
            "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR",
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
          ]
        ],
        "installation": {
          "commitments": [
            {
              "actorVariant": "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR | #ICPUSD | #FRONTEND | #ACORN",
              "args": ["Nat8"],
              "moduleHash": "Text"
            }
          ],
          "commitHash": "Text",
          "updateLevel": "#MAJOR | #MINOR | #PATCH",
          "releaseNotes": [{"#ADDED": ["Text"], "#CHANGED": ["Text"], "#REMOVED": ["Text"], "#FIXED": ["Text"], "#SECURITY": ["Text"]}]
        }
      },
      "#FIELD": {"name": "Text", "description": "Text"},
      "#WORKER": null,
      "#CONFIGS": {
        "actorsConfigs": [
          [
            "#TREASURY | #SPLIT | #AFFILIATE | #ESCROW | #SALES | #AXIOMS | #DAO | #FACADE | #CHAT | #ASSETS | #INDICATOR",
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
          ]
        ]
      }
    },
    "callerVote": [{"choice": "#POSITIVE | #NEGATIVE | #DELEGATED"}]
  },
  "is": "Nat",
  "of": "Nat"
}
```

### 10. `getUser(principal)` returns `User.Sharable`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
{
  "acornEarning": {"revenue": "Nat", "balance": "Nat", "lastWithdrawAt": "Time"},
  "icpEarning": {"revenue": "Nat", "balance": "Nat", "lastWithdrawAt": "Time"},
  "proposals": ["Nat"],
  "referendums": ["Nat"],
  "proposalVotes": [["Nat", [{"choice": "#POSITIVE | #NEGATIVE | #DELEGATED"}]]],
  "referendumVotes": [["Nat", {"choice": "#POSITIVE | #NEUTRAL | #NEGATIVE", "value": "Nat"}]],
  "ballots": [["Principal", "Nat"]],
  "lastUpdateBallot": "Time"
}
```

### 11. `getEarning(principal)` returns `(Earning.Sharable, Earning.Sharable)`

#### Arguments:

```json
{"principal": "Principal"}
```

#### Returns:
```json
[
  {"revenue": "Nat", "balance": "Nat", "lastWithdrawAt": "Time"},
  {"revenue": "Nat", "balance": "Nat", "lastWithdrawAt": "Time"}
]
```

### 12. `expectUserNotFound(principal)` returns `()`

#### Arguments:

```json
{"principal": "Principal"}
```
