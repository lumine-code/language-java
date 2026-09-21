const HYPERLINK_TARGETS = {
  "source.java": ["comment", "string_literal"],
  "source.java-properties": ["comment", "value"],
};

const TODO_TARGETS = {
  "source.java": ["comment"],
  "source.java-properties": ["comment"],
};

exports.consumeHyperlinkInjection = (hyperlink) => {
  const registrations = [];
  for (const [scopeName, types] of Object.entries(HYPERLINK_TARGETS)) {
    registrations.push(hyperlink.addInjectionPoint(scopeName, { types }));
  }
  return {
    dispose() {
      for (const registration of registrations.splice(0)) registration.dispose();
    },
  };
};

exports.consumeTodoInjection = (todo) => {
  const registrations = [];
  for (const [scopeName, types] of Object.entries(TODO_TARGETS)) {
    registrations.push(todo.addInjectionPoint(scopeName, { types }));
  }
  return {
    dispose() {
      for (const registration of registrations.splice(0)) registration.dispose();
    },
  };
};
