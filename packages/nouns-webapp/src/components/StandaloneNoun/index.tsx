import { BigNumber as EthersBN } from 'ethers'
import React, { useCallback, useEffect, useMemo } from 'react'
import { Image } from 'react-bootstrap'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'

import { getNounData, ImageData as data } from '@nouns/assets'
import { buildSVG } from '@nouns/sdk'

import Noun from '@/components/Noun'
import { useContractAddresses } from '@/hooks/useAddresses'
import { setOnDisplayAuctionNounId } from '@/state/slices/onDisplayAuction'
import { INounSeed, useNounSeed } from '@/wrappers/nounToken'
import { setStateBackgroundColor } from '@/state/slices/application'
import { beige, grey } from '@/utils/nounBgColors'

// tslint:disable:ordered-imports
import classes from './StandaloneNoun.module.css'
import nounClasses from '../Noun/Noun.module.css'

interface StandaloneNounProps {
  nounId: EthersBN
}
interface StandaloneCircularNounProps {
  nounId: EthersBN
  border?: boolean
}

interface StandaloneNounWithSeedProps {
  nounId: EthersBN
  shouldLinkToProfile: boolean
}

export const getNoun = (nounId: string | EthersBN, seed: INounSeed) => {
  const id = nounId.toString()
  const name = `Noun ${id}`
  const description = `Noun ${id} is a member of the Nouns DAO`
  const { parts, background } = getNounData(seed)
  const image = `data:image/svg+xml;base64,${btoa(
    buildSVG(parts, data.palette, background),
  )}`

  return {
    name,
    description,
    image,
  }
}

export const StandaloneNounImage: React.FC<StandaloneNounProps> = (
  props: StandaloneNounProps,
) => {
  const { nounId } = props
  const { contractAddresses } = useContractAddresses()
  const seedCall = useNounSeed(contractAddresses, nounId)
  const seed = useMemo(() => seedCall, [seedCall])
  const noun = seed && getNoun(nounId, seed)

  return <Image src={noun ? noun.image : ''} fluid />
}

const StandaloneNoun: React.FC<StandaloneNounProps> = (
  props: StandaloneNounProps,
) => {
  const { nounId } = props
  const { contractAddresses } = useContractAddresses()
  const seedCall = useNounSeed(contractAddresses, nounId)
  const seed = useMemo(() => seedCall, [seedCall])
  const noun = seed && getNoun(nounId, seed)

  const dispatch = useDispatch()

  const onClickHandler = useCallback(() => {
    dispatch(setOnDisplayAuctionNounId(nounId.toNumber()))
  }, [dispatch, nounId])

  return (
    <Link
      to={'/noun/' + nounId.toString()}
      className={classes.clickableNoun}
      onClick={onClickHandler}
    >
      <Noun
        imgPath={noun ? noun.image : ''}
        alt={noun ? noun.description : 'Noun'}
      />
    </Link>
  )
}

export const StandaloneNounCircular: React.FC<StandaloneCircularNounProps> = (
  props: StandaloneCircularNounProps,
) => {
  const { nounId, border } = props
  const { contractAddresses } = useContractAddresses()
  const seedCall = useNounSeed(contractAddresses, nounId)
  const seed = useMemo(() => seedCall, [seedCall])
  const noun = seed && getNoun(nounId, seed)

  const dispatch = useDispatch()
  const onClickHandler = useCallback(() => {
    dispatch(setOnDisplayAuctionNounId(nounId.toNumber()))
  }, [dispatch, nounId])

  if (!seed || !nounId) return <Noun imgPath="" alt="Noun" />

  return (
    <Link
      to={'/noun/' + nounId.toString()}
      className={classes.clickableNoun}
      onClick={onClickHandler}
    >
      <Noun
        imgPath={noun ? noun.image : ''}
        alt={noun ? noun.description : 'Noun'}
        wrapperClassName={nounClasses.circularNounWrapper}
        className={border ? nounClasses.circleWithBorder : nounClasses.circular}
      />
    </Link>
  )
}

export const StandaloneNounRoundedCorners: React.FC<StandaloneNounProps> = (
  props: StandaloneNounProps,
) => {
  const { nounId } = props
  const { contractAddresses } = useContractAddresses()
  const seedCall = useNounSeed(contractAddresses, nounId)
  const seed = useMemo(() => seedCall, [seedCall])
  const noun = seed && getNoun(nounId, seed)

  const dispatch = useDispatch()
  const onClickHandler = useCallback(() => {
    dispatch(setOnDisplayAuctionNounId(nounId.toNumber()))
  }, [dispatch, nounId])

  return (
    <Link
      to={'/noun/' + nounId.toString()}
      className={classes.clickableNoun}
      onClick={onClickHandler}
    >
      <Noun
        imgPath={noun ? noun.image : ''}
        alt={noun ? noun.description : 'Noun'}
        className={nounClasses.rounded}
      />
    </Link>
  )
}

export const StandaloneNounWithSeed: React.FC<StandaloneNounWithSeedProps> = (
  props: StandaloneNounWithSeedProps,
) => {
  const { nounId, shouldLinkToProfile } = props

  const dispatch = useDispatch()
  const { contractAddresses } = useContractAddresses()

  const seedCall = useNounSeed(contractAddresses, nounId)
  const seed = useMemo(() => seedCall, [seedCall])
  const seedIsInvalid = Object.values(seed || {}).every((v) => v === 0)

  useEffect(() => {
    dispatch(setStateBackgroundColor(seed?.background === 0 ? grey : beige))
  }, [seed])

  const onClickHandler = useCallback(() => {
    dispatch(setOnDisplayAuctionNounId(nounId.toNumber()))
  }, [dispatch, nounId])

  if (!seed || seedIsInvalid || !nounId) return <Noun imgPath="" alt="Noun" />

  const { image, description } = getNoun(nounId, seed)

  const noun = <Noun imgPath={image} alt={description} />
  const nounWithLink = (
    <Link
      to={'/noun/' + nounId.toString()}
      className={classes.clickableNoun}
      onClick={onClickHandler}
    >
      {noun}
    </Link>
  )
  return shouldLinkToProfile ? nounWithLink : noun
}

export default StandaloneNoun
