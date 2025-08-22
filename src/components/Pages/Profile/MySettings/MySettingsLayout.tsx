import { Principal } from '@dfinity/principal'
import { useEffect, useRef, useState } from 'react'

import DeleteIcon from '@components/Assets/delete.svg'
import FieldIcon from '@components/Assets/field.svg'
import RestoreIcon from '@components/Assets/restore.svg'
import Spinner from '@components/Primitives/Spinner'
import CleanUpCaches from '@components/Shared/CleanUpCaches'
import Divider from '@components/Shared/Divider'
import Link from '@components/Shared/Link'
import Username from '@components/Shared/Username'
import VoteColorPicker from '@components/Shared/VoteColorPicker'
import VoteColorsDemo from '@components/Shared/VoteColorsDemo'
import useAuth from '@hooks/useAuth'
import { deleteAllConfigsCache } from '@hooks/useConfigs'
import { deleteAllNotificationsCache } from '@hooks/useNotification'
import { deleteAllPackagesCache } from '@hooks/usePackages'
import { deleteAllStatusCache } from '@hooks/useStatus'
import { deleteAllTopCache } from '@hooks/useTop'
import { deleteAllUsernamesCache } from '@hooks/useUsername'
import useVoteColors, { VoteColorType, VoteColors } from '@hooks/useVoteColors'
import cn from '@libs/class'
import { promise } from '@libs/toastify'
import { DAxioms } from 'shared/types/services'
import { Axioms, Facade } from 'shared/utils/services'
import { UnwrapVariant, Variant } from 'shared/utils/typings'

enum ELoading {
    Publisher,
    Field,
    RestorePublisher,
    RestoreField,
}

const MySettingsLayout = () => {
    const { agent } = useAuth()
    const voteColors = useVoteColors()
    const [settings, setSettings] = useState<DAxioms.Sharable__1>()
    const [inputField, setInputField] = useState<string>('')
    const [inputFieldId, setInputFieldId] = useState<string>('')
    const [inputPublisher, setInputPublisher] = useState<string>('')
    const [inputPrincipal, setInputPrincipal] = useState<Principal>()
    const [inputUsername, setInputUsername] = useState<string>('')
    const [loading, setLoading] = useState<ELoading>()
    const [fieldDeleteLoading, setFieldDeleteLoading] = useState<string>('')
    const [publisherDeleteLoading, setPublisherDeleteLoading] = useState<string>('')
    const [numCaches, setNumCaches] = useState<number>(0)
    const [trigger, setTrigger] = useState<number>(0)

    // Local preview colors state for settings only
    const [localPreview, setLocalPreview] = useState<VoteColors>(voteColors.colors)
    const voteColorsSectionRef = useRef<HTMLDivElement>(null)

    // Sync local preview when committed colors change externally
    useEffect(() => {
        setLocalPreview(voteColors.colors)
    }, [voteColors.colors])

    // Commit local preview to committed colors on click outside of the vote colors section
    useEffect(() => {
        const isValidHex = (value: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)

        const handlePointerDown = (e: MouseEvent | TouchEvent) => {
            const target = e.target as Node
            if (voteColorsSectionRef.current && !voteColorsSectionRef.current.contains(target)) {
                ;(['positive', 'neutral', 'negative', 'delegated'] as VoteColorType[]).forEach(
                    (type) => {
                        const newColor = localPreview[type]
                        if (isValidHex(newColor) && newColor !== voteColors.colors[type]) {
                            voteColors.updateColor(type, newColor)
                        }
                    }
                )
            }
        }

        document.addEventListener('mousedown', handlePointerDown)
        document.addEventListener('touchstart', handlePointerDown)
        return () => {
            document.removeEventListener('mousedown', handlePointerDown)
            document.removeEventListener('touchstart', handlePointerDown)
        }
    }, [localPreview, voteColors])

    useEffect(() => {
        if (loading || fieldDeleteLoading !== '' || publisherDeleteLoading !== '') return
        Axioms.call(agent).getUserConfigs().then(setSettings)
    }, [agent, loading, fieldDeleteLoading, publisherDeleteLoading])

    useEffect(() => {
        if (inputPublisher) {
            try {
                const principal = Principal.fromText(inputPublisher)
                Facade.call()
                    .getUserIdentifier({ Principal: principal })
                    .then((res) => setInputUsername(res.username))
                    .catch(() => setInputUsername(''))
                setInputPrincipal(principal)
            } catch {
                setInputPrincipal(undefined)
                Facade.call()
                    .getUserIdentifier({ Username: inputPublisher })
                    .then((res) => {
                        setInputUsername(res.username)
                        setInputPrincipal(res.principal)
                    })
                    .catch(() => setInputUsername(''))
            }
        }
    }, [inputPublisher])

    useEffect(() => {
        if (inputField) {
            try {
                Axioms.call()
                    .getField(inputField)
                    .then((res) => setInputFieldId(res.name))
                    .catch(() => setInputFieldId(''))
            } catch {
                setInputFieldId('')
            }
        }
    }, [inputField])

    const addPublisher = async () => {
        if (inputPrincipal) {
            setLoading(ELoading.Publisher)
            await promise(
                Axioms.call(agent)
                    .setUserConfig({ ExcludedPublishers: [...excludedPublishers, inputPrincipal] })
                    .then(() => {
                        setLoading(undefined)
                        setInputPublisher('')
                        setInputPrincipal(undefined)
                        setInputUsername('')
                    }),
                'Blocking Publisher',
                'Added Publisher successfully!'
            )
        }
    }
    const deletePublisher = async (principal: Principal) => {
        setPublisherDeleteLoading(principal.toText())
        await promise(
            Axioms.call(agent)
                .setUserConfig({
                    ExcludedPublishers: excludedPublishers.filter((p) => p !== principal),
                })
                .then(() => setPublisherDeleteLoading('')),
            'Unblocking Publisher',
            'Unblocked Publisher successfully!'
        )
    }
    const restorePublishers = async () => {
        setLoading(ELoading.RestorePublisher)
        await promise(
            Axioms.call(agent)
                .restoreUserConfig(Variant('ExcludedPublishers'))
                .then(() => setLoading(undefined)),
            'Restoring Publishers',
            'Restored Publishers successfully!'
        )
    }
    const addField = async () => {
        if (inputFieldId) {
            setLoading(ELoading.Field)
            await promise(
                Axioms.call(agent)
                    .setUserConfig({ ExcludedFields: [...excludedFields, inputFieldId] })
                    .then(() => {
                        setLoading(undefined)
                        setInputField('')
                        setInputFieldId('')
                    }),
                'Blocking Field',
                'Added Field successfully!'
            )
        }
    }
    const deleteField = async (field: string) => {
        setFieldDeleteLoading(field)
        await promise(
            Axioms.call(agent)
                .setUserConfig({
                    ExcludedFields: excludedFields.filter((f) => f !== field),
                })
                .then(() => setFieldDeleteLoading('')),
            'Unblocking Field',
            'Unblocked Field successfully!'
        )
    }
    const restoreFields = async () => {
        setLoading(ELoading.RestoreField)
        await promise(
            Axioms.call(agent)
                .restoreUserConfig(Variant('ExcludedFields'))
                .then(() => setLoading(undefined)),
            'Restoring Fields',
            'Restored Fields successfully!'
        )
    }

    if (!settings) return null

    const excludedPublishers = settings.find(
        (e) => UnwrapVariant(e)[0] === 'ExcludedPublishers'
    )!.ExcludedPublishers
    const excludedFields = settings.find(
        (e) => UnwrapVariant(e)[0] === 'ExcludedFields'
    )!.ExcludedFields

    return (
        <div className="gap-medium flex w-full flex-col text-cold-700">
            {/* Vote Colors Customization Section */}
            <div className="flex items-center justify-between">
                <p className="text-normal py-small font-medium text-primary-700">Vote Colors</p>
                <button
                    className="text-small px-medium py-small gap-small flex flex-nowrap items-center rounded-lg bg-cold-700 bg-opacity-0 font-medium hover:bg-opacity-25 disabled:pointer-events-none"
                    disabled={!voteColors.isCustomized}
                    onClick={voteColors.restoreDefaults}
                >
                    <RestoreIcon className="h-3.5 w-3.5 stroke-[2px] md:h-4 md:w-4" />
                    restore default
                </button>
            </div>
            <p className="text-tiny text-center italic text-cold-700">
                Customize the colors for vote buttons and charts (click/tap on the color to open the
                color picker). Changes apply to all vote displays including <b>proposals</b>,{' '}
                <b>hypotheses</b>, and <b>evidences</b>
            </p>

            <div
                ref={voteColorsSectionRef}
                className="gap-normal grid w-full grid-cols-1 md:grid-cols-2"
            >
                <VoteColorPicker
                    label="Positive (Accept/True/Up)"
                    type="positive"
                    color={localPreview.positive}
                    isCustomized={voteColors.isColorCustomized('positive')}
                    onColorChange={(type, value) =>
                        setLocalPreview((prev) => ({ ...prev, [type]: value }))
                    }
                    onPreviewChange={(type, value) =>
                        setLocalPreview((prev) => ({ ...prev, [type]: value }))
                    }
                    onRestore={voteColors.restoreColor}
                />
                <VoteColorPicker
                    label="Negative (Reject/False/Down)"
                    type="negative"
                    color={localPreview.negative}
                    isCustomized={voteColors.isColorCustomized('negative')}
                    onColorChange={(type, value) =>
                        setLocalPreview((prev) => ({ ...prev, [type]: value }))
                    }
                    onPreviewChange={(type, value) =>
                        setLocalPreview((prev) => ({ ...prev, [type]: value }))
                    }
                    onRestore={voteColors.restoreColor}
                />
                <VoteColorPicker
                    label="Neutral (Don't Know)"
                    type="neutral"
                    color={localPreview.neutral}
                    isCustomized={voteColors.isColorCustomized('neutral')}
                    onColorChange={(type, value) =>
                        setLocalPreview((prev) => ({ ...prev, [type]: value }))
                    }
                    onPreviewChange={(type, value) =>
                        setLocalPreview((prev) => ({ ...prev, [type]: value }))
                    }
                    onRestore={voteColors.restoreColor}
                />
                <VoteColorPicker
                    label="Delegated"
                    type="delegated"
                    color={localPreview.delegated}
                    isCustomized={voteColors.isColorCustomized('delegated')}
                    onColorChange={(type, value) =>
                        setLocalPreview((prev) => ({ ...prev, [type]: value }))
                    }
                    onPreviewChange={(type, value) =>
                        setLocalPreview((prev) => ({ ...prev, [type]: value }))
                    }
                    onRestore={voteColors.restoreColor}
                />
            </div>

            <VoteColorsDemo colors={localPreview} />

            <Divider
                className="!py-medium mx-auto w-4/5"
                direction="horizontal"
                bgColor="bg-cold-800"
                borderColor="border-cold-800"
            />
            <div className="flex items-center justify-between">
                <p className="text-normal py-small font-medium text-primary-700">
                    Caches ({numCaches})
                </p>
                <button
                    className="text-small px-medium py-small gap-small flex flex-nowrap items-center rounded-lg bg-cold-700 bg-opacity-0 font-medium hover:bg-opacity-25 disabled:pointer-events-none"
                    disabled={numCaches === 0}
                    onClick={() => {
                        deleteAllConfigsCache()
                        deleteAllPackagesCache()
                        deleteAllStatusCache()
                        deleteAllUsernamesCache()
                        deleteAllNotificationsCache()
                        deleteAllTopCache()
                        setTrigger((prev) => prev + 1)
                    }}
                >
                    <RestoreIcon className="h-3.5 w-3.5 stroke-[2px] md:h-4 md:w-4" />
                    restore default
                </button>
            </div>
            <p className="text-tiny text-center italic text-cold-700">
                All caches are automatically refreshed every day at 00:00 UTC, except{' '}
                <b>Axiom Usernames</b> (5 days) and <b>Axiom Notifications</b> (permanent)
            </p>
            <CleanUpCaches setTotal={setNumCaches} key={trigger} />
            <Divider
                className="!py-medium mx-auto w-4/5"
                direction="horizontal"
                bgColor="bg-cold-800"
                borderColor="border-cold-800"
            />
            <div className="flex items-center justify-between">
                <p className="text-normal py-small font-medium text-primary-700">
                    Blocked Publishers ({excludedPublishers.length})
                </p>
                <button
                    className="text-small px-medium py-small gap-small flex flex-nowrap items-center rounded-lg bg-cold-700 bg-opacity-0 font-medium hover:bg-opacity-25 disabled:pointer-events-none"
                    disabled={
                        excludedPublishers.length === 0 || loading === ELoading.RestorePublisher
                    }
                    onClick={restorePublishers}
                >
                    {loading === ELoading.RestorePublisher ? (
                        <Spinner color="white" className="h-4 w-4 md:h-5 md:w-5" />
                    ) : (
                        <>
                            <RestoreIcon className="h-3.5 w-3.5 stroke-[2px] md:h-4 md:w-4" />
                            restore default
                        </>
                    )}
                </button>
            </div>
            <p className="text-tiny text-center italic text-cold-700">
                Block hypotheses and evidences from specific publishers at everywhere, except{' '}
                <b>its own urls</b> such as <code>/feed/123</code> or{' '}
                <code>/feed/evidences/456</code> or <code>/feed/123/evidences/456</code>
            </p>
            <div className="gap-normal flex w-full flex-col">
                {excludedPublishers.map((e) => (
                    <div className="flex items-center justify-between">
                        <Username
                            principal={e}
                            symbol
                            symbolClassName="stroke-[3px]"
                            linkClassName="pre-underline group z-10 w-full justify-start !text-small text-cold-700 decoration-cold-700/50 hover:decoration-cold-700/100"
                        />
                        <button
                            className="text-small px-medium py-small gap-small flex flex-nowrap items-center rounded-lg bg-cold-700 bg-opacity-0 font-medium hover:bg-opacity-25 disabled:pointer-events-none"
                            onClick={() => deletePublisher(e)}
                            disabled={
                                publisherDeleteLoading !== '' || loading === ELoading.Publisher
                            }
                        >
                            {publisherDeleteLoading === e.toText() ? (
                                <Spinner color="white" className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            ) : (
                                <DeleteIcon className="h-3.5 w-3.5 stroke-[2px] text-primary-700 md:h-4 md:w-4" />
                            )}
                        </button>
                    </div>
                ))}
                <div className="gap-normal grid w-full grid-cols-3 md:grid-cols-5">
                    <input
                        type="text"
                        placeholder="Input publisher's principal/username"
                        value={inputUsername ? inputUsername : inputPublisher}
                        onChange={(e) => setInputPublisher(e.target.value.toLowerCase())}
                        className={cn(
                            'input col-span-2 md:col-span-4',
                            inputPublisher === ''
                                ? 'border-cold-400 focus:ring-cold-600'
                                : inputPrincipal
                                  ? 'border-green-400 focus:ring-green-600'
                                  : 'border-red-400 focus:ring-red-600'
                        )}
                    />
                    <div className="gap-small flex w-full flex-col">
                        <button
                            className="button w-auto"
                            onClick={addPublisher}
                            disabled={
                                !inputPrincipal ||
                                loading === ELoading.Publisher ||
                                publisherDeleteLoading !== ''
                            }
                        >
                            {loading === ELoading.Publisher ? (
                                <Spinner color="white" className="h-4 w-4 md:h-5 md:w-5" />
                            ) : (
                                <span className="gap-small flex">Add Publisher</span>
                            )}
                        </button>
                    </div>
                    {inputPublisher !== '' && !inputPrincipal && (
                        <div className="text-tiny col-span-3 flex w-full flex-col text-left md:col-span-5">
                            {!inputPrincipal && (
                                <span className="text-red-600">Invalid principal/username</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Divider
                className="!py-medium mx-auto w-4/5"
                direction="horizontal"
                bgColor="bg-cold-800"
                borderColor="border-cold-800"
            />
            <div className="flex items-center justify-between">
                <p className="text-normal py-small font-medium text-primary-700">
                    Blocked Fields ({excludedFields.length})
                </p>
                <button
                    className="text-small px-medium py-small gap-small flex flex-nowrap items-center rounded-lg bg-cold-700 bg-opacity-0 font-medium hover:bg-opacity-25 disabled:pointer-events-none"
                    disabled={excludedFields.length === 0 || loading === ELoading.RestoreField}
                    onClick={restoreFields}
                >
                    {loading === ELoading.RestoreField ? (
                        <Spinner color="white" className="h-4 w-4 md:h-5 md:w-5" />
                    ) : (
                        <>
                            <RestoreIcon className="h-3.5 w-3.5 stroke-[2px] md:h-4 md:w-4" />
                            restore default
                        </>
                    )}
                </button>
            </div>
            <p className="text-tiny text-center italic text-cold-700">
                Block hypotheses from specific fields at everywhere, except <b>its own urls</b> such
                as <code>/feed/123</code>
            </p>
            <div className="gap-normal flex w-full flex-col">
                {excludedFields.map((e) => (
                    <div className="flex items-center justify-between">
                        <Link
                            href={`/feed/fields/${e}`}
                            openInNewTab
                            className="gap-small !text-small pre-underline group z-10 flex w-full items-center justify-start text-cold-700 decoration-cold-700/50 hover:decoration-cold-700/100"
                        >
                            <FieldIcon className="mr-1 inline-block h-3.5 w-3.5 shrink-0 stroke-2 text-inherit md:h-4 md:w-4" />
                            <p className="flex-nowrap place-items-center gap-1 text-nowrap">{e}</p>
                        </Link>
                        <button
                            className="text-small px-medium py-small gap-small flex flex-nowrap items-center rounded-lg bg-cold-700 bg-opacity-0 font-medium hover:bg-opacity-25 disabled:pointer-events-none"
                            onClick={() => deleteField(e)}
                            disabled={fieldDeleteLoading !== '' || loading === ELoading.Field}
                        >
                            {fieldDeleteLoading === e ? (
                                <Spinner color="white" className="h-3.5 w-3.5 md:h-4 md:w-4" />
                            ) : (
                                <DeleteIcon className="h-3.5 w-3.5 stroke-[2px] text-primary-700 md:h-4 md:w-4" />
                            )}
                        </button>
                    </div>
                ))}
                <div className="gap-normal grid w-full grid-cols-3 md:grid-cols-5">
                    <input
                        type="text"
                        placeholder="Input field's name"
                        value={inputField ? inputField : inputFieldId}
                        onChange={(e) => setInputField(e.target.value)}
                        className={cn(
                            'input col-span-2 md:col-span-4',
                            inputField === ''
                                ? 'border-cold-400 focus:ring-cold-600'
                                : inputFieldId
                                  ? 'border-green-400 focus:ring-green-600'
                                  : 'border-red-400 focus:ring-red-600'
                        )}
                    />
                    <div className="gap-small flex w-full flex-col">
                        <button
                            className="button w-auto"
                            onClick={addField}
                            disabled={
                                !inputFieldId ||
                                loading === ELoading.Field ||
                                fieldDeleteLoading !== ''
                            }
                        >
                            {loading === ELoading.Field ? (
                                <Spinner color="white" className="h-4 w-4 md:h-5 md:w-5" />
                            ) : (
                                <span className="gap-small flex">Add Field</span>
                            )}
                        </button>
                    </div>
                    {inputField !== '' && !inputFieldId && (
                        <div className="text-tiny col-span-3 flex w-full flex-col text-left md:col-span-5">
                            {!inputFieldId && (
                                <span className="text-red-600">Invalid field's name</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MySettingsLayout
