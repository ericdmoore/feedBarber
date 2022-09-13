# Use Cases

Remember the Feed value chain:

```
:) Publishers =>>> standards based feeds -> feed applications ====> Viewer :)
```

What Use Cases can feedBarber better solve?

- feed compositions
- automation of:
  - ad insertion
  - ad removal
  - enclosures turned to torrent_seeds for podcast audio/vidoe files?
  - proxied feed edits

- authN + authZ feeds? (aka: premium feeds)

## Discover Feed Start Locations:

- WP rss: `/feed` rss: /blog/rss.xml rss: /rss
- Medium rss: `medium.com/feed/@username` or `username.medium.com/feed`
- blogspot atom: `http://{blogname}.blogspot.com/feeds/posts/default`
- squarespace `http://www.yourdomain.com/{colectionName}?format=rss`
  `http://sitename.squarespace.com/{colectionName}?format=rss`
- index page discovery cheerio find <link rel='application/rss+xml'>.href
- robots.txt
- sitemap.xml
