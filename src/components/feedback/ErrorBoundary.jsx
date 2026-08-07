import { Component } from 'react'
import ErrorState from '../common/ErrorState'

/**
 * Catches render errors anywhere below it and shows a friendly error state
 * with a reload action.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message ?? 'An unexpected error occurred.' }
  }

  componentDidCatch(error, info) {
    // Future: forward to a monitoring service.
    console.error('ErrorBoundary caught:', error, info)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return <ErrorState title="Something went wrong" message={this.state.message} onRetry={this.handleReload} retryLabel="Reload page" />
    }

    return this.props.children
  }
}
