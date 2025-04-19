const Restricted = () => {
    return (
        <div className="gap-large mx-auto flex h-full w-full flex-col items-center overflow-hidden">
            <img src="/services/restricted.png" alt="restricted" className="mx-auto h-2/3" />
            <h1 className="text-large text-center font-display font-bold text-primary-700">
                403 - Restricted
            </h1>
            <p className="text-normal text-center font-light text-cold-800">
                The page you are looking for is not permitted for you to access. Please login or
                re-check your Internet Identity account.
            </p>
        </div>
    )
}

export default Restricted
