describe("Java editing settings", () => {
  let editor;
  beforeEach(async () => {
    jasmine.useRealClock();
    await lumine.packages.activatePackage("language-java");
    editor = await lumine.workspace.open("settings.java");
  });
  afterEach(() => editor.destroy());

  it("offers the Javadoc words in the documentation scope actually emitted by the grammar", async () => {
    editor.setText("/**\n * @pa\n */\nclass Test {}\n");
    await editor.whenGrammarSettled();
    const scope = editor.scopeDescriptorForBufferPosition([1, 4]);
    expect(scope.getScopesArray()).toContain("comment.block.documentation.javadoc.java");
    expect(lumine.config.get("editor.completions", { scope })).toContain("param");
    expect(lumine.config.get("editor.completions", { scope })).toContain("return");
    const codeScope = editor.scopeDescriptorForBufferPosition([3, 6]);
    expect(lumine.config.get("editor.completions", { scope: codeScope }) ?? []).not.toContain(
      "param",
    );
  });

  it("keeps documentation words out of ordinary block comments", async () => {
    editor.setText("/* @pa */\nclass Test {}\n");
    await editor.whenGrammarSettled();
    const scope = editor.scopeDescriptorForBufferPosition([0, 4]);
    expect(scope.getScopesArray()).toContain("comment.block.java");
    expect(lumine.config.get("editor.completions", { scope }) ?? []).not.toContain("param");
  });
});
