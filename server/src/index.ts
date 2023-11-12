import { env } from 'bun'
import app from './lib/app'

try {
  // Start server
  app.listen(env.PORT ?? 9000)
} catch (error) {
  console.error('Something went wrong', error)
  app.stop()
}
