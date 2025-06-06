import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import AcornIcon from '@components/Assets/acorn.svg'
import Spinner from '@components/Primitives/Spinner'
import BalanceChanges from '@components/Shared/BalanceChanges'
import Divider from '@components/Shared/Divider'
import Link from '@components/Shared/Link'
import useAuth from '@hooks/useAuth'
import cn from '@libs/class'
import { promise } from '@libs/toastify'
import { build } from '@libs/url'
import { EVote } from '@utils/feed/evidence'
import { DAxioms } from 'shared/types/services'
import { ACORN, Axioms, Treasury } from 'shared/utils/services'
import { valueOf } from 'shared/utils/tokens'
import { UnwrapVariant, Wrap } from 'shared/utils/typings'

import EvidenceCard from './EvidenceCard'

const PostEvidencePreview = ({
    item,
    totalFee,
    onBack,
    onSubmit,
    replyTo,
}: {
    item: DAxioms.SharableEvidence
    totalFee: bigint
    onBack: () => void
    onSubmit?: (side: EVote) => void
    replyTo?: bigint | null
}) => {
    const navigate = useNavigate()
    const { agent } = useAuth()

    const [terms, setTerms] = useState<[boolean, boolean]>([false, false])
    const [loading, setLoading] = useState(false)
    const [isSufficient, setIsSufficient] = useState(true)

    const post = async () => {
        setLoading(true)
        const approve = await promise(
            ACORN.call(agent).icrc2_approve({
                amount: totalFee,
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
            Axioms.call(agent).publishEvidence(item.id, item.form, item.choice, Wrap(replyTo)),
            'Posting evidence',
            'Posted evidence successfully!'
        )
        setLoading(false)
        if (res.success) {
            onSubmit?.(UnwrapVariant(item.choice) as EVote)
            navigate(build(['feed', item.hypothesisId]))
        }
    }

    return (
        <div className="gap-normal flex flex-col md:flex-row md:justify-between">
            <div className="gap-normal pointer-events-none flex w-full flex-col md:w-3/5">
                <p className="text-medium text-center font-light">Preview</p>
                <EvidenceCard item={item} className="mx-auto !w-full" />
            </div>
            <Divider
                className="hidden md:flex"
                direction="vertical"
                bgColor="bg-cold-800"
                borderColor="border-cold-800"
            />
            <Divider
                className="!py-medium mx-auto flex w-4/5 md:hidden"
                direction="horizontal"
                bgColor="bg-cold-800"
                borderColor="border-cold-800"
            />
            <div className="text-tiny gap-normal flex w-full flex-col md:w-2/5">
                <p className="text-medium text-center font-light">Confirmation</p>
                <BalanceChanges
                    token="ACORN"
                    amount={totalFee}
                    sign="-"
                    setIsSufficient={setIsSufficient}
                />
                <div
                    className={cn(
                        'gap-normal flex items-center text-cold-700 text-opacity-100',
                        !terms[0] && 'text-opacity-50'
                    )}
                >
                    <input
                        type="checkbox"
                        checked={terms[0]}
                        onChange={(e) => setTerms((prev) => [e.target.checked, prev[1]])}
                        className="h-5 w-5 cursor-pointer accent-cold-700 md:h-6 md:w-6"
                    />
                    <p className="w-fit">
                        {`I'm completely satisfied with my post and I understand that this is
                irreversible.`}
                    </p>
                </div>
                <div
                    className={cn(
                        'gap-normal flex items-center text-cold-700 text-opacity-100',
                        !terms[1] && 'text-opacity-50'
                    )}
                >
                    <input
                        type="checkbox"
                        checked={terms[1]}
                        onChange={(e) => setTerms((prev) => [prev[0], e.target.checked])}
                        className="h-5 w-5 cursor-pointer accent-cold-700 md:h-6 md:w-6"
                    />
                    <p className="w-fit">
                        I confirm that none of the information provided violate any of the{' '}
                        <Link
                            href="/terms"
                            target="_blank"
                            rel="noreferrer"
                            className="pre-underline text-tiny inline"
                            openInNewTab
                        >
                            Axiom Platform Standards
                        </Link>
                        .
                    </p>
                </div>
                <Divider
                    className="!py-medium mx-auto flex w-4/5 md:hidden"
                    direction="horizontal"
                    bgColor="bg-cold-800"
                    borderColor="border-cold-800"
                />
                <div className="gap-small mt-auto flex justify-between">
                    <button
                        className="button w-auto min-w-36 bg-cold-800 md:min-w-48"
                        onClick={() => onBack()}
                    >
                        Back to Form
                    </button>
                    <button
                        className="button w-auto min-w-36 md:min-w-48"
                        onClick={post}
                        disabled={!terms[0] || !terms[1] || !isSufficient || loading}
                    >
                        {loading ? (
                            <Spinner color="white" className="h-4 w-4 md:h-5 md:w-5" />
                        ) : !isSufficient ? (
                            <span>Insufficient ACORN balance</span>
                        ) : (
                            <>
                                Post with {valueOf(totalFee)}{' '}
                                <AcornIcon className="h-4 w-4 stroke-[1.5px] md:h-5 md:w-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default PostEvidencePreview
