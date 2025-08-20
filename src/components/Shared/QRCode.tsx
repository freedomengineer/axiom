import { QRCodeCanvas } from 'qrcode.react'
import React, { useState } from 'react'

import ClipboardIcon from '@components/Assets/clipboard.svg'
import DoneIcon from '@components/Assets/done.svg'
import { success } from '@libs/toastify'

const QRCode = ({ arr }: { arr: { name: string; content: string; image?: string }[] }) => {
    const [copied, setCopied] = useState<boolean[]>(Array(arr.length).fill(false))

    const handleCopy = (i: number) => {
        navigator.clipboard.writeText(arr[i].content)
        setCopied((prev) => prev.map((_, j) => (j === i ? true : false)))
        success('Copied to clipboard')
        setTimeout(() => setCopied((prev) => prev.map((_, j) => (j === i ? false : _))), 3000)
    }

    return (
        <div className="gap-large p-medium flex flex-col items-center overflow-x-hidden">
            <div className="gap-large flex flex-col md:flex-row md:items-center md:justify-evenly">
                {arr.map((obj, i) => (
                    <div key={obj.name} className="gap-medium flex flex-col items-center">
                        <QRCodeCanvas
                            key={obj.name}
                            value={obj.content}
                            size={256}
                            imageSettings={
                                !obj.image
                                    ? undefined
                                    : { src: obj.image, height: 80, width: 80, excavate: true }
                            }
                        />
                        <div className="text-tiny gap-small mx-auto flex w-full max-w-[80vw] flex-col items-center md:hidden md:flex-row md:justify-center">
                            <span className="text-nowrap font-semibold">{obj.name}</span>
                            <div className="gap-medium p-tiny flex w-full max-w-full cursor-pointer items-center justify-between rounded-md border border-cold-200">
                                <span className="px-small truncate text-nowrap">{obj.content}</span>
                                <button
                                    className="p-tiny rounded-md bg-cold-800/5 hover:bg-cold-800/10"
                                    onClick={() => handleCopy(i)}
                                >
                                    {copied[i] ? (
                                        <DoneIcon className="h-4 w-4 stroke-2 md:h-5 md:w-5 xl:h-6 xl:w-6" />
                                    ) : (
                                        <ClipboardIcon className="h-4 w-4 stroke-2 md:h-5 md:w-5 xl:h-6 xl:w-6" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="gap-medium hidden w-[80%] flex-col items-center md:flex">
                {arr.map(({ name, content }, i) => (
                    <div
                        key={name}
                        className="text-tiny gap-medium md: mx-auto flex w-full flex-col items-center justify-between md:flex-row"
                    >
                        <span className="w-min text-nowrap font-semibold">{name}</span>
                        <div className="gap-medium p-extratiny flex w-fit max-w-fit cursor-pointer items-center justify-between overflow-hidden rounded-md border border-cold-200">
                            <span className="px-small truncate text-nowrap">{content}</span>
                            <button
                                className="p-tiny rounded-md bg-cold-800/5 hover:bg-cold-800/10"
                                onClick={() => handleCopy(i)}
                            >
                                {copied[i] ? (
                                    <DoneIcon className="h-4 w-4 stroke-2 md:h-5 md:w-5" />
                                ) : (
                                    <ClipboardIcon className="h-4 w-4 stroke-2 md:h-5 md:w-5" />
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default QRCode
