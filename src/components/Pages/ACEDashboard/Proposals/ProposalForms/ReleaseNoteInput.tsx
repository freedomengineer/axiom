import { ChangeEvent, FormEvent, useState } from 'react'

import ReleaseNotes from '@components/Shared/ReleaseNotes'
import { DDAO } from 'shared/types/services'

const ReleaseNotesInput = ({
    releaseNotes,
    setReleaseNotes,
}: {
    releaseNotes: DDAO.ReleaseNotes
    setReleaseNotes: (releaseNotes: DDAO.ReleaseNotes) => void
}) => {
    const [currentInput, setCurrentInput] = useState<{ type: string; value: string } | null>(null)

    const handleAddNote = (type: string) => {
        setCurrentInput({ type, value: '' })
    }
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setCurrentInput((prev) => (prev ? { ...prev, value: e.target.value } : null))
    }
    const handleSubmitNote = (e: FormEvent) => {
        e.preventDefault()
        if (currentInput && currentInput.value.trim()) {
            const newNote = currentInput.value.trim()
            const type = currentInput.type
            const existingChangeIndex = releaseNotes?.findIndex(
                (change) => Object.keys(change)[0] === type
            )
            if (existingChangeIndex !== -1) {
                const updatedNotes = [...(releaseNotes || [])]
                const currentChange = updatedNotes[existingChangeIndex]
                const changeKey = Object.keys(currentChange)[0] as keyof DDAO.Changes
                updatedNotes[existingChangeIndex] = {
                    ...currentChange,
                    [changeKey]: [...(currentChange[changeKey] as string[]), newNote],
                }
                setReleaseNotes(updatedNotes)
            } else {
                const newChange: DDAO.Changes = { [type]: [newNote] } as DDAO.Changes
                setReleaseNotes([...(releaseNotes || []), newChange])
            }

            setCurrentInput(null)
        }
    }
    const handleRemoveNote = (type: string, noteIndex: number, changeIndex: number) => {
        const updatedNotes = [...(releaseNotes || [])]
        const currentChange = updatedNotes[changeIndex]
        if (currentChange && Array.isArray(currentChange[type])) {
            currentChange[type] = currentChange[type].filter((_, index) => index !== noteIndex)
            if (currentChange[type].length === 0) {
                updatedNotes.splice(changeIndex, 1)
            } else {
                updatedNotes[changeIndex] = { ...currentChange }
            }
        }
        setReleaseNotes(updatedNotes)
    }

    return (
        <>
            <div className="gap-small flex justify-between">
                {['Security', 'Fixed', 'Changed', 'Added', 'Removed'].map((type) => (
                    <button
                        key={type}
                        onClick={() => handleAddNote(type)}
                        aria-selected={currentInput?.type === type}
                        className="button w-full border border-cold-800 bg-opacity-0 text-cold-800 hover:bg-cold-800 hover:text-white aria-selected:bg-cold-800 aria-selected:text-white"
                    >
                        {type}
                    </button>
                ))}
            </div>
            <div className="gap-small flex w-full">
                <input
                    type="text"
                    value={currentInput?.value ?? ''}
                    disabled={!currentInput}
                    onChange={handleInputChange}
                    placeholder={
                        currentInput?.type ? `Enter ${currentInput.type} Note` : 'Select Note Type'
                    }
                    className="input"
                />
                <button
                    className="button w-40"
                    onClick={handleSubmitNote}
                    disabled={!currentInput?.value}
                >
                    Add Note
                </button>
            </div>
            {releaseNotes && releaseNotes.length > 0 && (
                <ReleaseNotes releaseNotes={releaseNotes} onClick={handleRemoveNote} />
            )}
        </>
    )
}

export default ReleaseNotesInput
