import React from 'react'
import ReactDOM from 'react-dom'

import classes from './WalletModal.module.css'

import xIcon from '@/assets/x-icon.png'

export const Backdrop: React.FC<{ onDismiss: () => void }> = (props) => {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      props.onDismiss()
    }
  }

  return (
    <div
      className={classes.backdrop}
      role="button"
      tabIndex={0}
      onClick={props.onDismiss}
      onKeyDown={handleKeyDown}
    />
  )
}

const ModalOverlay: React.FC<{
  title?: React.ReactNode
  content?: React.ReactNode
  onDismiss: () => void
}> = (props) => {
  const { title, content, onDismiss } = props

  return (
    <div className={classes.modal}>
      <button className={classes.closeButton} onClick={onDismiss}>
        <img src={xIcon} alt="Button to close modal" />
      </button>
      <h3>{title}</h3>
      <div className={classes.content}>
        {content}
        <div className={classes.walletContainer}></div>
      </div>
    </div>
  )
}

const WalletModal: React.FC<{
  title?: React.ReactNode
  content?: React.ReactNode
  onDismiss: () => void
}> = (props) => {
  const { title, content, onDismiss } = props

  const backdropRoot = document.getElementById('backdrop-root')
  const overlayRoot = document?.getElementById('overlay-root')

  return (
    <>
      {backdropRoot &&
        ReactDOM.createPortal(<Backdrop onDismiss={onDismiss} />, backdropRoot)}
      {overlayRoot &&
        ReactDOM.createPortal(
          <ModalOverlay
            title={title}
            content={content}
            onDismiss={onDismiss}
          />,
          overlayRoot,
        )}
    </>
  )
}

export default WalletModal
