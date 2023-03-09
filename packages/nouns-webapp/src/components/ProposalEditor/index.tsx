import { Trans } from '@lingui/macro'
import React, { useState } from 'react'
import { FormControl, FormText, InputGroup } from 'react-bootstrap'
import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'

import classes from './ProposalEditor.module.css'

interface ProposalEditorProps {
  title: string
  body: string
  onTitleInput: (title: string) => void
  onBodyInput: (body: string) => void
}

const ProposalEditor: React.FC<ProposalEditorProps> = ({
  title,
  body,
  onTitleInput,
  onBodyInput,
}: ProposalEditorProps) => {
  const bodyPlaceholder = `## Summary\n\nInsert your summary here\n\n## Methodology\n\nInsert your methodology here\n\n## Conclusion\n\nInsert your conclusion here`
  const [proposalText, setProposalText] = useState('')

  const onBodyChange = (body: string) => {
    setProposalText(body)
    onBodyInput(body)
  }

  return (
    <div>
      <InputGroup className={`${classes.proposalEditor} d-flex flex-column`}>
        <FormText>
          <Trans>Proposal</Trans>
        </FormText>
        <FormControl
          className={classes.titleInput}
          value={title}
          onChange={(e) => onTitleInput(e.target.value)}
          placeholder="Proposal Title"
        />
        <hr className={classes.divider} />
        <FormControl
          className={classes.bodyInput}
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          as="textarea"
          placeholder={bodyPlaceholder}
        />
      </InputGroup>
      {proposalText !== '' && (
        <div className={classes.previewArea}>
          <h3>
            <Trans>Preview</Trans>
          </h3>
          {title && (
            <>
              <h1 className={classes.propTitle}>{title}</h1>
              <hr />
            </>
          )}
          <ReactMarkdown
            className={classes.markdown}
            remarkPlugins={[remarkBreaks]}
          >
            {proposalText}
          </ReactMarkdown>
        </div>
      )}
    </div>
  )
}
export default ProposalEditor
