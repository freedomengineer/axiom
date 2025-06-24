import { Principal } from '@dfinity/principal'

import Username from './Username'

const UserList = ({ items }: { items: Principal[] }) => {
    return (
        <div className="gap-medium flex flex-col">
            {items.map((e, index) => (
                <div key={index} className="gap-normal text-normal flex items-center">
                    <span className="w-6 text-right text-cold-700">{index + 1}</span>
                    <Username
                        principal={e}
                        symbol
                        linkClassName="text-cold-700 pre-underline decoration-cold-700/50 hover:decoration-cold-700/100 mr-semilarge"
                    />
                </div>
            ))}
        </div>
    )
}

export default UserList
