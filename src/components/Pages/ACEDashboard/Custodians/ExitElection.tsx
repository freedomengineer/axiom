'use client'
import { useState } from 'react'

import Spinner from '@components/Primitives/Spinner'
import cn from '@libs/class'

const ExitElection = ({ title, loading, handleExitElection }) => {
    const [confirmTitle, setConfirmTitle] = useState('')

    return (
        <div className="gap-medium flex flex-col items-center justify-center">
            <p className="text-small text-cold-800">
                Are you sure you want to exit the election? All ballots you have received will be
                permanently lost.
            </p>
            <input
                className={cn(
                    'input',
                    confirmTitle.length === 0
                        ? 'border-cold-400 focus:ring-cold-600'
                        : confirmTitle === title
                          ? 'border-green-400 focus:ring-green-600'
                          : 'border-red-400 focus:ring-red-600'
                )}
                placeholder="Re-enter the election title to confirm"
                value={confirmTitle}
                onChange={(e) => setConfirmTitle(e.target.value)}
            />
            <button
                className="button w-auto min-w-36 md:min-w-48"
                onClick={handleExitElection}
                disabled={loading || confirmTitle !== title}
            >
                {loading ? (
                    <Spinner color="white" className="h-4 w-4 md:h-5 md:w-5" />
                ) : (
                    'I want to exit the election'
                )}
            </button>
        </div>
    )
}

export default ExitElection
