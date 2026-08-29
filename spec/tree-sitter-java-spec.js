const path = require("path");

describe("WASM Tree-sitter Java grammar", () => {
  beforeEach(async () => {
    await lumine.packages.activatePackage("language-java");
  });

  it("passes grammar tests", async () => {
    await runGrammarTests(path.join(__dirname, "fixtures", "sample.java"), /\/\//);
  });

  it("keeps parameter, argument, and generic delimiters leaf-rooted", async () => {
    const editor = await lumine.workspace.open();
    const text =
      "class Box<T> { void call(int value) { target(value); List<? extends String> names; } }";
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.java"));
    editor.setText(text);
    await editor.languageMode.ready;

    const scopesAt = (index) =>
      editor
        .scopeDescriptorForBufferPosition(editor.getBuffer().positionForCharacterIndex(index))
        .getScopesArray();

    expect(scopesAt(text.indexOf("call(") + 4)).toContain(
      "punctuation.definition.parameters.begin.bracket.round.java",
    );
    expect(scopesAt(text.indexOf(") {"))).toContain(
      "punctuation.definition.parameters.end.bracket.round.java",
    );
    expect(scopesAt(text.indexOf("target(") + 6)).toContain(
      "punctuation.definition.arguments.begin.bracket.round.java",
    );
    expect(scopesAt(text.indexOf(");"))).toContain(
      "punctuation.definition.arguments.end.bracket.round.java",
    );
    expect(scopesAt(text.indexOf("Box<") + 3)).toContain(
      "punctuation.definition.type.begin.bracket.angle.java",
    );
    expect(scopesAt(text.indexOf("List<") + 4)).toContain(
      "punctuation.definition.type.begin.bracket.angle.java",
    );
    expect(scopesAt(text.indexOf("?"))).toContain("storage.type.generic.wildcard.java");
    expect(scopesAt(text.indexOf("extends"))).toContain("storage.modifier.extends.java");
  });
});
