import { Principal } from '@dfinity/principal'
import { useEffect, useState } from 'react'

import FieldIcon from '@components/Assets/field.svg'
import RestoreIcon from '@components/Assets/restore.svg'
import Spinner from '@components/Primitives/Spinner'
import Divider from '@components/Shared/Divider'
import Link from '@components/Shared/Link'
import Username from '@components/Shared/Username'
import useAuth from '@hooks/useAuth'
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
    const [settings, setSettings] = useState<DAxioms.Sharable__1>()
    const [inputField, setInputField] = useState<string>('')
    const [inputFieldId, setInputFieldId] = useState<string>('')
    const [inputPublisher, setInputPublisher] = useState<string>('')
    const [inputPrincipal, setInputPrincipal] = useState<Principal>()
    const [inputUsername, setInputUsername] = useState<string>('')
    const [loading, setLoading] = useState<ELoading>()

    useEffect(() => {
        if (loading) return
        Axioms.call(agent).getUserConfigs().then(setSettings)
    }, [agent, loading])

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
        <div className="gap-semilarge flex w-full flex-col text-cold-700">
            <div className="flex items-center justify-between">
                <p className="text-normal py-small font-medium text-primary-700">
                    Blocked Publishers ({excludedPublishers.length})
                </p>
                <button
                    className="text-small px-medium py-small gap-small flex flex-nowrap items-center rounded-lg bg-cold-700 bg-opacity-0 font-medium hover:bg-opacity-25 disabled:pointer-events-none"
                    disabled={loading === ELoading.RestorePublisher}
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
            <div className="gap-semilarge flex w-full flex-col">
                {excludedPublishers.map((e) => (
                    <Username
                        principal={e}
                        symbol
                        symbolClassName="stroke-[3px]"
                        linkClassName="pre-underline group z-10 w-full justify-start text-cold-700 decoration-cold-700/50 hover:decoration-cold-700/100"
                    />
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
                            disabled={!inputPrincipal || loading === ELoading.Publisher}
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
                    disabled={loading === ELoading.RestoreField}
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
            <div className="gap-semilarge flex w-full flex-col">
                {excludedFields.map((e) => (
                    <Link
                        href={`/feed/fields/${e}`}
                        openInNewTab
                        className="gap-small pre-underline group z-10 flex w-full items-center justify-start text-cold-700 decoration-cold-700/50 hover:decoration-cold-700/100"
                    >
                        <FieldIcon className="mr-1 inline-block h-3.5 w-3.5 shrink-0 stroke-2 text-inherit md:h-4 md:w-4" />
                        <p className="flex-nowrap place-items-center gap-1 text-nowrap">{e}</p>
                    </Link>
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
                            disabled={!inputFieldId || loading === ELoading.Field}
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
