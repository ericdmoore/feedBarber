// curl http://maybepizza.com/feed.json > maybePizza.json
import maybePizza from './maybePizza.json' assert { type: 'json' }
export const jsonFeed = JSON.stringify(maybePizza)
export default { jsonFeed };