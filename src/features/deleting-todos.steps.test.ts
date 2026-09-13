// @vitest-environment jsdom
/// <reference types="vite/client" />
import { describeFeature, loadFeatureFromText } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import deletingTodos from "./deleting-todos.feature?raw";
import {
  clickRowControl,
  element,
  listTexts,
  openApp,
  reopenApp,
  rowControl,
  todoInput,
} from "./support/page";

const openList = "my list has {string}, {string} and {string}";
const inOrder = "my list shows {string} and {string} in that order";
const deleteHasFocus = "the Delete button for {string} has focus";
const focusAfterLast =
  "Focus moves to the previous todo after deleting the last one";

function openThree(
  _context: unknown,
  first: string,
  second: string,
  third: string,
): void {
  openApp([
    { text: first, done: false },
    { text: second, done: false },
    { text: third, done: false },
  ]);
}

function deleteTodo(_context: unknown, text: string): void {
  clickRowControl(text, "remove");
}

function listShowsInOrder(
  _context: unknown,
  first: string,
  second: string,
): void {
  expect(listTexts()).toEqual([first, second]);
}

function countShows(_context: unknown, text: string): void {
  expect(element("#todo-count").textContent).toBe(text);
}

function deleteButtonHasFocus(_context: unknown, text: string): void {
  expect(document.activeElement).toBe(rowControl(text, "remove"));
}

function inputHasFocus(): void {
  expect(document.activeElement).toBe(todoInput());
}

describeFeature(loadFeatureFromText(deletingTodos), (feature) => {
  feature.Background((background) => {
    background.Given(openList, openThree);
  });

  feature.Scenario("Deleting a todo", (scenario) => {
    scenario.When("I delete {string}", deleteTodo);
    scenario.Then(inOrder, listShowsInOrder);
    scenario.And("{string} is shown", countShows);
  });

  feature.Scenario("Focus moves to the next todo", (scenario) => {
    scenario.When("I delete {string}", deleteTodo);
    scenario.Then(deleteHasFocus, deleteButtonHasFocus);
  });

  feature.Scenario(focusAfterLast, (scenario) => {
    scenario.When("I delete {string}", deleteTodo);
    scenario.Then(deleteHasFocus, deleteButtonHasFocus);
  });

  feature.Scenario(
    "Focus moves to the input when the list becomes empty",
    (scenario) => {
      scenario.When(
        "I delete {string}, {string} and {string}",
        (_context: unknown, ...texts: string[]) => {
          for (const text of texts) {
            clickRowControl(text, "remove");
          }
        },
      );
      scenario.Then("the new todo input has focus", inputHasFocus);
    },
  );

  feature.Scenario(
    "Deleted todos stay gone after reopening the app",
    (scenario) => {
      scenario.When("I delete {string}", deleteTodo);
      scenario.And("I reopen the app", reopenApp);
      scenario.Then(inOrder, listShowsInOrder);
    },
  );
});
