import { XIcon } from '@heroicons/react/solid'
import { Trans } from '@lingui/macro'
import cx from 'classnames'
import { BigNumber } from 'ethers'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useMemo, useState } from 'react'
import { Image, Placeholder } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { useSwipeable } from 'react-swipeable'

import { ImageData } from '@nouns/assets'
import type { EncodedImage } from '@nouns/sdk'

import NounInfoRowBirthday from '@/components/NounInfoRowBirthday'
import { getNoun } from '@/components/StandaloneNoun'
import { StandalonePart } from '@/components/StandalonePart'
import { useContractAddresses } from '@/hooks/useAddresses'
import { useConfig } from '@/hooks/useConfig'
import { useNounSeed } from '@/wrappers/nounToken'

import classes from './ExploreNounDetail.module.css'

import loadingNoun from '@/assets/loading-skull-noun.gif'

type Noun = {
  id: number | null
  imgSrc: string | undefined
}

interface ExploreNounDetailProps {
  activeNounId: number
  noun: Noun
  nounCount: number
  handleCloseDetail: () => void
  handleNounNavigation: (toLocation: string) => void
  handleFocusNoun: (nounId: number) => void
  handleScrollTo: (nounId?: number) => void
  selectedNoun?: number
  isVisible: boolean
  setIsNounHoverDisabled: (isHoverDisabled: boolean) => void
  disablePrev: boolean
  disableNext: boolean
}

const ExploreNounDetail: React.FC<ExploreNounDetailProps> = (props) => {
  const { settings } = useConfig()
  const { contractAddresses } = useContractAddresses()

  const [nounImage, setNounUrl] = useState<string | null | undefined>()

  const activeNounId = useMemo(
    () =>
      props.noun && props.noun.id != null && props.noun.id >= 0
        ? props.noun.id
        : null,
    [props.noun],
  )

  const seedId = useMemo(
    () => (activeNounId ? BigNumber.from(activeNounId) : BigNumber.from(0)),
    [activeNounId],
  )

  const seedCall = useNounSeed(contractAddresses, seedId)
  const seed = useMemo(() => seedCall, [seedCall])

  const activeNounImage = useMemo(
    () => (props.noun && props.noun.imgSrc != null ? props.noun.imgSrc : null),
    [props.noun],
  )

  const bgcolors = ['#d5d7e1', '#e1d7d5']
  const backgroundColor = seed ? bgcolors[seed.background] : bgcolors[0]
  const [width, setWidth] = useState<number>(window.innerWidth)
  const isMobile: boolean = width <= 991
  const handleWindowSizeChange = () => {
    setWidth(window.innerWidth)
  }

  useEffect(() => {
    ;(async () => {
      setNounUrl(loadingNoun)
      if (activeNounId === null) return

      let url: URL | null
      try {
        url = activeNounImage
          ? new URL(activeNounImage)
          : new URL(`${activeNounId}.svg`, settings.nounsPicsUrl)
        if (!(await fetch(url.href)).ok) return setNounUrl(null)
        return setNounUrl(url.href)
      } catch (error) {
        return setNounUrl(null)
      }
    })()
  }, [activeNounImage, activeNounId, settings.nounsPicsUrl])

  const getNounImage = useMemo(
    () =>
      nounImage === null && seedId && seed
        ? getNoun(seedId, seed).image
        : loadingNoun,
    [seedId, seed, nounImage],
  )

  useEffect(() => {
    window.addEventListener(
      'resize',
      handleWindowSizeChange,
      // { passive: false }
    )

    return () => {
      window.removeEventListener('resize', handleWindowSizeChange)
    }
  }, [])

  // Modified from playground function to remove dashes in filenames
  const parseTraitName = (partName: string): string =>
    capitalizeFirstLetter(
      partName.substring(partName.indexOf('-') + 1).replace(/-/g, ' '),
    )
  const capitalizeFirstLetter = (s: string): string =>
    s.charAt(0).toUpperCase() + s.slice(1)

  const traitKeyToLocalizedTraitKeyFirstLetterCapitalized = (
    s: string,
  ): JSX.Element => {
    const traitMap = new Map([
      ['background', <Trans key={s}>Background</Trans>],
      ['body', <Trans key={s}>Body</Trans>],
      ['accessory', <Trans key={s}>Accessory</Trans>],
      ['head', <Trans key={s}>Head</Trans>],
      ['glasses', <Trans key={s}>Glasses</Trans>],
    ])
    return traitMap.get(s) ?? <></>
  }

  const traitTypeKeys = (s: string) => {
    const traitMap = new Map([
      ['background', 'backgrounds'],
      ['body', 'bodies'],
      ['accessory', 'accessories'],
      ['head', 'heads'],
      ['glasses', 'glasses'],
    ])
    const result = traitMap.get(s)
    if (result) {
      return result
    } else {
      throw new Error(`Trait key for ${s} not found`)
    }
  }

  const traitNames = [
    ['cool', 'warm'],
    ...Object.values(ImageData.images).map((i: EncodedImage[]) => {
      return i.map((imageData: EncodedImage) => imageData.filename)
    }),
  ]

  const getOrderedTraits = (seed: {
    head: number
    glasses: number
    accessory: number
    body: number
    background: number
  }) => {
    let nounTraitsOrdered
    const loadingNounTraits = [
      {
        partType: 'head',
        partName: 'Skull',
        partIndex: -1,
      },
      {
        partType: 'glasses',
        partName: 'Processing',
        partIndex: -1,
      },
      {
        partType: 'accessory',
        partName: 'Loading',
        partIndex: -1,
      },
      {
        partType: 'body',
        partName: 'Placeholder',
        partIndex: -1,
      },
      {
        partType: 'background',
        partName: 'cool',
        partIndex: -1,
      },
    ]

    const verifyTrait = (index?: string) => {
      return index && parseTraitName(index)
    }

    if (seed) {
      nounTraitsOrdered = [
        {
          partType: 'head',
          partName: verifyTrait(traitNames[3]?.[seed.head]),
          partIndex: seed.head,
        },
        {
          partType: 'glasses',
          partName: verifyTrait(traitNames[4]?.[seed.glasses]),
          partIndex: seed.glasses,
        },
        {
          partType: 'accessory',
          partName: verifyTrait(traitNames[2]?.[seed.accessory]),
          partIndex: seed.accessory,
        },
        {
          partType: 'body',
          partName: verifyTrait(traitNames[1]?.[seed.body]),
          partIndex: seed.body,
        },
        {
          partType: 'background',
          partName: verifyTrait(traitNames[0]?.[seed.background]),
          partIndex: seed.background,
        },
      ]
    }

    if (nounTraitsOrdered) {
      return nounTraitsOrdered
    } else {
      return loadingNounTraits
    }
  }

  const handlers = useSwipeable({
    onSwipedLeft: () =>
      !props.disableNext && props.handleNounNavigation('next'),
    onSwipedRight: () =>
      !props.disablePrev && props.handleNounNavigation('prev'),
    swipeDuration: 500,
    preventScrollOnSwipe: true,
    trackMouse: true,
  })

  const nounTraitsOrdered = seed && getOrderedTraits(seed)
  const handleAnimationStart = () => {
    props.setIsNounHoverDisabled(true)
  }

  const handleAnimationComplete = () => {
    props.handleScrollTo(props.selectedNoun)
  }

  const motionVariants = {
    initial: {
      width: isMobile ? '100%' : '0%',
      x: isMobile ? 100 : 0,
    },
    animate: {
      width: isMobile ? '100%' : '33%',
      x: 0,
    },
    exit: {
      width: isMobile ? '100%' : '0%',
      x: isMobile ? 100 : 0,
      transition: {
        duration: isMobile ? 0.05 : 0.025,
      },
    },
  }

  return (
    <>
      <AnimatePresence>
        {isMobile && (
          <motion.div
            className={classes.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          ></motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className={classes.detailWrap}
        style={{
          background: backgroundColor,
        }}
        variants={motionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        onAnimationStart={() => handleAnimationStart()}
        onAnimationComplete={(definition) => {
          !isMobile && definition === 'animate' && handleAnimationComplete()
          !isMobile &&
            definition === 'exit' &&
            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
        }}
        {...handlers}
      >
        <motion.div
          className={classes.detail}
          style={{
            background: `${backgroundColor} !important`,
          }}
          exit={{
            opacity: !isMobile ? 0 : 1,
            transition: {
              duration: 0.01,
            },
          }}
        >
          <button
            className={classes.close}
            onClick={() => props.handleCloseDetail()}
          >
            <XIcon className={classes.icon} />
          </button>
          <button
            className={classes.detailNounImage}
            onClick={() => props.handleScrollTo(props.selectedNoun)}
            role="link"
          >
            {activeNounId !== null ? (
              <Image
                src={nounImage ?? getNounImage}
                alt={`Noun ${activeNounId}`}
              />
            ) : (
              <Image src={loadingNoun} alt="Loading noun" />
            )}
          </button>

          <div className={classes.nounDetails}>
            <div className={classes.infoWrap}>
              <button
                onClick={() => props.handleNounNavigation('prev')}
                className={cx(
                  classes.arrow,
                  backgroundColor === bgcolors[0]
                    ? classes.arrowCool
                    : classes.arrowWarm,
                )}
                disabled={props.disablePrev}
              >
                ←
              </button>
              <div className={classes.nounBirthday}>
                {activeNounId !== null && seed ? (
                  <>
                    <h2>Noun {activeNounId}</h2>
                    <NounInfoRowBirthday nounId={activeNounId} />
                  </>
                ) : (
                  <h2>Loading</h2>
                )}
              </div>
              <button
                onClick={() => props.handleNounNavigation('next')}
                className={cx(
                  classes.arrow,
                  backgroundColor === bgcolors[0]
                    ? classes.arrowCool
                    : classes.arrowWarm,
                )}
                disabled={props.disableNext}
              >
                →
              </button>
            </div>

            <ul className={classes.traitsList}>
              {nounTraitsOrdered &&
                Object.values(nounTraitsOrdered).map((part, index) => {
                  const nounsTraitsOrderedIndex = nounTraitsOrdered[index]
                  const partType =
                    nounsTraitsOrderedIndex &&
                    traitTypeKeys(nounsTraitsOrderedIndex.partType)
                  return (
                    <li key={partType} id={partType}>
                      <div
                        className={classes.thumbnail}
                        style={{
                          backgroundColor: backgroundColor
                            ? backgroundColor
                            : 'transparent',
                        }}
                      >
                        <AnimatePresence>
                          {activeNounId !== null && seed && partType && (
                            <StandalonePart
                              partType={partType}
                              partIndex={part.partIndex}
                            />
                          )}
                        </AnimatePresence>
                      </div>

                      <div className={classes.description}>
                        <p className="small">
                          <AnimatePresence>
                            {activeNounId !== null && seed ? (
                              <motion.span>
                                {nounsTraitsOrderedIndex &&
                                  traitKeyToLocalizedTraitKeyFirstLetterCapitalized(
                                    nounsTraitsOrderedIndex.partType,
                                  )}
                              </motion.span>
                            ) : (
                              <motion.span>
                                <Placeholder as="span" animation="glow">
                                  <Placeholder xs={8} />
                                </Placeholder>
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </p>
                        <p>
                          <strong>
                            <AnimatePresence>
                              {activeNounId !== null &&
                              seed &&
                              nounsTraitsOrderedIndex ? (
                                <>{nounsTraitsOrderedIndex.partName}</>
                              ) : (
                                <Placeholder xs={12} animation="glow" />
                              )}
                            </AnimatePresence>
                          </strong>
                        </p>
                      </div>
                    </li>
                  )
                })}
            </ul>
            {activeNounId !== null && seed && (
              <p className={classes.activityLink}>
                <Link to={`/noun/${activeNounId}`}>
                  <Trans>Vote history</Trans>
                </Link>
              </p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </>
  )
}

export default ExploreNounDetail
