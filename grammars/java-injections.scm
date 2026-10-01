([
  (line_comment)
  (block_comment)
] @injection.owner @injection.content
  (#set! injection.language "hyperlink")
  (#set! injection.language-scope "none")
  (#set! injection.include-children))

((string_literal [(string_fragment) (multiline_string_fragment)] @injection.owner @injection.content)
  (#set! injection.language "hyperlink")
  (#set! injection.language-scope "none"))
([
  (line_comment)
  (block_comment)
] @injection.owner @injection.content
  (#set! injection.language "todo")
  (#set! injection.language-scope "none")
  (#set! injection.include-children))
