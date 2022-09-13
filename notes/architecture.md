let 𝔼 = Set of Invalid Response Kinds;

let availURLs = ∀ url ∈ URLSET : fetchText(url) ∉ 𝔼 ⟺ URLSET ⊃ availURLs ∀ aURL
∈ availURLs : parse(fetchText(url)) ∉ 𝔼 ⟺ availURLs ⊃ validURLs

let ASTrepr = parse(fetchText(url)) ∀ ASTmapperFn ASTmapperFn(ASTrepr) ∈
ASTrepr`;

ASTrepr` -> back to Feed Syntax

Eventually, the reader application will also need a URL on where to publish
events in regard to this feed.

Proposal

```html
<viewermeta>
    <tokenData token="{{tokenString}}">
    <feedEvents events='[a,b,c,d,e,f]' url='{{POST_URL}}'> <!-- default -->
        <read url='{{POST_URL}}'/> <!-- override -->
        <shared url='{{POST_URL}}'/> <!-- override -->
        <exclude-event event='EventA'/> <!-- exclusion item -->
        <exclude-event event='EventB'/> <!-- exclusion item -->
    <feedEvents>
</viewermeta>
```

`Open Reader Application` should also send:

- who
  - userInfo
  - applicaiton Info
- what
  - feedpath
  - entry.id
- when
  - js timestamp

## Social Setup:

You can `Follow My: [Posts]` - think twitter You can `Follow My: [Reads]` - read
what I am reading.

If I clean up a permalink/URL and you are asking for the same transformations

- you can just use mine if you want.
- saves on bandwidth, beating up the source site, and is usually faster.

`Discovery Task` : Who has what I am looking for - post transformations.

Can feeds work in a various settings?

- 1:1 // Direct Messaging
- 1:k // Group Messaging
- 1:N // Broadcast

## Motivating Example

- I love this Op Ed guy from the NYT
- I never have enough time to read all his work since he gets paid by the word
- So I run a trnasform pipeline to turn his articles (via RSS) into my own
  podcast albeit read my a voice not as good as the one affoarded to Stephen
  Hawking.
- I have followers in my network - and I can share my created resource with them
  so they dont have to pay AWS to make it and store it.

### Users can Brodcast:

- I started with this NYT article - {url, @t, #hash} = 𝔸
- applied this transform pipeline (requires canonical Ids) _maybe even a
  transform hash_ 𝓣
- I ended with this content - derived by: { from:𝔸, createdBy:𝓣, #hash } = 𝓐
- Also NOTE: any site - that merely includes a js Date.now() number in the
  html - will break the content hash discovery. So we will need a "collisioning
  hash" to resolve that.

What if the ID for A is noisy; then its hard to key-lookup the final hash on A`

> 𝓣(𝔸) = 𝓐 hashT,hashA => hashA\`

maybe it would be nice if there was some monoid that would allow you to T on to
A and have some resemblance of A\`

So depending on what I stored / can share - I would broadcast som version of 𝓐 +
𝔸 so that others could benefit from my work - asking their network "Has anyone
already done this?, and is willing to share?"
