// curl http://shapeof.com/feed.json > shapeOf.json
import shapeOf from './shapeOf.json' assert { type: 'json' }
export const jsonFeed = JSON.stringify(shapeOf)
export default { jsonFeed };