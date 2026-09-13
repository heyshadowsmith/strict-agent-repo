// @vitest-environment jsdom
/// <reference types="vite/client" />
import { describeFeature, loadFeatureFromText } from "@amiceli/vitest-cucumber";
import { assert, expect } from "vitest";
import editingTodos from "./editing-todos.feature?raw";
import { listTexts, openApp, reopenApp, rowControl } from "./support/page";

const changeText = "I change the text to {string}";
const inOrder = "my list shows {string} and {string} in that order";
const editHasFocus = "the Edit button for {string} has focus";
const showsSelected = "the editor shows {string} with all of it selected";

function editor(): HTMLInputElement {
  const found = document.querySelector<HTMLInputElement>(".todo-edit");
  assert.exists(found, "The editor is not open");
  return found;
}

function press(key: string, isComposing: boolean): void {
  editor().dispatchEvent(
    new KeyboardEvent("keydown", { key, isComposing, bubbles: true }),
  );
}

function openTwo(_context: unknown, first: string, second: string): void {
  openApp([
    { text: first, done: false },
    { text: second, done: false },
  ]);
}

function startEditing(_context: unknown, text: string): void {
  rowControl(text, "edit").click();
}

function typeText(_context: unknown, text: string): void {
  editor().value = text;
}

function pressEnter(): void {
  press("Enter", false);
}

function pressEscape(): void {
  press("Escape", false);
}

function pickSuggestionWithEnter(): void {
  press("Enter", true);
}

function moveFocusOut(): void {
  editor().blur();
}

function listShowsInOrder(
  _context: unknown,
  first: string,
  second: string,
): void {
  expect(listTexts()).toEqual([first, second]);
}

function editButtonHasFocus(_context: unknown, text: string): void {
  expect(document.activeElement).toBe(rowControl(text, "edit"));
}

function editorShowsSelected(_context: unknown, text: string): void {
  const input = editor();
  expect(input.value).toBe(text);
  expect([input.selectionStart, input.selectionEnd]).toEqual([0, text.length]);
}

function editorHasFocus(): void {
  expect(document.activeElement).toBe(editor());
}

function editorStillOpen(): void {
  expect(editor().value).toBe("Buy oat milk");
}

describeFeature(loadFeatureFromText(editingTodos), (feature) => {
  feature.Background((background) => {
    background.Given("my list has {string} and {string}", openTwo);
    background.And("I am editing {string}", startEditing);
  });

  feature.Scenario("The editor opens with the text selected", (scenario) => {
    scenario.Then(showsSelected, editorShowsSelected);
    scenario.And("the editor has focus", editorHasFocus);
  });

  feature.Scenario("Saving with Enter", (scenario) => {
    scenario.When(changeText, typeText);
    scenario.And("I press Enter", pressEnter);
    scenario.Then(inOrder, listShowsInOrder);
    scenario.And(editHasFocus, editButtonHasFocus);
  });

  feature.Scenario("Saving by leaving the editor", (scenario) => {
    scenario.When(changeText, typeText);
    scenario.And("I move focus out of the editor", moveFocusOut);
    scenario.Then(inOrder, listShowsInOrder);
  });

  feature.Scenario("Cancelling with Escape", (scenario) => {
    scenario.When(changeText, typeText);
    scenario.And("I press Escape", pressEscape);
    scenario.Then(inOrder, listShowsInOrder);
    scenario.And(editHasFocus, editButtonHasFocus);
  });

  feature.Scenario("Surrounding spaces are trimmed", (scenario) => {
    scenario.When(changeText, typeText);
    scenario.And("I press Enter", pressEnter);
    scenario.Then(inOrder, listShowsInOrder);
  });

  feature.Scenario("Blank text keeps the original", (scenario) => {
    scenario.When(changeText, typeText);
    scenario.And("I press Enter", pressEnter);
    scenario.Then(inOrder, listShowsInOrder);
  });

  feature.Scenario("Input method Enter does not save", (scenario) => {
    scenario.When(changeText, typeText);
    scenario.And(
      "I pick an input method suggestion with Enter",
      pickSuggestionWithEnter,
    );
    scenario.Then("the editor is still open", editorStillOpen);
  });

  feature.Scenario("Edits survive reopening the app", (scenario) => {
    scenario.When(changeText, typeText);
    scenario.And("I press Enter", pressEnter);
    scenario.And("I reopen the app", reopenApp);
    scenario.Then(inOrder, listShowsInOrder);
  });
});
