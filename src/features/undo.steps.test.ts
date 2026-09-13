// @vitest-environment jsdom
/// <reference types="vite/client" />
import { describeFeature, loadFeatureFromText } from "@amiceli/vitest-cucumber";
import { expect, vi } from "vitest";
import {
  clickRowControl,
  element,
  listTexts,
  openApp,
  reopenApp,
  rowControl,
} from "./support/page";
import undoFeature from "./undo.feature?raw";

const inOrder = "my list shows {string} and {string} in that order";
const deleteHasFocus = "the Delete button for {string} has focus";
const seeOffer = "I see {string} with an Undo button";

// Fake timers let scenarios skip ahead to when the undo offer expires.
function openTwo(_context: unknown, first: string, second: string): void {
  vi.useFakeTimers();
  openApp([
    { text: first, done: false },
    { text: second, done: false },
  ]);
}

function deleteTodo(_context: unknown, text: string): void {
  clickRowControl(text, "remove");
}

function clickUndo(): void {
  element("#todo-undo-button").click();
}

function secondsPass(_context: unknown, seconds: number): void {
  vi.advanceTimersByTime(seconds * 1000);
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

function offerHidden(): void {
  expect(element("#todo-undo").hidden).toBe(true);
}

function offerShown(): void {
  expect(element("#todo-undo").hidden).toBe(false);
}

function offerSays(_context: unknown, text: string): void {
  offerShown();
  expect(element("#todo-undo-text").textContent).toBe(text);
}

function deleteButtonHasFocus(_context: unknown, text: string): void {
  expect(document.activeElement).toBe(rowControl(text, "remove"));
}

describeFeature(loadFeatureFromText(undoFeature), (feature) => {
  // Background runs before each scenario's hooks, so it owns the page setup.
  feature.Background((background) => {
    background.Given("my list has {string} and {string}", openTwo);
  });
  feature.AfterEachScenario(() => {
    vi.useRealTimers();
  });

  feature.Scenario("Restoring a deleted todo", (scenario) => {
    scenario.When("I delete {string}", deleteTodo);
    scenario.And("I click Undo", clickUndo);
    scenario.Then(inOrder, listShowsInOrder);
    scenario.And("the undo offer is hidden", offerHidden);
  });

  feature.Scenario("The undo offer expires", (scenario) => {
    scenario.When("I delete {string}", deleteTodo);
    scenario.And("{int} seconds pass", secondsPass);
    scenario.Then("the undo offer is hidden", offerHidden);
  });

  feature.Scenario("Only the most recent delete can be undone", (scenario) => {
    scenario.When("I delete {string}", deleteTodo);
    scenario.And("I delete {string}", deleteTodo);
    scenario.And("I click Undo", clickUndo);
    scenario.Then("my list shows only {string}", listShowsOnly);
  });

  feature.Scenario("Deleting offers to undo", (scenario) => {
    scenario.When("I delete {string}", deleteTodo);
    scenario.Then(seeOffer, offerSays);
  });

  feature.Scenario("No undo offer before deleting anything", (scenario) => {
    scenario.Then("the undo offer is hidden", offerHidden);
  });

  feature.Scenario("The undo offer stays for a few seconds", (scenario) => {
    scenario.When("I delete {string}", deleteTodo);
    scenario.And("{int} seconds pass", secondsPass);
    scenario.Then("the undo offer is shown", offerShown);
  });

  feature.Scenario("Undo puts focus on the restored todo", (scenario) => {
    scenario.When("I delete {string}", deleteTodo);
    scenario.And("I click Undo", clickUndo);
    scenario.Then(deleteHasFocus, deleteButtonHasFocus);
  });

  feature.Scenario("Restored todos survive reopening the app", (scenario) => {
    scenario.When("I delete {string}", deleteTodo);
    scenario.And("I click Undo", clickUndo);
    scenario.And("I reopen the app", reopenApp);
    scenario.Then(inOrder, listShowsInOrder);
  });
});
