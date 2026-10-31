; The closing brace of a switch statement's body should match the indentation of the line where the switch statement starts.
(switch_expression
  body: (switch_block "}" @match
    (#is? test.last true))
  (#set! indent.matchIndentOf parent.parent.startPosition))

; 'case' and 'default' need to be indented one level more than their containing
; `switch`.
  (["case" "default"] @match
    (#set! indent.matchIndentOf parent.parent.parent.startPosition)
    (#set! indent.offsetIndent 1))

[
  "{"
  "("
  "["
] @indent

[
  "}"
  ")"
  "]"
] @dedent

; Arrow rules can finish on the same line; only colon groups open a case body.
(":" @indent
  (#is? test.childOfType switch_block_statement_group)
  (#is? test.lastTextOnRow true))

; Reindent code without rewriting whitespace that belongs to multiline text.
([(string_literal) (block_comment)] @preserve
  (#is? indent.reindent true)
  (#is-not? indent.matchesCurrentRow startPosition)
  (#set! indent.force true))
