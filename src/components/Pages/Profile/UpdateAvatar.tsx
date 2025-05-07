'use client'

import { useState } from 'react'

import AcornIcon from '@components/Assets/acorn.svg'
import AddPictureIcon from '@components/Assets/add_picture.svg'
import Spinner from '@components/Primitives/Spinner'
import BalanceChanges from '@components/Shared/BalanceChanges'
import useAuth from '@hooks/useAuth'
import useConfigs from '@hooks/useConfigs'
import useUploadImage from '@hooks/useUploadImage'
import { promise } from '@libs/toastify'
import { buildBlobImage } from '@libs/url'
import { ACORN, Facade, Treasury } from 'shared/utils/services'
import { valueOf } from 'shared/utils/tokens'

enum ELoading {
    Uploading,
    Updating,
    Removing,
}

const UpdateAvatar = ({ onSubmit, avatar }: { onSubmit: () => void; avatar: Opt<Uint8Array> }) => {
    const { agent } = useAuth()
    const configs = useConfigs('Facade')

    const [newAvatar, setNewAvatar] = useState<Opt<Uint8Array>>()
    const [loading, setLoading] = useState<ELoading | undefined>(undefined)
    const [isSufficient, setIsSufficient] = useState(true)

    const uploadImage = useUploadImage(setNewAvatar, (loading) =>
        setLoading(loading ? ELoading.Uploading : undefined)
    )

    const update = async () => {
        if (!newAvatar) return

        setLoading(ELoading.Updating)
        const approve = await promise(
            ACORN.call(agent).icrc2_approve({
                amount: configs?.['UPDATE_AVATAR_FEE'][1] as bigint,
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
            setLoading(undefined)
            return
        }
        const res = await promise(
            Facade.call(agent).editAvatar([{ blob: newAvatar }]),
            'Updating avatar',
            'Avatar updated successfully!'
        )
        setLoading(undefined)
        if (res.success) onSubmit()
    }

    const remove = async () => {
        if (!avatar) return

        setLoading(ELoading.Removing)
        const res = await promise(
            Facade.call(agent).editAvatar([]),
            'Removing avatar',
            'Avatar removed successfully!'
        )
        setLoading(undefined)
        if (res.success) onSubmit()
    }

    return (
        <div className="gap-semilarge flex w-full flex-col items-center">
            <label
                htmlFor="uploadFile1"
                className="input group relative h-60 w-60 cursor-pointer rounded-lg border-2 border-dashed p-0 ring-0 hover:bg-cold-800/20 aria-disabled:pointer-events-none"
                aria-disabled={loading === ELoading.Uploading}
            >
                <input
                    type="file"
                    id="uploadFile1"
                    className="hidden"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={(e) => uploadImage(e)}
                />
                {newAvatar?.length ? (
                    <img
                        src={buildBlobImage(newAvatar)}
                        alt="preview"
                        className="h-full w-full object-cover group-hover:opacity-90"
                    />
                ) : (
                    <div className="absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center rounded-lg">
                        <AddPictureIcon className="h-20 stroke-1 pt-3" />
                        <p className="text-tiny p-normal text-center">
                            Only PNG, JPEG, WEBP formats are accepted
                        </p>
                    </div>
                )}
                {loading === ELoading.Uploading && (
                    <div className="absolute left-0 top-0 z-10 flex h-full w-full items-center justify-center rounded-lg bg-black/50">
                        <Spinner color="white" className="h-8 w-8 md:h-10 md:w-10" />
                    </div>
                )}
            </label>
            {!(avatar && !newAvatar) && (
                <BalanceChanges
                    amount={configs?.['UPDATE_AVATAR_FEE'][1] as bigint}
                    setIsSufficient={setIsSufficient}
                />
            )}
            <div className="flex w-full justify-between">
                <button
                    className="button w-auto min-w-36 md:min-w-48"
                    onClick={remove}
                    disabled={loading === ELoading.Removing || !avatar}
                >
                    {loading === ELoading.Removing ? (
                        <Spinner color="white" className="h-4 w-4 md:h-5 md:w-5" />
                    ) : (
                        <>
                            Remove with 0{' '}
                            <AcornIcon className="h-4 w-4 stroke-[1.5px] md:h-5 md:w-5" />
                        </>
                    )}
                </button>
                <button
                    className="button w-auto min-w-36 md:min-w-48"
                    onClick={update}
                    disabled={loading === ELoading.Updating || !newAvatar || !isSufficient}
                >
                    {loading === ELoading.Updating ? (
                        <Spinner color="white" className="h-4 w-4 md:h-5 md:w-5" />
                    ) : !isSufficient ? (
                        <span>Insufficient ACORN balance</span>
                    ) : (
                        <>
                            Update with {valueOf(configs?.['UPDATE_AVATAR_FEE'][1] as bigint)}{' '}
                            <AcornIcon className="h-4 w-4 stroke-[1.5px] md:h-5 md:w-5" />
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}

export default UpdateAvatar
