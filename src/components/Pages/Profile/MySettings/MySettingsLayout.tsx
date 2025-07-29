import { useEffect, useState } from 'react'

import useAuth from '@hooks/useAuth'
import { DAxioms } from 'shared/types/services'
import { Axioms } from 'shared/utils/services'

const MySettingsLayout = () => {
    const { agent } = useAuth()
    const [settings, setSettings] = useState<DAxioms.SharableUserConfigs>()

    useEffect(() => {}, [agent])

    return <div>MySettingsLayout</div>
}

export default MySettingsLayout
