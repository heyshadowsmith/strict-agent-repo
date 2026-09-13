// @vitest-environment jsdom
/// <reference types="vite/client" />
import { describeFeature, loadFeatureFromText } from "@amiceli/vitest-cucumber";
import { expect, vi } from "vitest";
import { clickRowControl, element, listTexts, openApp } from "./support/page";
import undoFeature from "./undo.feature?raw";

function deleteTodo(_context: unknown, text: string): void {
  clickRowControl(text, "remove");
}

function clickUndo(): void {
  element("#todo-undo-button").click();
}

describeFeature(loadFeatureFromText(undoFeature), (feature) => {
  // Background runs before each scenario's hooks, so it owns the page setup.
  feature.Background((background) => {
    background.Given(
      "my list has {string} and {string}",
      (_context: unknown, first: string, second: string) => {
        vi.useFakeTimers();
        openApp([
          { text: first, done: false },
          { text: second, done: false },
        ]);
      },
    );
  });
  feature.AfterEachScenario(() => {
    vi.useRealTimers();
  });

  feature.Scenario("Restoring a deleted todo", (scenario) => {
    scenario.When("I delete {string}", deleteTodo);
    scenario.And("I click Undo", clickUndo);
    scenario.Then(
      "my list shows {string} and {string} in that order",
      (_context: unknown, first: string, second: string) => {
        expect(listTexts()).toEqual([first, second]);
      },
    );
  });

  feature.Scenario("The undo offer expires", (scenario) => {
    scenario.When("I delete {string}", deleteTodo);
    scenario.And("5 seconds pass", () => {
      vi.advanceTimersByTime(5000);
    });
    scenario.Then("the undo offer is hidden", () => {
      expect(element("#todo-undo").hidden).toBe(true);
    });
  });

  feature.Scenario("Only the most recent delete can be undone", (scenario) => {
    scenario.When("I delete {string}", deleteTodo);
    scenario.And("I delete {string}", deleteTodo);
    scenario.And("I click Undo", clickUndo);
    scenario.Then(
      "my list shows only {string}",
      (_context: unknown, text: string) => {
        expect(listTexts()).toEqual([text]);
      },
    );
  });
});
