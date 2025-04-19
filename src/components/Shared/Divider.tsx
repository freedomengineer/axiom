import cn from '@libs/class'

const Divider = ({
    borderColor,
    bgColor,
    direction = 'horizontal',
    className,
}: {
    borderColor: string
    bgColor: string
    direction?: 'horizontal' | 'vertical'
    className?: string
}) => {
    return (
        <div
            className={cn(
                'flex items-center gap-2',
                direction === 'vertical' ? 'w-1.5 flex-col md:w-2' : 'h-1.5 md:h-2',
                className
            )}
        >
            <div
                className={cn(
                    `h-1 min-h-1 w-1 min-w-1 flex-shrink-0 rounded-full md:h-1.5 md:w-1.5`,
                    bgColor
                )}
            />

            <hr
                className={cn(
                    'border-[0.75px] border-dashed md:border',
                    borderColor,
                    direction === 'horizontal' ? `h-min w-full` : `h-full w-min`
                )}
            />

            <div
                className={cn(
                    `h-1 min-h-1 w-1 min-w-1 flex-shrink-0 rounded-full md:h-1.5 md:w-1.5`,
                    bgColor
                )}
            />
        </div>
    )
}

export default Divider
