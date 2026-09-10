const fs = require("fs");
const path = require("path");
const { Point } = require("lumine");

const highlightsPath = path.join(__dirname, "..", "grammars", "java-highlights.scm");

describe("WASM Tree-sitter Java grammar", () => {
  let editor;
  let languageMode;

  beforeEach(async () => {
    await lumine.packages.activatePackage("language-java");
  });

  afterEach(() => editor?.destroy());

  async function setUp(text) {
    editor = await lumine.workspace.open();
    editor.setGrammar(lumine.grammars.grammarForScopeName("source.java"));
    editor.setText(text);
    languageMode = editor.getBuffer().languageMode;
    await languageMode.ready;
  }

  function rawCaptures(startRow, endRow) {
    const options =
      startRow == null
        ? undefined
        : {
            startPosition: new Point(startRow, 0),
            endPosition: new Point(endRow, 0),
          };
    const layer = languageMode.rootLanguageLayer;
    return layer.queries.highlightsQuery.captures(layer.tree.rootNode, options);
  }

  it("passes grammar tests", async () => {
    await runGrammarTests(path.join(__dirname, "fixtures", "sample.java"), /\/\//);
  });

  it("uses the correct context for parameter, argument, and generic delimiters", async () => {
    const text =
      "class Box<T> { void call(int value) { target(value); List<? extends String> names; Map<String, ? super Number> map; } }";
    await setUp(text);

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
    expect(scopesAt(text.indexOf("> {"))).toContain(
      "punctuation.definition.type.end.bracket.angle.java",
    );
    expect(scopesAt(text.indexOf("List<") + 4)).toContain(
      "punctuation.definition.type.begin.bracket.angle.java",
    );
    expect(scopesAt(text.indexOf("> names"))).toContain(
      "punctuation.definition.type.end.bracket.angle.java",
    );
    expect(scopesAt(text.indexOf("?"))).toContain("storage.type.generic.wildcard.java");
    expect(scopesAt(text.indexOf("extends"))).toContain("storage.modifier.extends.java");
    expect(scopesAt(text.indexOf("super Number"))).toContain("storage.modifier.super.java");
  });

  it("keeps unbounded containers leaf-rooted and trims CRLF line comments", () => {
    const query = fs.readFileSync(highlightsPath, "utf8");

    expect(query).not.toMatch(/\((?:formal_parameters|argument_list|type_arguments)\s*\n\s*"/);
    expect(query).toContain("(#is? test.childOfType formal_parameters)");
    expect(query).toContain("(#is? test.childOfType argument_list)");
    expect(query).toContain('(wildcard\n  "?"');
    expect(query).toContain('("<" @punctuation.definition.type.begin.bracket.angle.java');
    expect(query).toContain('adjust.endBeforeFirstMatchOf "\\\\r?$"');
  });

  it("keeps leaf-rooted captures viewport-local", async () => {
    await setUp(`class Example {
  void call(
    int first,
    int second
  ) {
    target(
      first,
      second
    );
    List<
      ? extends String
    > names;
  }
}`);

    const parameterCaptures = rawCaptures(3, 5).filter((capture) =>
      capture.name.startsWith("punctuation.definition.parameters."),
    );
    expect(parameterCaptures.map((capture) => capture.node.startPosition.row)).toEqual([4]);
    expect(parameterCaptures.every((capture) => capture.node.startPosition.row >= 3)).toBe(true);

    const argumentCaptures = rawCaptures(7, 9).filter((capture) =>
      capture.name.startsWith("punctuation.definition.arguments."),
    );
    expect(argumentCaptures.map((capture) => capture.node.startPosition.row)).toEqual([8]);
    expect(argumentCaptures.every((capture) => capture.node.startPosition.row >= 7)).toBe(true);

    const typeCaptures = rawCaptures(10, 12).filter(
      (capture) =>
        capture.name.startsWith("punctuation.definition.type.") ||
        capture.name === "storage.type.generic.wildcard.java" ||
        capture.name === "storage.modifier.extends.java",
    );
    expect(typeCaptures.map((capture) => capture.node.startPosition.row)).toEqual([10, 10, 11]);
    expect(typeCaptures.every((capture) => capture.node.startPosition.row >= 10)).toBe(true);
  });

  it("bounds raw work inside a 6000-row argument-list parent", async () => {
    const lines = ["class Example { void call() {", "target("];
    for (let i = 0; i < 6000; i++) {
      lines.push(`  value_${i}${i === 5999 ? "" : ","}`);
    }
    lines.push(");", "} }");
    await setUp(lines.join("\r\n"));

    const tileCaptures = rawCaptures(2998, 3004);
    expect(tileCaptures.length).toBeLessThanOrEqual(64);
    expect(
      tileCaptures
        .filter((capture) => capture.name.startsWith("punctuation.definition.arguments."))
        .every(
          (capture) =>
            capture.node.startPosition.row >= 2998 && capture.node.startPosition.row < 3004,
        ),
    ).toBe(true);
  });
});
