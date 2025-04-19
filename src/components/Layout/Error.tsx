const Error = () => {
    return (
        <div className="gap-large mx-auto flex h-full w-full flex-col items-center overflow-hidden">
            <img src="/services/restricted.png" alt="restricted" className="mx-auto h-2/3" />
            <h1 className="text-large text-center font-display font-bold text-primary-700">
                500 - Internal Error
            </h1>
            <p className="text-normal text-center font-light text-cold-800">
                The page you are looking for has encountered an unexpected error. Please try again
                later or contact support if the issue persists.
            </p>
        </div>
    )
}

export default Error
