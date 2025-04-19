const NotFound = () => {
    return (
        <div className="gap-large mx-auto flex w-full flex-col items-center overflow-hidden">
            <img src="/services/error.png" alt="error" className="mx-auto h-2/3" />
            <h1 className="text-large text-center font-display font-bold text-primary-700">
                404 - Page Not Found
            </h1>
            <p className="text-normal text-center font-light text-cold-800">
                The page you are looking for might have been removed, had its name changed, or is
                temporarily unavailable.
            </p>
        </div>
    )
}

export default NotFound
