import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import FAQDecorationIcon from '@components/Assets/faq_decoration.svg'
import FAQ from '@components/Pages/Home/FAQ'
import PageMetadata from '@components/Shared/PageMetadata'
import siteMetadata from '@data/siteMetadata.json'
import { build } from '@libs/url'

const title = 'Home'
const metadata = siteMetadata.routes[title]
const pageMetadata: Metadata = {
    url: siteMetadata.siteUrl + metadata.url,
    title: `${title} | ${siteMetadata.title}`,
    description: metadata.description,
}

const HomePage = () => {
    const navigate = useNavigate()

    useEffect(() => {
        navigate(build(['feed']), { replace: true })
    }, [])

    return null

    // return (
    //     <>
    //         <PageMetadata {...pageMetadata} />
    //         <div className="gap-large p-extralarge flex w-full flex-col justify-between bg-hot-50 md:flex-row">
    //             <div className="gap-large flex flex-col text-primary-700 ">
    //                 <div className="gap-medium flex flex-col">
    //                     <FAQDecorationIcon className="w-10 stroke-2 md:w-14 md:stroke-[3px]" />
    //                     <p className="text-extralarge font-extrabold ">
    //                         Some of Your Questions, Answered.
    //                     </p>
    //                 </div>
    //                 <p className="text-normal font-light text-black">
    //                     {`Can't find what you're looking for? Visit our `}
    //                     <a
    //                         href={siteMetadata.routes['School'].routes['Axiom FAQ'].url}
    //                         className="text-normal font-normal text-black underline decoration-black/50 decoration-[1px] underline-offset-4 hover:text-black/100 hover:decoration-black/100"
    //                     >
    //                         FAQ
    //                     </a>
    //                 </p>
    //             </div>
    //             <FAQ />
    //         </div>
    //     </>
    // )
}

export default HomePage
