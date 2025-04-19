import { sha256 } from 'js-sha256'
import { ChangeEvent, useCallback, useEffect, useRef } from 'react'

import { error } from '@libs/toastify'
import { MAX_CHUNK_SIZE } from 'shared/constants'
import { DDAO } from 'shared/types/services'
import { UnwrapVariant, Variant } from 'shared/utils/typings'

const useUploadWasm = (
    selectedActor: string | null,
    commitments: DDAO.SharableCommitment[],
    setCommitments: (commitments: DDAO.SharableCommitment[]) => void,
    rawCommitments: Record<string, Commitment>,
    setRawCommitments: (commitments: Record<string, Commitment>) => void
) => {
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (selectedActor && fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }, [selectedActor])

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!selectedActor) {
            error('Please select an actor first')
            if (fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            return
        }
        if (!e.target.files || e.target.files.length === 0) {
            handleRemoveCommitment(selectedActor)
            return
        }
        const selectedFile = e.target.files[0]
        if (!selectedFile.name.endsWith('.wasm')) {
            error('Please select a valid .wasm file')
            return
        }
        try {
            const arrayBuffer = await selectedFile.arrayBuffer()
            const buffer = new Uint8Array(arrayBuffer)
            const moduleHash = sha256(buffer)
            const size = buffer.length
            const numOfChunks = Math.ceil(size / MAX_CHUNK_SIZE)
            const chunks: { blob: Uint8Array; checksum: string }[] = []
            for (let i = 0; i < numOfChunks; i++) {
                const start = i * MAX_CHUNK_SIZE
                const end = Math.min(size, (i + 1) * MAX_CHUNK_SIZE)
                const chunk = buffer.slice(start, end)
                const checksum = sha256(chunk)
                chunks.push({ blob: chunk, checksum })
            }
            const commitment: Commitment = {
                chunks,
                moduleHash,
                args: new Uint8Array(),
            }
            setRawCommitments({ ...rawCommitments, [selectedActor]: commitment })
            const actorVariant = Variant(selectedActor) as DDAO.ActorVariant
            const sharableCommitment: DDAO.SharableCommitment = {
                moduleHash: commitment.moduleHash,
                args: commitment.args,
                actorVariant,
            }
            const existingIndex = commitments.findIndex(
                (c) => UnwrapVariant(c.actorVariant) === selectedActor
            )
            if (existingIndex >= 0) {
                const newCommitments = [...commitments]
                newCommitments[existingIndex] = sharableCommitment
                setCommitments(newCommitments)
            } else {
                setCommitments([...commitments, sharableCommitment])
            }
        } catch (err) {
            error('Error processing WASM file. See console for details.')
            console.error('Error processing WASM file:', err)
        }
    }
    const handleRemoveCommitment = useCallback(
        (actor: string) => {
            const newRawCommitments = { ...rawCommitments }
            delete newRawCommitments[actor]
            setRawCommitments(newRawCommitments)
            if (selectedActor === actor && fileInputRef.current) {
                fileInputRef.current.value = ''
            }
            setCommitments(commitments.filter((c) => UnwrapVariant(c.actorVariant) !== actor))
        },
        [selectedActor, commitments, setCommitments]
    )

    const currentCommitment = selectedActor ? rawCommitments[selectedActor] : null

    return {
        fileInputRef,
        currentCommitment,
        handleFileChange,
        handleRemoveCommitment,
    }
}

export default useUploadWasm
