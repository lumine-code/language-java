const path = require("path");

describe("WASM Tree-sitter Java properties grammar", () => {
  beforeEach(async () => {
    await lumine.packages.activatePackage("language-java");
  });

  async function openFixture() {
    const editor = await lumine.workspace.open(
      path.join(__dirname, "fixtures", "sample.properties"),
    );
    await editor.languageMode.ready;
    return editor;
  }

  function scopesAt(editor, needle, offset = 0) {
    const index = editor.getText().indexOf(needle);
    expect(index).not.toBe(-1);
    const position = editor.getBuffer().positionForCharacterIndex(index + offset);
    return editor.scopeDescriptorForBufferPosition(position).getScopesArray();
  }

  it("selects the properties grammar", async () => {
    const editor = await openFixture();

    expect(editor.getGrammar().scopeName).toBe("source.java-properties");
  });

  it("highlights keys, values, comments, and substitutions", async () => {
    const editor = await openFixture();

    expect(scopesAt(editor, "# Application")).toContain("comment.line.number-sign.java-properties");
    expect(scopesAt(editor, "app.name")).toContain("support.constant.java-properties");
    expect(scopesAt(editor, "Lumine")).toContain("string.unquoted.java-properties");
    expect(scopesAt(editor, "HOME")).toContain("constant.other.placeholder.java-properties");
  });
});
