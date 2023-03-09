import React, { useEffect, useState } from 'react'
import { Button } from 'react-bootstrap'
import ReactDOM from 'react-dom'

import { Backdrop } from '@/components/Modal'
import Noun from '@/components/Noun'
import { svg2png } from '@/utils/svg2png'

import classes from './NounModal.module.css'

const downloadNounPNG = (png: string) => {
  const downloadEl = document.createElement('a')
  downloadEl.href = png
  downloadEl.download = 'noun.png'
  downloadEl.click()
}

const NounModal: React.FC<{ onDismiss: () => void; svg: string }> = (props) => {
  const { onDismiss, svg } = props

  const [width, setWidth] = useState<number>(window.innerWidth)
  const [png, setPng] = useState<string | null>()

  const isMobile: boolean = width <= 991

  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth)
  }

  useEffect(() => {
    window.addEventListener(
      'resize',
      handleWindowSizeChange,
      // { passive: false }
    )

    const loadPng = async () => {
      setPng(await svg2png(svg, 512, 512))
    }
    loadPng()

    return () => {
      window.removeEventListener('resize', handleWindowSizeChange)
    }
  }, [svg])

  const backdropRoot = document.getElementById('backdrop-root')
  const overlayRoot = document.getElementById('overlay-root')

  return (
    <>
      {backdropRoot &&
        ReactDOM.createPortal(
          <Backdrop
            onDismiss={() => {
              onDismiss()
            }}
          />,
          backdropRoot,
        )}
      {overlayRoot &&
        ReactDOM.createPortal(
          <div className={classes.modal}>
            {png && (
              <Noun
                imgPath={png}
                alt="noun"
                className={classes.nounImg}
                wrapperClassName={classes.nounWrapper}
              />
            )}
            <div className={classes.displayNounFooter}>
              <span>Use this Noun as your profile picture!</span>
              {!isMobile && png && (
                <Button
                  onClick={() => {
                    downloadNounPNG(png)
                  }}
                >
                  Download
                </Button>
              )}
            </div>
          </div>,
          overlayRoot,
        )}
    </>
  )
}
export default NounModal
