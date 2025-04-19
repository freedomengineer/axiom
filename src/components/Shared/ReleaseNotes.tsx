import cn from '@libs/class'
import { DDAO } from 'shared/types/services'

const ReleaseNotes = ({
    releaseNotes,
    onClick,
    className,
}: {
    releaseNotes: DDAO.ReleaseNotes
    className?: string
    onClick: (type: string, noteIndex: number, changeIndex: number) => void
}) => {
    return (
        <div
            className={cn(
                'py-small px-semilarge gap-small col-span-2 flex flex-col rounded-lg border border-cold-300',
                className
            )}
        >
            {releaseNotes.map((change, changeIndex) =>
                Object.entries(change).map(
                    ([type, notesList]) =>
                        notesList?.length > 0 && (
                            <div key={`${type}-${changeIndex}`}>
                                <h3 className="text-normal font-semibold uppercase text-primary-600">
                                    {type}
                                </h3>
                                {notesList.map((note, noteIndex) => (
                                    <p
                                        key={noteIndex}
                                        className="ml-medium text-tiny cursor-pointer select-none text-cold-800 transition-colors hover:text-cold-800/50"
                                        onClick={() => onClick(type, noteIndex, changeIndex)}
                                    >
                                        <span className="mr-normal text-medium">•</span>
                                        {note}
                                    </p>
                                ))}
                            </div>
                        )
                )
            )}
        </div>
    )
}

export default ReleaseNotes
