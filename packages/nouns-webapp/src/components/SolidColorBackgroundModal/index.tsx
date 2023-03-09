import { XIcon } from '@heroicons/react/solid'
import React, { useRef } from 'react'
import ReactDOM from 'react-dom'

import NounsTransition from '@/components/NounsTransition'
import {
  basicFadeInOut,
  desktopModalSlideInFromTopAndGrow,
  mobileModalSlideInFromBottm,
} from '@/utils/cssTransitionUtils'
import { isMobileScreen } from '@/utils/isMobile'

import classes from './SolidColorBackgroundModal.module.css'

export const Backdrop: React.FC<{ onDismiss: () => void; show: boolean }> = (
  props,
) => {
  const nodeRef = useRef(null)

  return (
    <NounsTransition
      className={classes.backdrop}
      nodeRef={nodeRef}
      show={props.show}
      timeout={100}
      onClick={() => props.onDismiss()}
      transitionStyes={basicFadeInOut}
    />
  )
}

const SolidColorBackgroundModalOverlay: React.FC<{
  onDismiss: () => void
  content: React.ReactNode
  show: boolean
}> = (props) => {
  const { show, onDismiss, content } = props

  const exitBtnRef = useRef(null)
  const modalRef = useRef(null)

  const isMobile = isMobileScreen()

  return (
    <>
      <NounsTransition
        nodeRef={exitBtnRef}
        timeout={200}
        transitionStyes={basicFadeInOut}
        show={show}
      >
        <div className={classes.closeBtnWrapper}>
          <button onClick={onDismiss} className={classes.closeBtn}>
            <XIcon className={classes.icon} />
          </button>
        </div>
      </NounsTransition>
      <NounsTransition
        nodeRef={modalRef}
        show={show}
        className={classes.modal}
        timeout={200}
        transitionStyes={
          isMobile
            ? mobileModalSlideInFromBottm
            : desktopModalSlideInFromTopAndGrow
        }
      >
        <>{content}</>
      </NounsTransition>
    </>
  )
}

const SolidColorBackgroundModal: React.FC<{
  onDismiss: () => void
  content: React.ReactNode
  show: boolean
}> = (props) => {
  const { onDismiss, content, show } = props

  const backdropRoot = document.getElementById('backdrop-root')
  const overlayRoot = document.getElementById('overlay-root')

  return (
    <>
      {backdropRoot &&
        ReactDOM.createPortal(
          <Backdrop show={show} onDismiss={onDismiss} />,
          backdropRoot,
        )}
      {overlayRoot &&
        ReactDOM.createPortal(
          <SolidColorBackgroundModalOverlay
            show={show}
            onDismiss={onDismiss}
            content={content}
          />,
          overlayRoot,
        )}
    </>
  )
}

export default SolidColorBackgroundModal
