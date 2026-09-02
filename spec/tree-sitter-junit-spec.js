describe("JUnit report Tree-sitter grammar", () => {
  beforeEach(async () => {
    await lumine.packages.activatePackage("language-java");
    await lumine.packages.activatePackage("language-log");
  });

  it("selects and highlights textual JUnit reports", async () => {
    const editor = await lumine.workspace.open("report.txt");
    editor.setText("Testsuite: com.example.Sample\nTestcase: passes took 0.12 sec\nERROR failed\n");
    lumine.grammars.autoAssignLanguageMode(editor.getBuffer());
    await editor.languageMode.ready;

    expect(editor.getGrammar().scopeName).toBe("text.junit-test-report");
    expect(editor.scopeDescriptorForBufferPosition([0, 2]).getScopesArray()).toContain(
      "entity.name.type.testsuite.junit-test-report",
    );
    expect(editor.scopeDescriptorForBufferPosition([1, 2]).getScopesArray()).toContain(
      "entity.name.function.testcase.junit-test-report",
    );
    expect(editor.scopeDescriptorForBufferPosition([2, 2]).getScopesArray()).toContain(
      "invalid.illegal.junit-test-report",
    );
  });
});
