import { Accordion, AccordionBody, AccordionHeader } from '@material-tailwind/react'
import { useState } from 'react'

import AcornIcon from '@components/Assets/acorn.svg'
import AcornColouredIcon from '@components/Assets/acorn_coloured.svg'
import ForwardIcon from '@components/Assets/forward.svg'
import IcpIcon from '@components/Assets/icp.svg'
import IcpColouredIcon from '@components/Assets/icp_coloured.svg'
import Divider from '@components/Shared/Divider'
import QRCode from '@components/Shared/QRCode'
import useAuth from '@hooks/useAuth'
import { ACORN, ICP } from 'shared/utils/services'

export const TOKENS = {
    ACORN: {
        ColouredIcon: <AcornColouredIcon className="h-10 md:h-16" />,
        BigIcon: <AcornIcon className="h-6 w-6 md:h-7 md:w-7" />,
        SmallIcon: <AcornIcon className="h-4 w-4 -translate-y-[2px] md:h-5 md:w-5" />,
        path: '/images/acorn.png',
        Ledger: ACORN,
    },
    ICP: {
        ColouredIcon: <IcpColouredIcon className="h-6 md:h-10" />,
        BigIcon: <IcpIcon className="h-6 w-6 fill-current stroke-0 md:h-7 md:w-7" />,
        SmallIcon: (
            <IcpIcon className="h-4 w-4 fill-current stroke-0 text-opacity-0 md:h-5 md:w-5" />
        ),
        path: '/images/icp.png',
        Ledger: ICP,
    },
}

const Deposit = ({ token }: { token: keyof typeof TOKENS }) => {
    const { principal } = useAuth()
    const [show, setShow] = useState<boolean>(false)

    return (
        <>
            <QRCode
                arr={[
                    {
                        name: 'Recipient Address',
                        content: principal!.toText(),
                        image: '/images/default_avatar.png',
                    },
                ]}
            />
            <Divider className="my-medium" bgColor="bg-cold-700" borderColor="border-cold-700" />
            <Accordion
                open={show}
                icon={
                    <ForwardIcon
                        className={`mx-auto h-4 w-4 stroke-[2px] transition-transform ${show ? 'rotate-90' : ''}`}
                    />
                }
            >
                <AccordionHeader
                    onClick={() => setShow(!show)}
                    className="px-medium rounded-lg border-b-0 py-0 hover:bg-cold-800/15"
                >
                    <span className="py-small text-small font-normal text-cold-700">
                        View token details
                    </span>
                </AccordionHeader>
                <AccordionBody className="py-0 text-cold-700">
                    <QRCode
                        arr={[
                            {
                                name: 'Token Address (DO NOT TRANSFER)',
                                content: TOKENS[token].Ledger.id,
                                image: TOKENS[token].path,
                            },
                        ]}
                    />
                </AccordionBody>
            </Accordion>
        </>
    )
}

export default Deposit
