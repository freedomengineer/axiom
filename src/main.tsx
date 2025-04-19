import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { RouterProvider } from 'react-router-dom'

import '@styles/tailwind.css'
import '@styles/extra.css'
import { router } from './router'

ReactDOM.createRoot(document.getElementById('root')!).render(
    <HelmetProvider context={{}}>
        <RouterProvider router={router} />
    </HelmetProvider>
)
