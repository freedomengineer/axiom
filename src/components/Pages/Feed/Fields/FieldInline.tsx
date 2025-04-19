'use client '

import FieldIcon from '@components/Assets/field.svg'
import Link from '@components/Shared/Link'
import siteMetadata from '@data/siteMetadata.json'
import cn from '@libs/class'
import { DAxioms } from 'shared/types/services'

const FieldInline = ({ item, className }: { item: DAxioms.SharableField; className?: string }) => {
    const fieldUrl = `${siteMetadata.routes['Truth Feed'].routes['Fields'].url}/${item.name}`

    return (
        <Link
            className={cn(
                'text-tiny gap-normal flex place-items-center items-center text-left font-normal hover:text-primary-800',
                className
            )}
            size="small"
            href={fieldUrl}
        >
            <FieldIcon className="h-4 w-4 stroke-[1.5px]" />
            <span className="truncate">{item.name}</span>
        </Link>
    )
}

export default FieldInline
