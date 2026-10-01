const fs = require("fs");
const path = require("path");

const packagePath = (name) => {
  const sibling = path.resolve(__dirname, "..", "..", name);
  return fs.existsSync(sibling) ? sibling : name;
};

describe("Java static annotations", () => {
  it("highlights literal fragments and excludes interpolated expressions", async () => {
    await lumine.packages.activatePackage(packagePath("language-java"));
    await lumine.packages.activatePackage(packagePath("language-hyperlink"));
    const editor = await lumine.workspace.open("Annotations.java");
    try {
      const text =
        'class Demo { String plain = "https://example.com/plain"; String template = STR."https://example.com/\\{host}/tail"; }';
      editor.setText(text);
      const mode = editor.languageMode;
      await mode.ready;
      await mode.atGrammarSettlement();
      expect(mode.tree.rootNode.descendantsOfType("string_interpolation").length).toBe(1);
      for (const needle of ["https://example.com/plain", "https://example.com/\\"]) {
        const position = editor.getBuffer().positionForCharacterIndex(text.indexOf(needle));
        const scopes = editor.scopeDescriptorForBufferPosition(position).getScopesArray();
        expect(scopes).toContain("markup.underline.link.hyperlink");
      }
      const host = editor.getBuffer().positionForCharacterIndex(text.indexOf("host"));
      expect(editor.scopeDescriptorForBufferPosition(host).getScopesArray()).not.toContain(
        "markup.underline.link.hyperlink",
      );
    } finally {
      editor.destroy();
    }
  });
});
