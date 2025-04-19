import { useEffect, useState } from 'react'

import Link from '@components/Shared/Link'
import siteMetadata from '@data/siteMetadata.json'
import { ESteps, StepProps } from '@utils/login/step'
import { Facade } from 'shared/utils/services'

const Done = ({ choices }: StepProps) => {
    const [count, setCount] = useState(0n)

    useEffect(() => {
        Facade.call().getUsersCount().then(setCount)
    }, [])

    return (
        <>
            <div className="gap-normal flex flex-col">
                <p className="text-small gap-small flex flex-col indent-4 font-normal text-cold-700 md:indent-8">
                    <span>Welcome to cypherspace {choices[ESteps.Username]}!</span>
                    <span>
                        Your Axiom username coupled with your internet identity created an entity
                        capable of free thought, free speech and the unfettered distribution of
                        information over the Axiom free thought platform.
                    </span>
                    <span>
                        {
                            'Axiom is built completely (100%) on the Internet Computer blockchain -> cypherspace.'
                        }
                    </span>
                    <span>
                        Therefore, your username, under your control via your cryptographic key
                        (internet identity) is an anonymous and autonomous entity inhabiting
                        cypherspace.
                    </span>
                    <span>
                        Upon realization of that, please read the following two documents sometime
                        at your leisure, so that you can grok the full vision of our new reality,
                        responsibility and potential that Axiom on the IC unleash to humanity.
                    </span>
                    <span>
                        <Link
                            href="https://www.eff.org/cyberspace-independence"
                            className="text-small pre-underline inline-block indent-0 decoration-cold-700/50 hover:decoration-cold-700/100"
                            openInNewTab
                        >
                            The Declaration of the Independence of Cypherspace
                        </Link>{' '}
                        - by John Perry Barlow
                    </span>
                    <span>
                        <Link
                            href="https://github.com/ParalelniPolis/common-economic-protocols/blob/master/English/common-economic-protocols.md"
                            className="text-small  pre-underline inline-block indent-0 decoration-cold-700/50 hover:decoration-cold-700/100"
                            openInNewTab
                        >
                            The Common Economic Protocols
                        </Link>{' '}
                        - written by Andre Goldman, and inspired by{' '}
                        <Link
                            href="https://www.amazon.ca/Diamond-Age-Young-Illustrated-Primer/dp/0553380966"
                            className="text-small pre-underline inline-block indent-0 decoration-cold-700/50 hover:decoration-cold-700/100"
                            openInNewTab
                        >
                            Diamond Age
                        </Link>
                        .
                    </span>
                    <span>
                        Axiom is just one of many unstoppable applications that have been or will be
                        launched in cypherspace. (Gold DAO and Open Chat).
                    </span>
                </p>
            </div>
            <div className="gap-normal flex flex-col">
                <p className="text-medium indent-4 font-semibold text-primary-700 md:indent-8">
                    A note on Self Responsibility
                </p>
                <p className="text-small gap-small flex flex-col indent-4 font-normal text-cold-700 md:indent-8">
                    <span>
                        Self responsibility in cypherspace means backing up your cryptographic keys.
                    </span>
                    <span>
                        If you are planning on earning Acorns through participation in Axiom, as
                        well as earn ICP through our affiliate program, then it is HIGHLY
                        recommended that you backup the Internet Identity connected to this Axiom
                        username.
                    </span>
                    <span>
                        Don&lsquo;t break the first rule of crypto; &ldquo;Not your keys, not your
                        crypto&rdquo;. by backing up your Internet Identity now. Here&lsquo;s how.
                    </span>
                </p>
            </div>
            <div className="gap-normal flex flex-col">
                <p className="text-medium indent-4 font-semibold text-primary-700 md:indent-8">
                    Be the Light
                </p>
                <p className="text-small gap-small flex flex-col indent-4 font-normal text-cold-700 md:indent-8">
                    <span>
                        On behalf of all the current {count.toString()} members of the Axiom free
                        thought platform… We want to thank you for lighting your lantern and joining
                        us on our march toward a new dawn.
                    </span>
                    <span>
                        We already know that you bring something special to this endeavour and
                        we&lsquo;re excited to explore existence with you.
                    </span>
                    <span>Let us begin.</span>
                </p>
            </div>
            <Link
                href={siteMetadata.routes['Truth Feed'].routes['Fields'].url}
                className="button mx-auto w-auto min-w-36 md:min-w-48"
            >
                Explore
            </Link>
        </>
    )
}

export default Done
