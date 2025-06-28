'use client'

import { createRef, memo, useCallback, useEffect, useRef, useState } from 'react'

import AcornIcon from '@components/Assets/acorn.svg'
import CloseIcon from '@components/Assets/close.svg'
import Spinner from '@components/Primitives/Spinner'
import BalanceChanges from '@components/Shared/BalanceChanges'
import useAuth from '@hooks/useAuth'
import useConfigs from '@hooks/useConfigs'
import cn from '@libs/class'
import { promise } from '@libs/toastify'
import { DAxioms } from 'shared/types/services'
import { ACORN, Facade, Treasury } from 'shared/utils/services'
import { valueOf } from 'shared/utils/tokens'

const EditLink = memo(
    ({
        onUpdate,
        onDelete,
        validRef,
        link,
    }: {
        onUpdate: (link: DAxioms.Hyperlink) => void
        onDelete: () => void
        validRef: React.MutableRefObject<boolean>
        link: DAxioms.Hyperlink
    }) => {
        const configs = useConfigs('Facade')

        const isAnchorTooShort =
            link.anchorText.length < (configs?.['MIN_ANCHOR_LENGTH'][1] as bigint)
        const isAnchorTooLong =
            link.anchorText.length > (configs?.['MAX_ANCHOR_LENGTH'][1] as bigint)
        const isUrlTooShort = link.url.length < (configs?.['MIN_URL_LENGTH'][1] as bigint)
        const isUrlTooLong = link.url.length > (configs?.['MAX_URL_LENGTH'][1] as bigint)

        useEffect(() => {
            validRef.current =
                !isAnchorTooShort && !isAnchorTooLong && !isUrlTooShort && !isUrlTooLong
        }, [link, configs, validRef])

        return (
            <div className="gap-semilarge flex w-full flex-col items-center">
                <div className="gap-small flex w-full">
                    <input
                        type="text"
                        placeholder="Anchor Text"
                        value={link?.anchorText}
                        onChange={(e) => onUpdate({ ...link, anchorText: e.target.value })}
                        className={cn(
                            'input',
                            link.anchorText.length === 0 && link.url.length === 8
                                ? 'border-cold-400 focus:ring-cold-600'
                                : !isAnchorTooShort && !isAnchorTooLong
                                  ? 'border-green-400 focus:ring-green-600'
                                  : 'border-red-400 focus:ring-red-600'
                        )}
                    />
                    <div className="flex w-full">
                        <span className="px-small text-tiny flex items-center justify-center rounded-l-md border border-r-0 border-cold-400 bg-cold-100">
                            https://
                        </span>
                        <input
                            type="text"
                            placeholder="URL"
                            value={link?.url.replace('https://', '')}
                            onChange={(e) =>
                                onUpdate({ ...link, url: `https://${e.target.value}` })
                            }
                            className={cn(
                                'input rounded-l-none rounded-r-md',
                                link.url.length === 8 && link.anchorText.length === 0
                                    ? 'border-cold-400 focus:ring-cold-600'
                                    : !isUrlTooShort && !isUrlTooLong
                                      ? 'border-green-400 focus:ring-green-600'
                                      : 'border-red-400 focus:ring-red-600'
                            )}
                        />
                    </div>
                    <button
                        onClick={onDelete}
                        className="my-auto flex h-7 w-14 rounded-md bg-red-500 text-white hover:bg-red-600 md:h-8 md:w-16"
                    >
                        <CloseIcon className="m-auto h-3.5 w-3.5 stroke-1 md:h-4 md:w-4 md:stroke-2" />
                    </button>
                </div>
            </div>
        )
    }
)

const UpdateLinks = ({ onSubmit, links }: { onSubmit: () => void; links: DAxioms.Hyperlink[] }) => {
    const { agent } = useAuth()
    const configs = useConfigs('Facade')

    const [newHyperlinks, setNewHyperlinks] = useState<DAxioms.Hyperlink[]>(links)
    const [loading, setLoading] = useState<boolean>(false)
    const [isSufficient, setIsSufficient] = useState(true)

    const validRefs = useRef<React.MutableRefObject<boolean>[]>([])

    const initializeValidRefs = useCallback(
        (links: DAxioms.Hyperlink[]) => {
            ;(validRefs as any).current = links.map(() => createRef<boolean>())
            validRefs.current.forEach((ref, index) => {
                const link = links[index]
                if (link) {
                    const isAnchorTooShort =
                        link.anchorText.length < (configs?.['MIN_ANCHOR_LENGTH'][1] as bigint)
                    const isAnchorTooLong =
                        link.anchorText.length > (configs?.['MAX_ANCHOR_LENGTH'][1] as bigint)
                    const isUrlTooShort =
                        link.url.length < (configs?.['MIN_URL_LENGTH'][1] as bigint)
                    const isUrlTooLong =
                        link.url.length > (configs?.['MAX_URL_LENGTH'][1] as bigint)
                    ref.current =
                        !isAnchorTooShort && !isAnchorTooLong && !isUrlTooShort && !isUrlTooLong
                }
            })
        },
        [configs]
    )

    useEffect(() => {
        initializeValidRefs(newHyperlinks)
    }, [newHyperlinks, configs, initializeValidRefs])

    const update = useCallback(async () => {
        setLoading(true)
        const approve = await promise(
            ACORN.call(agent).icrc2_approve({
                amount: configs?.['UPDATE_HYPERLINKS_FEE'][1] as bigint,
                spender: { owner: Treasury.principal, subaccount: [] },
                fee: [],
                from_subaccount: [],
                memo: [],
                created_at_time: [],
                expected_allowance: [],
                expires_at: [],
            }),
            'Approving ACORN to Axiom Treasury',
            'Approved ACORN to Axiom Treasury successfully!'
        )
        if (!approve.success) {
            setLoading(false)
            return
        }
        const res = await promise(
            Facade.call(agent).editLinks(
                newHyperlinks.filter((link) => link.anchorText !== '' && link.url !== '')
            ),
            'Updating hyperlinks',
            'Hyperlinks updated successfully!'
        )
        setLoading(false)
        if (res.success) onSubmit()
    }, [
        ACORN,
        Facade,
        Treasury,
        configs?.['UPDATE_HYPERLINKS_FEE'][1] as bigint,
        newHyperlinks,
        onSubmit,
    ])
    const handleUpdate = useCallback((index: number, updatedLink: DAxioms.Hyperlink) => {
        setNewHyperlinks((prev) => {
            const newLinks = [...prev]
            newLinks[index] = updatedLink
            return newLinks
        })
    }, [])
    const handleDelete = useCallback((index: number) => {
        setNewHyperlinks((prev) => prev.filter((_, i) => i !== index))
        validRefs.current = validRefs.current.filter((_, i) => i !== index)
    }, [])
    const handleAddLink = useCallback(() => {
        setNewHyperlinks((prev) => [...prev, { anchorText: '', url: 'https://' }])
        const newRef = createRef<boolean>()
        validRefs.current.push(newRef as any)
    }, [])

    const isFormValid = validRefs.current.every((ref) => ref.current)

    return (
        <div className="gap-semilarge flex w-full flex-col items-center">
            <ol className="w-full">
                {newHyperlinks.map((link, index) => (
                    <li key={index} className="mb-4">
                        <EditLink
                            link={link}
                            onUpdate={(updatedLink) => handleUpdate(index, updatedLink)}
                            onDelete={() => handleDelete(index)}
                            validRef={validRefs.current[index] || createRef<boolean>()}
                        />
                    </li>
                ))}
                {Number(configs?.['MAX_HYPERLINKS'][1] as bigint) > newHyperlinks.length && (
                    <button
                        className="p-small text-small mx-auto flex w-full items-center justify-center rounded-md border-2 border-dashed border-cold-300 hover:border-cold-600 md:w-1/3"
                        onClick={handleAddLink}
                    >
                        Add Link ({newHyperlinks.length}/
                        {Number(configs?.['MAX_HYPERLINKS'][1] as bigint)})
                    </button>
                )}
            </ol>
            <BalanceChanges
                amount={configs?.['UPDATE_HYPERLINKS_FEE'][1] as bigint}
                setIsSufficient={setIsSufficient}
            />
            <div className="flex w-full justify-center">
                <button
                    className="button w-auto min-w-36 md:min-w-48"
                    onClick={update}
                    disabled={loading || !isFormValid || !isSufficient}
                >
                    {loading ? (
                        <Spinner color="white" className="h-4 w-4 md:h-5 md:w-5" />
                    ) : !isSufficient ? (
                        <span>Insufficient ACORN balance</span>
                    ) : (
                        <>
                            Update with {valueOf(configs?.['UPDATE_HYPERLINKS_FEE'][1] as bigint)}{' '}
                            <AcornIcon className="h-4 w-4 stroke-[1.5px] md:h-5 md:w-5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

export default UpdateLinks
