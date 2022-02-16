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


Can feeds work in a various settings?
- 1:1 // Direct Messaging
- 1:k // Group Messaging
- 1:N // Broadcast

