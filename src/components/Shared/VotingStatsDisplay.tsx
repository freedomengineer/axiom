import React from 'react'

const StackedBar = ({ data, className = '' }) => {
    return (
        <div className={`relative h-3 w-full overflow-hidden rounded-full ${className}`}>
            <div className="absolute inset-0 flex gap-[1px]">
                {data.map(({ label, color, percentage }) => (
                    <div
                        key={label}
                        className="transform-gpu animate-[growWidth_0.6s_ease-out_forwards]"
                        style={{
                            width: `${percentage}%`,
                            backgroundColor: color,
                            transformOrigin: 'left',
                            transition: 'width 0.6s ease-in-out',
                        }}
                    />
                ))}
            </div>
        </div>
    )
}

const VotingStatsDisplay = ({ regularVotes, poweredVotes }) => {
    const processData = (votes, unit) => {
        const total = votes.reduce((sum, { value }) => sum + value, 0)
        return votes.map((vote) => ({
            ...vote,
            percentage: total === 0 ? 0 : Math.round((vote.value / total) * 100),
            unit,
        }))
    }

    const membersData = processData(regularVotes, 'Members')
    const acornsData = processData(poweredVotes, 'Acorns')

    return (
        <>
            <style jsx global>{`
                @keyframes growWidth {
                    from {
                        transform: scaleX(0);
                    }
                    to {
                        transform: scaleX(1);
                    }
                }
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
            `}</style>
            <StackedBar data={acornsData} className="mb-4" />
            <StackedBar data={membersData} />
        </>
    )
}

export default VotingStatsDisplay
