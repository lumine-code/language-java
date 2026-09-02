; Adapted from nvim-treesitter at
; 19071296d3d643b48615ee574a20e8a03ac40872 (Apache-2.0).

((comment) @comment.line.number-sign.java-properties
  (#match? @comment.line.number-sign.java-properties "^#"))
((comment) @comment.line.exclamation.java-properties
  (#match? @comment.line.exclamation.java-properties "^!"))
((comment) @punctuation.definition.comment.java-properties
  (#set! adjust.startAndEndAroundFirstMatchOf "^[#!]"))

(key) @support.constant.java-properties
(value) @string.unquoted.java-properties
(value (escape) @constant.character.escape.java-properties)

((value) @constant.language.boolean.java-properties
  (#any-of? @constant.language.boolean.java-properties "true" "false"))

((value) @constant.numeric.java-properties
  (#match? @constant.numeric.java-properties "^[0-9]+$"))

((index) @constant.numeric.java-properties
  (#match? @constant.numeric.java-properties "^[0-9]+$"))

((substitution (key) @constant.other.placeholder.java-properties)
  (#match? @constant.other.placeholder.java-properties "^[A-Z_][A-Z0-9_]*$"))

(substitution
  (key) @support.function.java-properties
  "::" @punctuation.definition.substitution.java-properties
  (secret) @constant.other.secret.java-properties)

(property ["=" ":"] @punctuation.separator.key-value.java-properties)

[
  "${"
  "}"
] @punctuation.definition.substitution.java-properties

(substitution ":" @punctuation.separator.substitution.java-properties)

"[" @punctuation.definition.index.begin.bracket.square.java-properties
"]" @punctuation.definition.index.end.bracket.square.java-properties

[
  "."
  "\\"
] @punctuation.separator.java-properties
