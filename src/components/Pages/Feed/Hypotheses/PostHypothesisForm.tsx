'use client'

import { useState } from 'react'

import CloseIcon from '@components/Assets/close.svg'
import SearchableSelect from '@components/Primitives/SearchableSelect'
import { LongHypothesis, NoFieldsSubscribed } from '@components/Shared/Alerts'
import Divider from '@components/Shared/Divider'
import useAuth from '@hooks/useAuth'
import useConfigs from '@hooks/useConfigs'
import { useSpecificUserData } from '@hooks/useUserData'
import cn from '@libs/class'

import FieldInline from '../Fields/FieldInline'

const PostHypothesisForm = ({
    field,
    content,
    setField,
    setContent,
    onForward,
}: {
    field: string | undefined
    content: string
    setField: (field: string | undefined) => void
    setContent: (content: string) => void
    onForward: () => void
}) => {
    const configs = useConfigs('Axioms')

    const { principal } = useAuth()
    const fields = useSpecificUserData(principal ?? null, 'fields')
    const [pattern, setPattern] = useState<string>('')
    const [longHypothesisWarning, setLongHypothesisWarning] = useState<boolean>(false)

    const activeFields = !fields
        ? []
        : pattern
          ? fields.filter((field) => field.name.toLowerCase().includes(pattern.toLowerCase()))
          : fields

    const validLength = content.length <= configs?.['MAX_HYPOTHESIS_LENGTH'][1]

    return (
        <div className="gap-normal flex w-full flex-col place-items-center items-center text-cold-800">
            {longHypothesisWarning && (
                <LongHypothesis
                    onClose={() => setLongHypothesisWarning(false)}
                    onConfirm={() => onForward()}
                />
            )}
            <div className="gap-normal flex w-full flex-col justify-center">
                <p className="text-medium text-center font-light">
                    Which field would your hypothesis be posted in?
                </p>
                <div className="gap-normal hidden w-full grid-cols-3 md:grid">
                    {!field && (
                        <div className="relative col-span-1 flex">
                            <input
                                type="text"
                                className="input"
                                placeholder="Search"
                                aria-selected={!!pattern}
                                value={field ?? pattern}
                                onChange={(e) => setPattern(e.target.value)}
                            />
                        </div>
                    )}
                    <div
                        className={cn(
                            'gap-small flex !h-[38px] place-items-center items-center overflow-x-auto overflow-y-hidden',
                            field ? 'col-span-3' : 'col-span-2'
                        )}
                    >
                        {field ? (
                            <div className="gap-normal mx-auto flex h-full items-center">
                                <button
                                    className="px-normal h-full rounded-lg border border-primary-600"
                                    onClick={() => setField(undefined)}
                                >
                                    <div className="pointer-events-none my-auto">
                                        <FieldInline
                                            item={fields.find((e) => e.name === field)!}
                                            className="text-primary-800"
                                        />
                                    </div>
                                </button>
                                <button
                                    className="px-normal py-tiny h-full w-7 rounded-lg border border-cold-800/75 text-cold-800/75 hover:border-cold-800/100 hover:text-cold-800/100 md:h-9 md:w-9"
                                    onClick={() => setField(undefined)}
                                >
                                    <CloseIcon className="h-full w-full stroke-[1.5px]" />
                                </button>
                            </div>
                        ) : fields !== null && fields.length === 0 ? (
                            <NoFieldsSubscribed />
                        ) : (
                            activeFields.map((item, i) => (
                                <button
                                    className={
                                        'px-normal h-full rounded-lg border border-cold-800/50 hover:border-cold-800/80'
                                    }
                                    onClick={() => setField(item.name)}
                                    key={i}
                                >
                                    <div className="pointer-events-none my-auto">
                                        <FieldInline item={item} className="text-cold-800" />
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
                <div className="block md:hidden">
                    <SearchableSelect
                        options={(fields ?? []).map((field) => ({ label: field.name }))}
                        value={field}
                        onChange={(value) => setField(value)}
                        placeholder={
                            fields?.length === 0 ? 'No fields available' : 'Select a field'
                        }
                        disabled={fields?.length === 0}
                        customizable={false}
                    />
                </div>
            </div>
            <Divider
                className="!py-medium mx-auto w-4/5"
                direction="horizontal"
                bgColor="bg-cold-800"
                borderColor="border-cold-800"
            />
            <div className="gap-normal flex w-full flex-col justify-center">
                <p className="text-medium text-center font-light">Fill in the hypothesis</p>
                <textarea
                    placeholder="Content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="input h-32"
                />
                <p
                    className={cn(
                        '!text-tiny',
                        content.length > 300 && 'text-yellow-800',
                        !validLength && 'text-red-700'
                    )}
                >
                    {content.length} / {configs?.['MAX_HYPOTHESIS_LENGTH'][1].toString()}
                </p>
            </div>
            <Divider
                className="!py-medium mx-auto w-4/5"
                direction="horizontal"
                bgColor="bg-cold-800"
                borderColor="border-cold-800"
            />
            <button
                className="button w-auto min-w-36 bg-cold-700 hover:bg-cold-800 md:min-w-48"
                onClick={() => {
                    if (content.length > 300) setLongHypothesisWarning(true)
                    else onForward()
                }}
                disabled={!content || !field || !validLength}
            >
                {!field
                    ? 'Select a field'
                    : !content
                      ? 'Write something'
                      : !validLength
                        ? 'Hypothesis too long'
                        : 'Preview your Hypothesis'}
            </button>
        </div>
    )
}

export default PostHypothesisForm
