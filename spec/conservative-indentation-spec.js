describe("java conservative indentation", () => {
  let editor;
  beforeEach(async () => {
    editor = null;
    jasmine.useRealClock();
    await lumine.packages.activatePackage("language-java");
  });
  afterEach(() => editor?.destroy());
  async function start(file, text) {
    if (!editor || !editor.getPath()?.endsWith(file)) {
      editor?.destroy();
      editor = await lumine.workspace.open(file);
    }
    editor.update({ autoIndent: true, tabLength: 2, softTabs: true });
    editor.setText(text);
    expect(await editor.whenGrammarSettled()).toBe(true);
  }
  describe("java", () => {
    it("indents Enter inside a block", async () => {
      await start("indentation.java", "class Test {\n}");
      editor.setCursorBufferPosition([0, Infinity]);
      await editor.insertNewline();
      expect(editor.lineTextForBufferRow(1)).toBe("  ");
    });
    it("dedents a typed closing brace", async () => {
      await start("indentation.java", "class Test {\n  int value;\n  ");
      editor.setCursorBufferPosition([2, Infinity]);
      await editor.insertText("}", { autoIndent: true, autoDecreaseIndent: true });
      await editor.whenGrammarSettled();
      expect(editor.lineTextForBufferRow(2)).toBe("}");
    });
    it("reindents a body and its closing delimiter once", async () => {
      await start("indentation.java", "class Test {\nint value;\n}");
      await editor.autoIndentBufferRows(0, 2);
      expect(editor.getText()).toBe("class Test {\n  int value;\n}");
    });
    it("does not add indent after a complete one-line block or delimiters in a comment", async () => {
      for (const text of ["class Test { int value; }", "// { [ ("]) {
        await start("indentation.java", text);
        editor.moveToEndOfLine();
        await editor.insertNewline();
        expect(editor.lineTextForBufferRow(1)).toBe("");
      }
    });
    it("preserves multiline literal whitespace during reindent", async () => {
      const source = 'class Test { String value = """\n      { [ (\n  last\n"""; }';
      await start("indentation.java", source);
      await editor.autoIndentBufferRows(0, editor.getLastBufferRow());
      expect(editor.getText()).toBe(source);
    });
    it("preserves multiline comment interiors during reindent", async () => {
      const source = "/* first\n      { [ (\n  last */";
      await start("indentation.java", source);
      await editor.autoIndentBufferRows(0, editor.getLastBufferRow());
      expect(editor.getText()).toBe(source);
    });
  });
  it("aligns arrow cases with their switch instead of stair-stepping", async () => {
    await start(
      "test.java",
      "class Test {\n  void run() {\n    switch (value) {\n      case 1 -> run();\n      case 2 -> run();\n      default -> run();\n    }\n  }\n}",
    );
    expect(await editor.suggestedIndentForBufferRow(4)).toBe(3);
    expect(await editor.suggestedIndentForBufferRow(5)).toBe(3);
    expect(await editor.suggestedIndentForBufferRow(6)).toBe(2);
    editor.setCursorBufferPosition([3, Infinity]);
    await editor.insertNewline();
    expect(editor.lineTextForBufferRow(4)).toBe("      ");
  });
  it("indents colon case bodies and closes their switch", async () => {
    await start(
      "test.java",
      "class Test {\n  void run() {\n    switch (value) {\n      case 1:\n        run();\n        break;\n      default:\n        run();\n    }\n  }\n}",
    );
    expect(await editor.suggestedIndentForBufferRow(4)).toBe(4);
    expect(await editor.suggestedIndentForBufferRow(6)).toBe(3);
    expect(await editor.suggestedIndentForBufferRow(8)).toBe(2);
  });
  it("retains the case label level after an inline colon body", async () => {
    await start(
      "inline.java",
      "class Test {\n  void run() {\n    switch (value) {\n      case 1: run();\n    }\n  }\n}",
    );
    editor.setCursorBufferPosition([3, Infinity]);
    await editor.insertNewline();
    expect(editor.lineTextForBufferRow(4)).toBe("      ");
  });
});
