import { i18n } from '@lingui/core'
import { Trans } from '@lingui/macro'
import { PNG } from 'pngjs'
import React, {
  ChangeEvent,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  Button,
  Col,
  Container,
  FloatingLabel,
  Form,
  Image,
  OverlayTrigger,
  Popover,
  Row,
} from 'react-bootstrap'

import { getNounData, getRandomNounSeed, ImageData } from '@nouns/assets'
import { buildSVG, PNGCollectionEncoder, type EncodedImage } from '@nouns/sdk'

import Link from '@/components/Link'
import Noun from '@/components/Noun'
import NounModal from './NounModal'

import classes from './Playground.module.css'

import InfoIcon from '@/assets/icons/Info.svg'

interface Trait {
  title: string
  traitNames: string[]
}

interface PendingCustomTrait {
  type: string
  data: string
  filename: string
}

const nounsProtocolLink = (
  <Link
    text={<Trans>Nouns Protocol</Trans>}
    url="https://www.notion.so/Noun-Protocol-32e4f0bf74fe433e927e2ea35e52a507"
    leavesPage={true}
  />
)

const nounsAssetsLink = (
  <Link
    text="nouns-assets"
    url="https://github.com/nounsDAO/nouns-monorepo/tree/master/packages/nouns-assets"
    leavesPage={true}
  />
)

const nounsSDKLink = (
  <Link
    text="nouns-sdk"
    url="https://github.com/nounsDAO/nouns-monorepo/tree/master/packages/nouns-sdk"
    leavesPage={true}
  />
)

const DEFAULT_TRAIT_TYPE = 'heads'

const encoder = ImageData && new PNGCollectionEncoder(ImageData.palette)

const traitKeyToTitle: Record<string, string> = {
  heads: 'head',
  glasses: 'glasses',
  bodies: 'body',
  accessories: 'accessory',
}

const parseTraitName = (partName: string): string =>
  capitalizeFirstLetter(partName.substring(partName.indexOf('-') + 1))

const capitalizeFirstLetter = (s: string): string =>
  s.charAt(0).toUpperCase() + s.slice(1)

const traitKeyToLocalizedTraitKeyFirstLetterCapitalized = (
  s: string,
): ReactNode => {
  const traitMap = new Map([
    ['background', <Trans key={s}>Background</Trans>],
    ['body', <Trans key={s}>Body</Trans>],
    ['accessory', <Trans key={s}>Accessory</Trans>],
    ['head', <Trans key={s}>Head</Trans>],
    ['glasses', <Trans key={s}>Glasses</Trans>],
  ])

  return traitMap.get(s)
}

const PlaygroundPage: React.FC = () => {
  const [nounSvgs, setNounSvgs] = useState<string[]>()
  const [traits, setTraits] = useState<Trait[]>()
  const [modSeed, setModSeed] = useState<{ [key: string]: number }>()
  const [initLoad, setInitLoad] = useState<boolean>(true)
  const [displayNoun, setDisplayNoun] = useState<boolean>(false)
  const [indexOfNounToDisplay, setIndexOfNounToDisplay] = useState<number>()
  const [selectIndexes, setSelectIndexes] = useState<Record<string, number>>({})
  const [pendingTrait, setPendingTrait] = useState<PendingCustomTrait>()
  const [isPendingTraitValid, setPendingTraitValid] = useState<boolean>()

  const customTraitFileRef = useRef<HTMLInputElement>(null)

  const generateNounSvg = React.useCallback(
    (amount = 1) => {
      for (let i = 0; i < amount; i++) {
        const seed = { ...getRandomNounSeed(), ...modSeed }
        const { parts, background } = getNounData(seed)
        const svg = buildSVG(parts, encoder.data.palette, background)
        setNounSvgs((prev) => {
          return prev ? [svg, ...prev] : [svg]
        })
      }
    },
    [pendingTrait, modSeed],
  )

  useEffect(() => {
    const traitTitles = ['background', 'body', 'accessory', 'head', 'glasses']
    const traitNames = [
      ['cool', 'warm'],
      ...Object.values(ImageData.images).map((i: EncodedImage[]) => {
        return i.map((imageData: EncodedImage) => imageData.filename)
      }),
    ]
    setTraits(
      traitTitles.map((value, index) => {
        return {
          title: value,
          traitNames: traitNames[index],
        }
      }),
    )

    if (initLoad) {
      generateNounSvg(8)
      setInitLoad(false)
    }
  }, [generateNounSvg, initLoad])

  const traitOptions = (trait: Trait) => {
    return Array.from(Array(trait.traitNames.length + 1)).map((_, index) => {
      const traitName = trait.traitNames[index - 1]
      if (!traitName) return null
      const parsedTitle = index === 0 ? `Random` : parseTraitName(traitName)
      return (
        <option key={index} value={traitName}>
          {parsedTitle}
        </option>
      )
    })
  }

  const traitButtonHandler = (trait: Trait, traitIndex: number) => {
    setModSeed((prev) => {
      // -1 traitIndex = random
      if (traitIndex < 0) {
        const state = { ...prev }
        delete state[trait.title]
        return state
      }
      return {
        ...prev,
        [trait.title]: traitIndex,
      }
    })
  }

  const resetTraitFileUpload = () => {
    if (customTraitFileRef.current) {
      customTraitFileRef.current.value = ''
    }
  }

  let pendingTraitErrorTimeout: NodeJS.Timeout
  const setPendingTraitInvalid = () => {
    setPendingTraitValid(false)
    resetTraitFileUpload()
    pendingTraitErrorTimeout = setTimeout(() => {
      setPendingTraitValid(undefined)
    }, 5_000)
  }

  const validateAndSetCustomTrait = (file: File | undefined) => {
    if (pendingTraitErrorTimeout) {
      clearTimeout(pendingTraitErrorTimeout)
    }
    if (!file) {
      return
    }

    const reader = new FileReader()

    const stringToArrayBuffer = (data: string | ArrayBuffer): ArrayBuffer => {
      if (typeof data === 'string') {
        const encoder = new TextEncoder()
        return encoder.encode(data).buffer
      }
      return data
    }

    reader.onload = (e) => {
      try {
        const decoder = new TextDecoder()
        if (!e?.target?.result) return

        const buffer = Buffer.from(
          decoder.decode(stringToArrayBuffer(e.target.result)),
        )

        const png = PNG.sync.read(buffer)
        if (png.width !== 32 || png.height !== 32) {
          throw new Error('Image must be 32x32')
        }
        const filename = file.name?.replace('.png', '') || 'custom'
        const data = encoder.encodeImage(filename, {
          width: png.width,
          height: png.height,
          rgbaAt: (x: number, y: number) => {
            const idx = (png.width * y + x) << 2
            const [r, g, b, a] = [
              png.data[idx],
              png.data[idx + 1],
              png.data[idx + 2],
              png.data[idx + 3],
            ]
            return {
              r: r ?? 0,
              g: g ?? 0,
              b: b ?? 0,
              a: a ?? 0,
            }
          },
        })
        setPendingTrait({
          data,
          filename,
          type: DEFAULT_TRAIT_TYPE,
        })
        setPendingTraitValid(true)
      } catch (error) {
        setPendingTraitInvalid()
      }
    }
    reader.readAsArrayBuffer(file)
  }

  const uploadCustomTrait = () => {
    const { type, data, filename } = pendingTrait || {}
    if (type && data && filename) {
      const images = ImageData.images as Record<string, EncodedImage[]>
      const imagesType = images[type]
      imagesType &&
        imagesType.unshift({
          filename,
          data,
        })
      const title = traitKeyToTitle[type]
      const trait = traits?.find((t) => t.title === title)

      resetTraitFileUpload()
      setPendingTrait(undefined)
      setPendingTraitValid(undefined)
      trait && traitButtonHandler(trait, 0)
      title &&
        setSelectIndexes({
          ...selectIndexes,
          [title]: 0,
        })
    }
  }

  const nounSvg =
    indexOfNounToDisplay && nounSvgs && nounSvgs[indexOfNounToDisplay]
  return (
    <>
      {displayNoun && nounSvg && (
        <NounModal
          onDismiss={() => {
            setDisplayNoun(false)
          }}
          svg={nounSvg}
        />
      )}

      <Container fluid="lg">
        <Row>
          <Col lg={10} className={classes.headerRow}>
            <span>
              <Trans>Explore</Trans>
            </span>
            <h1>
              <Trans>Playground</Trans>
            </h1>
            <p>
              <Trans>
                The playground was built using the {nounsProtocolLink}.
                Noun&apos;s traits are determined by the Noun Seed. The seed was
                generated using {nounsAssetsLink} and rendered using the{' '}
                {nounsSDKLink}.
              </Trans>
            </p>
          </Col>
        </Row>
        <Row>
          <Col lg={3}>
            <Col lg={12}>
              <Button
                onClick={() => {
                  generateNounSvg()
                }}
                className={classes.primaryBtn}
              >
                <Trans>Generate Nouns</Trans>
              </Button>
            </Col>
            <Row>
              {traits &&
                traits.map((trait, index) => {
                  const traitIdx = selectIndexes?.[trait.title]
                  return (
                    <Col key={index} lg={12} xs={6}>
                      <Form className={classes.traitForm}>
                        <FloatingLabel
                          controlId="floatingSelect"
                          label={traitKeyToLocalizedTraitKeyFirstLetterCapitalized(
                            trait.title,
                          )}
                          key={index}
                          className={classes.floatingLabel}
                        >
                          <Form.Select
                            aria-label="Floating label select example"
                            className={classes.traitFormBtn}
                            value={traitIdx ? trait.traitNames[traitIdx] : -1}
                            onChange={(e) => {
                              const index = e.currentTarget.selectedIndex
                              traitButtonHandler(trait, index - 1) // - 1 to account for 'random'
                              setSelectIndexes({
                                ...selectIndexes,
                                [trait.title]: index - 1,
                              })
                            }}
                          >
                            {traitOptions(trait)}
                          </Form.Select>
                        </FloatingLabel>
                      </Form>
                    </Col>
                  )
                })}
            </Row>
            <label
              style={{ margin: '1rem 0 .25rem 0' }}
              htmlFor="custom-trait-upload"
            >
              <Trans>Upload Custom Trait</Trans>
              <OverlayTrigger
                trigger={['hover', 'focus']}
                placement="top"
                overlay={
                  <Popover>
                    <div style={{ padding: '0.25rem' }}>
                      <Trans>Only 32x32 PNG images are accepted</Trans>
                    </div>
                  </Popover>
                }
              >
                <Image
                  style={{ margin: '0 0 .25rem .25rem' }}
                  src={InfoIcon}
                  className={classes.voteIcon}
                />
              </OverlayTrigger>
            </label>
            <Form.Control
              type="file"
              id="custom-trait-upload"
              accept="image/PNG"
              isValid={isPendingTraitValid}
              isInvalid={isPendingTraitValid === false}
              ref={customTraitFileRef}
              className={classes.fileUpload}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                validateAndSetCustomTrait(e.target.files?.[0])
              }
            />
            {pendingTrait && (
              <>
                <FloatingLabel
                  label="Custom Trait Type"
                  className={classes.floatingLabel}
                >
                  <Form.Select
                    aria-label="Custom Trait Type"
                    className={classes.traitFormBtn}
                    onChange={(e) =>
                      setPendingTrait({ ...pendingTrait, type: e.target.value })
                    }
                  >
                    {Object.entries(traitKeyToTitle).map(([key, title]) => (
                      <option key={key} value={key}>
                        {capitalizeFirstLetter(title)}
                      </option>
                    ))}
                  </Form.Select>
                </FloatingLabel>
                <Button
                  onClick={() => uploadCustomTrait()}
                  className={classes.primaryBtn}
                >
                  <Trans>Upload</Trans>
                </Button>
              </>
            )}
            <p className={classes.nounYearsFooter}>
              <Trans>
                You&apos;ve generated{' '}
                {i18n.number(
                  parseInt(nounSvgs ? (nounSvgs.length / 365).toFixed(2) : '0'),
                )}{' '}
                years worth of Nouns
              </Trans>
            </p>
          </Col>
          <Col lg={9}>
            <Row>
              {nounSvgs &&
                nounSvgs.map((svg, i) => {
                  return (
                    <Col xs={4} lg={3} key={i}>
                      <div
                        onClick={() => {
                          setIndexOfNounToDisplay(i)
                          setDisplayNoun(true)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setIndexOfNounToDisplay(i)
                            setDisplayNoun(true)
                          }
                        }}
                        role="button"
                        tabIndex={0}
                      >
                        <Noun
                          imgPath={`data:image/svg+xml;base64,${btoa(svg)}`}
                          alt="noun"
                          className={classes.nounImg}
                          wrapperClassName={classes.nounWrapper}
                        />
                      </div>
                    </Col>
                  )
                })}
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  )
}
export default PlaygroundPage
