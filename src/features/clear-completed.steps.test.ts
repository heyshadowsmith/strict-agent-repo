// @vitest-environment jsdom
/// <reference types="vite/client" />
import { describeFeature, loadFeatureFromText } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import clearCompleted from "./clear-completed.feature?raw";
import { element, listTexts, openApp, reopenApp } from "./support/page";

function openAndDone(_context: unknown, open: string, done: string): void {
  openApp([
    { text: open, done: false },
    { text: done, done: true },
  ]);
}

function clickClear(): void {
  element("#todo-clear").click();
}

function listShowsOnly(_context: unknown, text: string): void {
  expect(listTexts()).toEqual([text]);
}

describeFeature(loadFeatureFromText(clearCompleted), (feature) => {
  feature.Scenario("Clearing removes only done todos", (scenario) => {
    scenario.Given("my list has open {string} and done {string}", openAndDone);
    scenario.When("I click Clear completed", clickClear);
    scenario.Then("my list shows only {string}", listShowsOnly);
    scenario.And("{string} is shown", (_context: unknown, text: string) => {
      expect(element("#todo-count").textContent).toBe(text);
    });
  });

  feature.Scenario("Nothing changes when no todos are done", (scenario) => {
    scenario.Given(
      "my list has open {string} and open {string}",
      (_context: unknown, first: string, second: string) => {
        openApp([
          { text: first, done: false },
          { text: second, done: false },
        ]);
      },
    );
    scenario.When("I click Clear completed", clickClear);
    scenario.Then(
      "my list shows {string} and {string} in that order",
      (_context: unknown, first: string, second: string) => {
        expect(listTexts()).toEqual([first, second]);
      },
    );
  });

  feature.Scenario(
    "Cleared todos stay gone after reopening the app",
    (scenario) => {
      scenario.Given(
        "my list has open {string} and done {string}",
        openAndDone,
      );
      scenario.When("I click Clear completed", clickClear);
      scenario.And("I reopen the app", reopenApp);
      scenario.Then("my list shows only {string}", listShowsOnly);
    },
  );
});
