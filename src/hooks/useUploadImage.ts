import imageCompression from 'browser-image-compression'
import { useCallback } from 'react'

import { promise } from '@libs/toastify'

export type CompressionDetails = {
    originalSize: number
    compressedSize: number
    reductionPercent: number
}

const ACCEPTED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const DEFAULT_MAX_SIZE_MB = 2
const DEFAULT_INITIAL_QUALITY = 0.85
const DEFAULT_TARGET_FORMAT = 'image/webp'

const useUploadImage = (
    onSuccess: (imageData: Uint8Array) => void,
    onLoading?: (loading: boolean) => void
) => {
    const processAndUpload = useCallback(
        async (file: File): Promise<CompressionDetails> => {
            onLoading?.(true)

            if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
                onLoading?.(false)
                throw Error(`Invalid file, only accept: ${ACCEPTED_MIME_TYPES.join(', ')}`)
            }

            const originalSize = file.size
            console.log(`Original size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`)

            const options = {
                maxSizeMB: DEFAULT_MAX_SIZE_MB,
                useWebWorker: true,
                initialQuality: DEFAULT_INITIAL_QUALITY,
                mimeType: DEFAULT_TARGET_FORMAT,
            }

            try {
                const compressedFileBlob = await imageCompression(file, options)
                const compressedSize = compressedFileBlob.size
                const reductionPercent =
                    originalSize > 0 ? ((originalSize - compressedSize) / originalSize) * 100 : 0

                console.log(`Compressed size: ${(compressedSize / 1024 / 1024).toFixed(2)} MB`)
                console.log(`Reduction: ${reductionPercent.toFixed(1)}%`)

                const details: CompressionDetails = {
                    originalSize,
                    compressedSize,
                    reductionPercent,
                }
                const arrayBuffer = await compressedFileBlob.arrayBuffer()
                const uint8Array = new Uint8Array(arrayBuffer)

                onSuccess?.(uint8Array)
                onLoading?.(false)
                return details
            } catch (err: any) {
                onLoading?.(false)
                throw Error(`Error processing image: ${err?.message ?? 'Unknown error'}`)
            }
        },
        [onSuccess]
    )

    const uploadImage = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const files = event.target.files
            if (files && files.length > 0) {
                promise(
                    processAndUpload(files[0]),
                    'Processing image',
                    'Image processed successfully!',
                    (details) =>
                        `${(details.originalSize / 1024 / 1024).toFixed(2)} MB -> ${(
                            details.compressedSize /
                            1024 /
                            1024
                        ).toFixed(2)} MB (${details.reductionPercent.toFixed(1)}% compressed)`
                )
            } else {
                console.log('No file selected or selection cancelled.')
            }
        },
        [processAndUpload]
    )

    return uploadImage
}

export default useUploadImage
