import React, { ErrorInfo } from 'react'
import { Link } from 'react-router-dom'
import StackTrace from 'stacktrace-js'

interface ErrorBoundaryProps {
  hasError: boolean
  errorInfo: string
  children?: React.ReactNode
}

export class ErrorBoundary extends React.Component<object, ErrorBoundaryProps> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, errorInfo: '', children: undefined }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can do absolutely everything with the error from stacktrace.js POST it or console.log it
    StackTrace.fromError(error).then((err) =>
      this.setState({ ...this.state, errorInfo: JSON.stringify(err) }),
    )
  }

  render() {
    if (this.state.hasError) {
      return (
        <div id="error-page">
          <h1>There has been an error</h1>
          <p>
            <strong>Stack trace:</strong>
          </p>
          <p>{this.state.errorInfo ? this.state.errorInfo : 'Loading ...'}</p>
          <Link to="/">Go back</Link>
        </div>
      )
    }
    // return this.props.children as React.ReactNode;
    else return
  }
}
