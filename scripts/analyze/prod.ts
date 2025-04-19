import { ActorAnalyzer } from './analyzer/actor_analyzer'
import { InternalCanisterName } from '../../backend/test/common/declarations'

const CANISTERS_TO_ANALYZE: InternalCanisterName[] = [
    'dao',
    'facade',
    'treasury',
    'split',
    'affiliate',
    'escrow',
    'sales',
    'axioms',
    'indicator',
]
for (const canisterName of CANISTERS_TO_ANALYZE) {
    console.log(`Analyzing canister ${canisterName}`)
    const actorAnalyzer: ActorAnalyzer = new ActorAnalyzer('prod', canisterName)
    actorAnalyzer.generateInterface()
    actorAnalyzer.generateAnalyzed()
    actorAnalyzer.generateApis()
}
