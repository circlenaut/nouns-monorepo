import 'bootstrap/dist/css/bootstrap.min.css'
import React from 'react'

import { Providers } from '@/contexts'
import { AppRoutes } from '@/routes'

const App: React.FC = () => {
  return (
    <Providers>
      <AppRoutes />
    </Providers>
  )
}

export default App
