// @vitest-environment jsdom
/// <reference types="vite/client" />
import { describeFeature, loadFeatureFromText } from "@amiceli/vitest-cucumber";
import { expect, vi } from "vitest";
import page from "../../index.html?raw";
import { mountApp } from "../app";
import undoFeature from "./undo.feature?raw";

function required<T>(value: T | null | undefined): T {
  if (value === null || value === undefined) {
    throw new Error("Element not found");
  }
  return value;
}

function resetPage(): void {
  vi.useFakeTimers();
  localStorage.clear();
  document.body.innerHTML = new DOMParser().parseFromString(
    page,
    "text/html",
  ).body.innerHTML;
}

function mountTwoTodos(): void {
  localStorage.setItem(
    "todos",
    JSON.stringify([
      { id: "1", text: "Buy milk", done: false },
      { id: "2", text: "Walk dog", done: false },
    ]),
  );
  mountApp(document, localStorage);
}

function texts(): readonly (string | null)[] {
  return [...document.querySelectorAll(".todo span")].map(
    (span) => span.textContent,
  );
}

function deleteTodo(text: string): void {
  const row = [...document.querySelectorAll(".todo")].find(
    (todo) => todo.querySelector("span")?.textContent === text,
  );
  required(
    required(row).querySelector<HTMLElement>('[data-action="remove"]'),
  ).click();
}

function clickUndo(): void {
  required(document.querySelector<HTMLElement>("#todo-undo-button")).click();
}

describeFeature(loadFeatureFromText(undoFeature), (feature) => {
  // Background runs before each scenario's hooks, so it owns the page setup.
  feature.Background((background) => {
    background.Given('my list has "Buy milk" and "Walk dog"', () => {
      resetPage();
      mountTwoTodos();
    });
  });
  feature.AfterEachScenario(() => {
    vi.useRealTimers();
  });

  feature.Scenario("Restoring a deleted todo", (scenario) => {
    scenario.When('I delete "Buy milk"', () => {
      deleteTodo("Buy milk");
    });
    scenario.And("I click Undo", clickUndo);
    scenario.Then(
      'my list shows "Buy milk" and "Walk dog" in that order',
      () => {
        expect(texts()).toEqual(["Buy milk", "Walk dog"]);
      },
    );
  });

  feature.Scenario("The undo offer expires", (scenario) => {
    scenario.When('I delete "Buy milk"', () => {
      deleteTodo("Buy milk");
    });
    scenario.And("5 seconds pass", () => {
      vi.advanceTimersByTime(5000);
    });
    scenario.Then("the undo offer is hidden", () => {
      expect(required(document.querySelector("#todo-undo"))).toHaveProperty(
        "hidden",
        true,
      );
    });
  });

  feature.Scenario("Only the most recent delete can be undone", (scenario) => {
    scenario.When('I delete "Buy milk"', () => {
      deleteTodo("Buy milk");
    });
    scenario.And('I delete "Walk dog"', () => {
      deleteTodo("Walk dog");
    });
    scenario.And("I click Undo", clickUndo);
    scenario.Then('my list shows only "Walk dog"', () => {
      expect(texts()).toEqual(["Walk dog"]);
    });
  });
});
