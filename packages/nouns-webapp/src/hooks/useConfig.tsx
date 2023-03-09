import React, { createContext, useContext, useEffect, useState } from 'react'

import { config, Config } from '@/configs'
import { useContractAddresses } from '@/hooks/useAddresses'
import { useEnv } from '@/hooks/useEnv'

export const ConfigContext = createContext<Config | undefined>(config)

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentConfig, setCurrentConfig] = useState<Config | undefined>(config)

  const environmentVariables = useEnv()
  const { contractAddresses } = useContractAddresses()

  useEffect(() => {
    if (!contractAddresses || !environmentVariables) return
    setCurrentConfig({
      ...config,
      addresses: contractAddresses,
      envs: environmentVariables,
    })
  }, [contractAddresses, environmentVariables])

  return (
    <ConfigContext.Provider value={currentConfig}>
      {children}
    </ConfigContext.Provider>
  )
}

export const useConfig = () => {
  const context = useContext(ConfigContext)
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider')
  }
  return context
}
