'use client'

import { AuthContext, useAuthClient } from '@hooks/useAuth'

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const auth = useAuthClient()
    return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>
}

export default AuthProvider
