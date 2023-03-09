import cx from 'classnames'
import React, { useCallback, useEffect, useState } from 'react'
import { Placeholder } from 'react-bootstrap'

import { useConfig } from '@/hooks/useConfig'

import ExploreGridItem from './ExploreGridItem'

import classes from './ExploreGrid.module.css'

interface ExploreGridProps {
  nounCount: number
  activeNoun: number
  selectedNoun: number | undefined
  setActiveNoun: (nounId: number) => void
  setSelectedNoun: (selectedNoun: number) => void
  setNounsList: (set: (arr: Noun[]) => Noun[]) => void
  handleFocusNoun: (nounId: number) => void
  isNounHoverDisabled: boolean
  nounsList: Noun[]
  sortOrder: string
  buttonsRef: React.MutableRefObject<(HTMLButtonElement | null)[]>
}

// noun.pics object
type NounPic = {
  id: number | null
  svg: string | undefined
}

type Noun = {
  id: number | null
  imgSrc: string | undefined
}

const ExploreGrid: React.FC<ExploreGridProps> = (props) => {
  const {
    nounCount,
    selectedNoun,
    setActiveNoun,
    setNounsList,
    handleFocusNoun,
    isNounHoverDisabled,
    nounsList,
    sortOrder,
    buttonsRef,
  } = props

  const [individualNouns, setIndividualNouns] = useState<Noun[]>([])
  const placeholderNoun: Noun = { id: null, imgSrc: undefined }

  const { settings } = useConfig()

  // Handle events
  const getInitialNouns = useCallback(
    (individualCount: number) => {
      // Fetch initial nouns by url
      const nouns = new Array(individualCount)
        .fill(placeholderNoun)

        .map((x, i): Noun => {
          return {
            id: i + (nounCount - individualCount),
            imgSrc: new URL(
              `${i + (nounCount - individualCount)}.svg`,
              settings.nounsPicsUrl,
            ).href,
          }
        })
        .reverse()

      setIndividualNouns(nouns)
      // After initial nouns are set, run range calls
      rangeCalls(nounCount)

      // Ensure only Nouns with positive IDs are processed
      const filteredNouns = nouns.filter(
        (n) => n.id !== undefined && n.id !== null && n.id >= 0,
      )

      // Add initial nouns to end of placeholder array to display them first on load
      setNounsList((arr: Noun[]) => [...filteredNouns, ...arr])
    },
    [settings, nounCount],
  )

  // Range calls
  const initialChunkSize = 10
  const rangeChunkSize = 100
  const rangeCalls = useCallback(
    async (nounCount: number) => {
      if (nounCount >= 0) {
        for (
          let i = nounCount - individualNouns.length;
          i >= 0;
          i -= rangeChunkSize
        ) {
          const start = i - rangeChunkSize < 0 ? 0 : i - rangeChunkSize
          const end = i - 1
          const nounsRange = await fetchNouns(start, end)
          console.debug(`fetching Nouns Pics: ${nounsRange}`)
        }
      }
    },
    [nounCount, individualNouns],
  )

  const fetchNouns = useCallback(
    async (start: number, end: number) => {
      const url = new URL(
        `range?start=${start}&end=${end}`,
        settings.nounsPicsUrl,
      )
      try {
        const response = await fetch(url.href)
        const json = await response.json()
        // Convert noun.pic svg key to generic imgSrc key

        const rangeNouns: Noun[] = json
          .reverse()
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .map((noun: NounPic, i: number) => {
            return {
              id: noun.id,
              imgSrc: noun.svg,
            }
          })

        setNounsList((arr: Noun[]) => {
          let sliced = arr.slice(0, nounCount - 1 - end).concat(rangeNouns)
          // if list is only individual nouns + placeholders
          // keep individual nouns, clear others and replace with ranges
          if (
            individualNouns &&
            individualNouns.length > 0 &&
            arr[individualNouns.length + 1]?.id === null
          ) {
            sliced = arr.slice(0, individualNouns.length).concat(rangeNouns)
          }
          return sliced
        })

        return rangeNouns
      } catch (error) {
        console.error(
          error instanceof Error ? error.message : `Unknown Error: ${error}`,
        )
        return null
      }
    },
    [nounCount, setNounsList, individualNouns, rangeCalls],
  )

  // Once nounCount is known, run dependent functions
  useEffect(() => {
    const placeholderNounsData = new Array(rangeChunkSize)
      .fill(placeholderNoun)

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .map((x: number, i: number): Noun => {
        return {
          id: null,
          imgSrc: undefined,
        }
      })
    setNounsList((arr: Noun[]) => [...placeholderNounsData, ...arr])

    if (nounCount >= 0) {
      getInitialNouns((nounCount % initialChunkSize) + 1)
    }
  }, [nounCount])

  return (
    <div
      className={cx(
        classes.exploreGrid,
        ((selectedNoun !== undefined && selectedNoun < 0) ||
          selectedNoun === undefined) &&
          nounCount >= 0 &&
          classes.sidebarHidden,
      )}
    >
      <ul>
        {(sortOrder === 'date-ascending'
          ? [...nounsList].reverse()
          : nounsList
        ).map((noun, i) => {
          return (
            <li
              className={noun.id === selectedNoun ? classes.activeNoun : ''}
              key={i}
            >
              <button
                ref={(el) => (buttonsRef.current[noun.id ? noun.id : -1] = el)}
                key={`${i}${noun.id}`}
                onClick={() => noun.id !== null && handleFocusNoun(noun.id)}
                onFocus={() => noun.id !== null && handleFocusNoun(noun.id)}
                onMouseOver={() =>
                  !isNounHoverDisabled &&
                  noun.id !== null &&
                  setActiveNoun(noun.id)
                }
                onMouseOut={() =>
                  selectedNoun !== undefined && setActiveNoun(selectedNoun)
                }
                onBlur={() =>
                  selectedNoun !== undefined && setActiveNoun(selectedNoun)
                }
              >
                <ExploreGridItem nounId={noun.id} imgSrc={noun.imgSrc} />
                <p className={classes.nounIdOverlay}>
                  {noun.id != null ? (
                    noun.id
                  ) : (
                    <Placeholder xs={12} animation="glow" />
                  )}
                </p>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default ExploreGrid
