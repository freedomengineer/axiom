import { Principal } from '@dfinity/principal'
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry'

import InfiniteScrollWrapper from '@components/Shared/InfiniteScrollWrapper'
import useAuth from '@hooks/useAuth'
import { Axioms } from 'shared/utils/services'

import EvidenceCard from '../Feed/Evidences/EvidenceCard'

const EvidencesTab = ({
    principal,
    type,
}: {
    principal: Principal
    type: 'Published' | 'Voted'
}) => {
    const { agent } = useAuth()

    return (
        <InfiniteScrollWrapper
            LayoutComponent={({ items }) => (
                <ResponsiveMasonry
                    columnsCountBreakPoints={{ [530]: 1, [530 * 2]: 2, [530 * 3]: 3 }}
                    className="gap-medium mx-auto w-full max-w-[1500px]"
                >
                    <Masonry>
                        {items.map((item, i) => (
                            <EvidenceCard key={i} item={item} className="mx-auto !w-full" />
                        ))}
                    </Masonry>
                </ResponsiveMasonry>
            )}
            name="evidence"
            hardFilter={
                type === 'Published'
                    ? { publisher: principal.toText() }
                    : { voter: principal.toText() }
            }
            hardSort={{ by: 'recent', order: 'descending' }}
            query={Axioms.call(agent, true).getEvidencesPagination}
            className="h-full w-full"
            size={3n}
        />
    )
}

export default EvidencesTab
