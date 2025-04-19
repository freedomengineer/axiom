import { useEffect, useState } from 'react'

import { promise } from '@libs/toastify'
import { DAxioms } from 'shared/types/services'
import { Axioms } from 'shared/utils/services'
import { Unwrap, UnwrapVariant } from 'shared/utils/typings'

import useAuth from './useAuth'
import { refreshSpecificUserData } from './useUserData'

const useFieldDetails = (item: DAxioms.SharableField) => {
    const { agent, principal } = useAuth()

    const [localItem, setLocalItem] = useState<DAxioms.SharableField>(item)
    const [loading, setLoading] = useState<boolean>(false)

    useEffect(() => {
        setLocalItem(item)
    }, [item])

    const handleRefresh = async () => {
        await Axioms.call(agent).getField(localItem.name).then(setLocalItem)
    }

    const role = UnwrapVariant(Unwrap(localItem.callerRole))

    const handleSubscribe = async () => {
        setLoading(true)
        if (role === 'Member') {
            await promise(
                Axioms.call(agent).leaveField(localItem.name),
                'Unsubscribing to field ' + localItem.name,
                'Unsubscribed to field ' + localItem.name + '!'
            )
        } else {
            await promise(
                Axioms.call(agent).joinField(localItem.name),
                'Subscribing to field ' + localItem.name,
                'Subscribed to field ' + localItem.name + '!'
            )
        }
        await handleRefresh()
        refreshSpecificUserData(principal ?? null, 'fields')
        setLoading(false)
    }

    return {
        localItem,
        role,
        loading,
        handleSubscribe,
    }
}

export default useFieldDetails
