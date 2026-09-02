const HYPERLINK_TARGETS = {
  "source.java": ["comment", "string_literal"],
  "source.java-properties": ["comment", "value"],
};

const TODO_TARGETS = {
  "source.java": ["comment"],
  "source.java-properties": ["comment"],
};

exports.consumeHyperlinkInjection = (hyperlink) => {
  for (const [scopeName, types] of Object.entries(HYPERLINK_TARGETS)) {
    hyperlink.addInjectionPoint(scopeName, { types });
  }
};

exports.consumeTodoInjection = (todo) => {
  for (const [scopeName, types] of Object.entries(TODO_TARGETS)) {
    todo.addInjectionPoint(scopeName, { types });
  }
};
