import AlertIcon from '@components/Assets/alert.svg'

import Link from './Link'
import Popup from './Popup'

export const NoFieldsSubscribed = () => {
    return (
        <Popup
            open={true}
            onClose={undefined}
            title="No Fields Subscribed"
            Icon={<AlertIcon className="h-6 w-6 !stroke-[1.5px] md:h-7 md:w-7" />}
            className="w-full md:w-2/5"
        >
            <div className="gap-medium flex flex-col">
                <p className="text-small font-cold-800 gap-small grid text-center font-normal">
                    <span>
                        A Hypothesis <strong>requires</strong> Field to be published in. Yet, it
                        seems you do not have any Fields subscribed.
                    </span>
                    <span>Please subscribe to at least one Field to proceed.</span>
                </p>
                <div className="gap-medium flex justify-center">
                    <Link
                        className="button w-auto min-w-36 bg-cold-700 md:min-w-48"
                        href="/feed/fields"
                    >
                        Explore Fields
                    </Link>
                </div>
            </div>
        </Popup>
    )
}

export const LongHypothesis = ({
    onClose,
    onConfirm,
}: {
    onClose: () => void
    onConfirm: () => void
}) => {
    return (
        <Popup
            open={true}
            onClose={onClose}
            title="Hypothesis too long"
            Icon={<AlertIcon className="h-6 w-6 !stroke-[1.5px] md:h-7 md:w-7" />}
            className="w-full md:w-2/5"
        >
            <div className="gap-medium flex flex-col">
                <p className="text-small font-cold-800 gap-small grid text-center font-normal">
                    <span>
                        Long hypotheses can sometimes{' '}
                        <strong>discourage other users or make them lose interest</strong>.
                    </span>
                    <span>
                        To keep your hypothesis attractive and engaging, we recommend to{' '}
                        <strong>keep it concise</strong> and place some additional details in the
                        evidence section instead if possible.
                    </span>
                </p>
                <div className="gap-medium flex justify-center">
                    <button
                        className="button w-auto min-w-36 bg-cold-700 md:min-w-48"
                        onClick={onConfirm}
                    >
                        Still continue with long content
                    </button>
                </div>
            </div>
        </Popup>
    )
}

export const AlphaStage = ({ onConfirm }: { onConfirm: () => void }) => {
    return (
        <Popup
            open={true}
            onClose={undefined}
            title="Alpha Stage Warning"
            Icon={<AlertIcon className="h-6 w-6 !stroke-[1.5px] md:h-7 md:w-7" />}
            className="w-full md:w-2/5"
        >
            <div className="gap-medium flex flex-col">
                <p className="text-small font-cold-800 gap-small grid text-center font-normal">
                    <span>
                        Axiom, the free thought network is live and in alpha. There may be bugs and
                        we do not guarantee stability.
                    </span>
                    <span>
                        <strong>Do not hold large amounts of ICP</strong> in your Axiom.info wallet.{' '}
                    </span>
                    <span>
                        All Acorns earned on Axiom are yours to keep. We do not know the future
                        value of Acorns.{' '}
                    </span>
                    Use Axiom at your own risk.
                </p>
                <div className="gap-medium flex justify-center">
                    <button
                        className="button w-auto min-w-36 bg-cold-700 md:min-w-48"
                        onClick={onConfirm}
                    >
                        Do not show again
                    </button>
                </div>
            </div>
        </Popup>
    )
}
