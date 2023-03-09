import { faSortDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Trans } from '@lingui/macro'
import { motion } from 'framer-motion'
import React, { useEffect } from 'react'

import classes from './ExploreNav.module.css'

interface ExploreNavProps {
  nounCount: number
  sortOrder: string
  setSortOrder: (value: string) => void
  handleSortOrderChange: (value: string) => void
}

const ExploreNav: React.FC<ExploreNavProps> = (props) => {
  const sortOptions = [
    {
      label: 'Latest Nouns',
      value: 'date-descending',
    },
    {
      label: 'Oldest Nouns',
      value: 'date-ascending',
    },
  ]

  useEffect(() => {
    props.setSortOrder(sortOptions[0]?.value)
  }, [])

  return (
    <div className={classes.nav}>
      <h3>
        <span>
          <Trans>Explore</Trans>
        </span>{' '}
        {props.nounCount >= 0 && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <strong>{props.nounCount}</strong> Nouns
          </motion.span>
        )}
      </h3>
      <div className={classes.buttons}>
        <div className={classes.sort}>
          <div className={classes.selectWrap}>
            <select
              value={props.sortOrder}
              onChange={(event) =>
                props.handleSortOrderChange(event.target.value)
              }
            >
              {sortOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span>
              <FontAwesomeIcon icon={faSortDown} />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExploreNav
