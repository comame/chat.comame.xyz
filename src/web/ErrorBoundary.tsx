import React from "react"

type props = {
    children: React.ReactNode
}

export class ErrorBoundary extends React.Component<props, { hasError: boolean, error: any }> {
    constructor(props: props) {
      super(props)
      this.state = { hasError: false, error: null }
    }

    override componentDidMount() {
      window.addEventListener("unhandledrejection", this.onUnhandledRejection)
    }

    override componentWillUnmount() {
      window.removeEventListener("unhandledrejection", this.onUnhandledRejection)
    }

    onUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.promise.catch((error) => {
        this.setState({ hasError: error, error })
      })
    }

    override componentDidCatch(error: any, errorInfo: any) {
      console.error(error, errorInfo)
      this.setState({ hasError: true, error })
    }

    override render() {
      if (this.state.hasError) {
        return <div>
            { this.state.error }
        </div>
      }

      return this.props.children
    }
  }
