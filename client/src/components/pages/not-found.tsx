import { useRouteError } from 'react-router-dom';

const NotFound = () => {
  const error = useRouteError() as { statusText?: string; message?: string }

  return (
    <div className="container flex space-y-4">
      <h1 className="text-4xl">Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </div>
  )
}

export default NotFound
