// @vitest-environment jsdom
/// <reference types="vite/client" />
import { describeFeature, loadFeatureFromText } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import savedList from "./saved-list.feature?raw";
import { element, isDone, listTexts, reopenApp } from "./support/page";

const savedWithDone = "my saved list has {string} and a done {string}";
const savedWithBroken = "my saved list has {string} and a todo with no text";
const inOrder = "my list shows {string} and {string} in that order";
const notJson = "the saved data is not valid JSON";
const notList = "the saved data is a single object instead of a list";

function save(value: unknown): void {
  localStorage.setItem("todos", JSON.stringify(value));
}

function saveWithDone(_context: unknown, open: string, done: string): void {
  save([
    { id: "1", text: open, done: false },
    { id: "2", text: done, done: true },
  ]);
}

function saveWithBroken(_context: unknown, text: string): void {
  save([
    { id: "1", text, done: false },
    { id: "2", done: false },
  ]);
}

function saveNothing(): void {
  localStorage.clear();
}

function saveInvalidJson(): void {
  localStorage.setItem("todos", "{not json");
}

function saveObject(): void {
  save({ id: "1", text: "Buy milk", done: false });
}

function listShowsInOrder(
  _context: unknown,
  first: string,
  second: string,
): void {
  expect(listTexts()).toEqual([first, second]);
}

function listShowsOnly(_context: unknown, text: string): void {
  expect(listTexts()).toEqual([text]);
}

function listIsEmpty(): void {
  expect(listTexts()).toEqual([]);
}

function todoIsDone(_context: unknown, text: string): void {
  expect(isDone(text)).toBe(true);
}

function countShows(_context: unknown, text: string): void {
  expect(element("#todo-count").textContent).toBe(text);
}

// reopenApp loads a fresh page from whatever is in storage, which is
// exactly what opening the app does.
describeFeature(loadFeatureFromText(savedList), (feature) => {
  feature.Scenario("Opening the app shows the saved list", (scenario) => {
    scenario.Given(savedWithDone, saveWithDone);
    scenario.When("I open the app", reopenApp);
    scenario.Then(inOrder, listShowsInOrder);
    scenario.And("{string} is done", todoIsDone);
    scenario.And("{string} is shown", countShows);
  });

  feature.Scenario("Starting with nothing saved", (scenario) => {
    scenario.Given("nothing is saved", saveNothing);
    scenario.When("I open the app", reopenApp);
    scenario.Then("my list is empty", listIsEmpty);
    scenario.And("{string} is shown", countShows);
  });

  feature.Scenario("Saved data that can't be read is ignored", (scenario) => {
    scenario.Given(notJson, saveInvalidJson);
    scenario.When("I open the app", reopenApp);
    scenario.Then("my list is empty", listIsEmpty);
  });

  feature.Scenario("Saved data that isn't a list is ignored", (scenario) => {
    scenario.Given(notList, saveObject);
    scenario.When("I open the app", reopenApp);
    scenario.Then("my list is empty", listIsEmpty);
  });

  feature.Scenario("Broken saved todos are skipped", (scenario) => {
    scenario.Given(savedWithBroken, saveWithBroken);
    scenario.When("I open the app", reopenApp);
    scenario.Then("my list shows only {string}", listShowsOnly);
  });
});
