import ReleaseNotes from '@components/Shared/ReleaseNotes'
import { DDAO, DIndicator } from 'shared/types/services'
import { UnwrapDVariant } from 'shared/utils/typings'

import ConfigsDetachment from './ConfigsDetachment'
import ModulesDetachment from './ModulesDetachment'

const CodeDetachment = ({
    detachment,
    showOldValue,
}: {
    detachment: DDAO.SharableCode
    showOldValue?: boolean
    onClick?: (actorVariant: UnwrapDVariant<DIndicator.ConfigurableActorVariant>) => void
}) => {
    return (
        <>
            <ConfigsDetachment detachment={detachment} showOldValue={showOldValue} />
            <ModulesDetachment
                commitments={detachment.installation.commitments}
                showOldValue={showOldValue}
            />
            <ReleaseNotes releaseNotes={detachment.installation.releaseNotes} onClick={() => {}} />
        </>
    )
}

export default CodeDetachment
