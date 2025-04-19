'use client'

import { Accordion, AccordionBody, AccordionHeader } from '@material-tailwind/react'
import { useState } from 'react'

import DownIcon from '@components/Assets/down.svg'
import Link from '@components/Shared/Link'
import faq from '@data/faq.json'
import cn from '@libs/class'

const FAQ = () => {
    const [open, setOpen] = useState<number>(-1)

    const handleOpen = (value: number) => setOpen(open === value ? -1 : value)

    return (
        <div className="font-light text-black ">
            {faq.map((item, index) => (
                <Accordion
                    key={index}
                    open={open === index}
                    icon={
                        <DownIcon
                            className={cn(
                                'h-4 w-4 md:h-6 md:w-6',
                                open === index && 'rotate-180 transform transition-transform'
                            )}
                        />
                    }
                >
                    <AccordionHeader onClick={() => handleOpen(index)} className="py-0">
                        <p className="text-normal py-medium font-normal">{item.question}</p>
                    </AccordionHeader>
                    <AccordionBody>
                        <p className="text-tiny">{item.answer}</p>
                        {item.links && (
                            <div className="gap-medium mt-small flex flex-wrap">
                                {item.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        className="text-tiny pre-underline font-normal text-black decoration-black/50 hover:text-black/100 hover:decoration-black/100"
                                        href={link.url}
                                        openInNewTab
                                    >
                                        {link.title}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </AccordionBody>
                </Accordion>
            ))}
        </div>
    )
}

export default FAQ
