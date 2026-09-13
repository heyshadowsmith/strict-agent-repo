// @vitest-environment jsdom
/// <reference types="vite/client" />
import { describeFeature, loadFeatureFromText } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import addingTodos from "./adding-todos.feature?raw";
import {
  addTodo,
  element,
  listTexts,
  openApp,
  reopenApp,
  todoInput,
} from "./support/page";

function add(_context: unknown, text: string): void {
  addTodo(text);
}

function listShowsOnly(_context: unknown, text: string): void {
  expect(listTexts()).toEqual([text]);
}

function countShows(_context: unknown, text: string): void {
  expect(element("#todo-count").textContent).toBe(text);
}

describeFeature(loadFeatureFromText(addingTodos), (feature) => {
  feature.Background((background) => {
    background.Given("my list is empty", () => {
      openApp([]);
    });
  });

  feature.Scenario("Adding a todo", (scenario) => {
    scenario.When("I add {string}", add);
    scenario.Then("my list shows only {string}", listShowsOnly);
    scenario.And("{string} is shown", countShows);
    scenario.And("the input is empty", () => {
      expect(todoInput().value).toBe("");
    });
  });

  feature.Scenario("New todos go to the end of the list", (scenario) => {
    scenario.When("I add {string}", add);
    scenario.And("I add {string}", add);
    scenario.Then(
      "my list shows {string} and {string} in that order",
      (_context: unknown, first: string, second: string) => {
        expect(listTexts()).toEqual([first, second]);
      },
    );
  });

  feature.Scenario("Surrounding spaces are trimmed", (scenario) => {
    scenario.When("I add {string}", add);
    scenario.Then("my list shows only {string}", listShowsOnly);
  });

  feature.Scenario("Blank todos are ignored", (scenario) => {
    scenario.When("I add {string}", add);
    scenario.Then("my list is empty", () => {
      expect(listTexts()).toEqual([]);
    });
    scenario.And("{string} is shown", countShows);
  });

  feature.Scenario("Text is shown exactly as typed", (scenario) => {
    scenario.When("I add {string}", add);
    scenario.Then("my list shows only {string}", listShowsOnly);
  });

  feature.Scenario(
    "Added todos are still there after reopening the app",
    (scenario) => {
      scenario.When("I add {string}", add);
      scenario.And("I reopen the app", reopenApp);
      scenario.Then("my list shows only {string}", listShowsOnly);
    },
  );
});
