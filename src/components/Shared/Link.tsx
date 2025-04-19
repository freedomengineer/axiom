import { Link as RouterLink } from 'react-router-dom'

import NavigateIcon from '@components/Assets/navigate.svg'
import cn from '@libs/class'

const Link = ({
    size = 'small',
    icon,
    Icon,
    onNavigate,
    href,
    openInNewTab = false,
    ...props
}: {
    size?: 'tiny' | 'small' | 'normal' | 'medium' | 'large'
    icon?: 'forward' | 'backward'
    Icon?: React.ReactNode
    onNavigate?: () => void
    openInNewTab?: boolean
    href: string
    [key: string]: any
}) => {
    const handleClick = (e: React.MouseEvent) => {
        if (props.onClick) props.onClick(e)
        if (onNavigate && !e.defaultPrevented) setTimeout(onNavigate, 0)
    }

    const isExternal =
        openInNewTab || (href && !(href.startsWith('/') || href.startsWith(window.location.origin)))

    return (
        <RouterLink
            {...props}
            to={href}
            onClick={handleClick}
            target={isExternal ? '_blank' : undefined}
            rel={isExternal ? 'noopener noreferrer' : undefined}
            className={cn('group flex items-center', props.className)}
        >
            {Icon}
            {icon && (
                <NavigateIcon
                    className={cn(
                        'mr-1 text-current transition-transform duration-300',
                        {
                            tiny: 'h-[6px] stroke-1 md:h-[8px]',
                            small: 'h-[10px] stroke-1 md:h-[12px] md:stroke-[1.5px]',
                            normal: 'h-[14px] stroke-[1.5px] md:h-[16px] md:stroke-2',
                            medium: 'h-[18px] stroke-[1.5px] md:h-[20px] md:stroke-2',
                            large: 'h-[22px] stroke-2 md:h-[24px] md:stroke-[2.5px]',
                        }[size],
                        {
                            forward: 'group-hover:translate-x-1',
                            backward: 'rotate-180 group-hover:-translate-x-1',
                        }[icon]
                    )}
                />
            )}
            {props.children}
        </RouterLink>
    )
}

export default Link
