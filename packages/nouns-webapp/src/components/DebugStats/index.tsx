import React, { Key, useCallback, useEffect, useMemo, useState } from 'react'
import { Button, Collapse } from 'react-bootstrap'

import { useLRUCache } from '@/contexts/cache'
import { useAppSelector } from '@/hooks'
import { ChevronDownIcon } from '@heroicons/react/solid'

import classes from './DebugStats.module.css'

const DebugStats: React.FC = () => {
  const { cacheSize, keyMap, getKeyMap, fetchCache, remainingCacheTime } =
    useLRUCache()

  const {
    totalUpdates,
    totalFetches,
    totalMisses,
    totalRemoved,
    totalNetworkCalls,
  } = useAppSelector((state) => state.cache)

  const [renderIter, setRenderIter] = useState(0)

  const [isExpanded, setIsExpanded] = useState(false)

  const [debugHeaderDisplay, setDebugHeaderDisplay] = useState<JSX.Element>()

  const handleExpandClick = () => {
    setIsExpanded((prev) => !prev)
  }

  const incrementRenderIter = useCallback(() => {
    setRenderIter(renderIter + 1)
  }, [renderIter])

  useEffect(() => {
    setRenderIter((prev) => prev + 1)
  }, [])

  const cacheHitRate = useMemo(
    () =>
      (totalUpdates + totalFetches) /
      (totalUpdates + totalFetches + totalMisses),
    [totalUpdates, totalFetches, totalMisses],
  )
  const cacheHitInfo = `${(!isNaN(cacheHitRate)
    ? cacheHitRate * 100
    : 0
  ).toFixed(2)}%`

  const cacheUpdateRate = useMemo(
    () => totalUpdates / (totalUpdates + totalFetches + totalMisses),
    [totalUpdates, totalFetches, totalMisses],
  )
  const cacheUpdateInfo = `${(!isNaN(cacheUpdateRate)
    ? cacheUpdateRate * 100
    : 0
  ).toFixed(2)}%`

  useEffect(() => {
    setDebugHeaderDisplay(
      <span>
        Render Iteration (<strong>{renderIter}</strong>) : Current Cache (
        hit-rate [<strong>{cacheHitInfo}</strong>] {` `}
        update-rate [<strong>{cacheUpdateInfo}</strong>] {` `}
        size [<strong>{cacheSize}</strong>] ) : API Calls : (
        <strong>{totalNetworkCalls}</strong>) : Keys Removed : (
        <strong>{totalRemoved}</strong>)
      </span>,
    )
  }, [renderIter, cacheHitRate, cacheSize, totalUpdates])

  const [cachedTimes, setCachedTimes] = useState<Record<string, string>>()

  const remainingCacheTimeFormatted = (key: Key) => {
    const remainingTimeInMilliseconds = remainingCacheTime(key)
    const remainingTimeInSeconds = (remainingTimeInMilliseconds / 1000).toFixed(
      1,
    )
    return `${remainingTimeInSeconds} s`
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRenderIter((prevRenderIter) => prevRenderIter + 1)
    }, 1000)
    return () => clearInterval(intervalId)
  }, [fetchCache, getKeyMap])

  useEffect(() => {
    const intervalId = setInterval(() => {
      const newCacheTimes = Object.keys(keyMap).reduce((acc, key) => {
        acc[key] = remainingCacheTimeFormatted(key)
        return acc
      }, {} as Record<string, string>)
      newCacheTimes && setCachedTimes(newCacheTimes)
    }, 100)

    return () => clearInterval(intervalId)
  }, [keyMap, remainingCacheTimeFormatted])

  const cachedKeysTTLDisplay = useMemo(
    () =>
      keyMap &&
      cachedTimes &&
      Object.entries(keyMap).map(([key, value]) => (
        <div key={key}>
          <>
            <strong>
              {key} (
              {cachedTimes && Object(cachedTimes).length > 0
                ? cachedTimes[key]
                : remainingCacheTimeFormatted(key)}
              ):
            </strong>{' '}
            {value}
          </>
        </div>
      )),
    [keyMap, cachedTimes, remainingCacheTimeFormatted],
  )

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          style={{
            fontWeight: 'bold',
            color: 'white',
            background: 'black',
            borderRadius: '1px',
            padding: '2px 8px',
            marginRight: '8px',
          }}
          onClick={incrementRenderIter}
        >
          Update
        </Button>
        {debugHeaderDisplay}
      </div>
      <hr
        style={{ marginTop: '0px', marginBottom: '0px', borderTopWidth: '2px' }}
      />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <button
          onClick={handleExpandClick}
          style={{
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            outline: 'none',
          }}
        >
          <ChevronDownIcon className={classes.chevron} />
        </button>
        <span>Show cache keys with TTL</span>
      </div>
      <Collapse in={isExpanded}>
        <div>
          <hr
            style={{
              marginTop: '0px',
              marginBottom: '0px',
              borderTopWidth: '2px',
            }}
          />
          {cachedKeysTTLDisplay}
        </div>
      </Collapse>
      <hr
        style={{ marginTop: '0px', marginBottom: '0px', borderTopWidth: '2px' }}
      />
    </>
  )
}

export default DebugStats
