import { toast } from 'react-toastify'

import { parseCanister } from './formatter'

const onError = (data: any): string => {
    console.log(data)
    let canisterId = ''
    let message = ''
    let reason = ''

    try {
        canisterId = data.message.match(/Error from Canister ([\w-]+):/)?.[1]
    } catch {}
    try {
        message = data.message.match(/ic0.trap` with message: ([^.]+)/)?.[1]
    } catch {
        message = 'Unknown error'
    }
    try {
        reason = data.message.match(/Reason: ([^.]+)/)?.[1]
    } catch {}

    return (
        (canisterId ? `Canister ${parseCanister(canisterId)}: ` : '') + (reason ? reason : message)
    )
}

export const promise = async <T>(
    promise: Promise<T>,
    loadingText?: string,
    successText?: string,
    onSuccess?: (data: T) => string
): Promise<{ success: true; result: T } | { success: false }> => {
    toast.promise(
        promise,
        {
            pending: `${loadingText ?? 'Loading'}...`,
            success: {
                render: ({ data }) => `${successText ?? 'Success!'} ${onSuccess?.(data) ?? ''}`,
            },
            error: {
                render: ({ data }) => {
                    return onError(data)
                },
            },
        },
        {
            position: 'top-right',
            autoClose: 3000,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
        }
    )
    try {
        const result = await promise
        return { success: true, result }
    } catch {
        return { success: false }
    }
}

export const success = (text: string): void => {
    toast.success(text, {
        position: 'top-right',
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    })
}

export const error = (error: any): void => {
    toast.error(onError(error), {
        position: 'top-right',
        autoClose: 3000,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    })
}
