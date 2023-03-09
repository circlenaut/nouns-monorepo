import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import DelegationModal from '@/components/DelegationModal'
import { getAddressFromQueryParams } from '@/utils/getAddressFromQueryParams'

const DelegatePage: React.FC = () => {
  const { search } = useLocation()
  const delegateTo = getAddressFromQueryParams('to', search)

  const navigate = useNavigate()

  if (!delegateTo || delegateTo.length === 0) {
    return (
      <>
        <DelegationModal onDismiss={() => navigate('/vote')} />
      </>
    )
  }

  return (
    <>
      <DelegationModal
        onDismiss={() => navigate('/vote')}
        delegateTo={delegateTo}
      />
    </>
  )
}

export default DelegatePage
