import { XIcon } from '@heroicons/react/solid'
import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import ChangeDelegatePannel from '@/components/ChangeDelegatePanel'
import CurrentDelegatePanel from '@/components/CurrentDelegatePanel'

import classes from './DelegationModal.module.css'

export const Backdrop: React.FC<{ onDismiss: () => void }> = (props) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      props.onDismiss()
    }
  }

  return (
    <button
      className={classes.backdrop}
      onClick={props.onDismiss}
      onKeyDown={handleKeyDown}
    >
      Close
    </button>
  )
}

const DelegationModalOverlay: React.FC<{
  onDismiss: () => void
  delegateTo?: string
}> = (props) => {
  const { onDismiss, delegateTo } = props

  const [isChangingDelegation, setIsChangingDelegation] = useState(
    delegateTo !== undefined,
  )

  return (
    <>
      <div className={classes.closeBtnWrapper}>
        <button onClick={onDismiss} className={classes.closeBtn}>
          <XIcon className={classes.icon} />
        </button>
      </div>

      <div className={classes.modal}>
        {isChangingDelegation ? (
          <ChangeDelegatePannel onDismiss={onDismiss} delegateTo={delegateTo} />
        ) : (
          <CurrentDelegatePanel
            onPrimaryBtnClick={() => setIsChangingDelegation(true)}
            onSecondaryBtnClick={onDismiss}
          />
        )}
      </div>
    </>
  )
}

const backdropRoot = document.getElementById('backdrop-root')
const overlayRoot = document.getElementById('overlay-root')
const DelegationModal: React.FC<{
  onDismiss: () => void
  delegateTo?: string
}> = (props) => {
  const { onDismiss, delegateTo } = props
  return (
    <>
      {backdropRoot &&
        ReactDOM.createPortal(<Backdrop onDismiss={onDismiss} />, backdropRoot)}
      {overlayRoot &&
        ReactDOM.createPortal(
          <DelegationModalOverlay
            onDismiss={onDismiss}
            delegateTo={delegateTo}
          />,
          overlayRoot,
        )}
    </>
  )
}

export default DelegationModal
