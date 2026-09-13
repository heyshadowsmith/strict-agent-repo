// @vitest-environment jsdom
/// <reference types="vite/client" />
import { describeFeature, loadFeatureFromText } from "@amiceli/vitest-cucumber";
import { expect } from "vitest";
import completingTodos from "./completing-todos.feature?raw";
import {
  clickTodoText,
  element,
  isDone,
  openApp,
  rowControl,
} from "./support/page";

function openTwo(_context: unknown, first: string, second: string): void {
  openApp([
    { text: first, done: false },
    { text: second, done: false },
  ]);
}

function toggle(_context: unknown, text: string): void {
  rowControl(text, "toggle").click();
}

function clickText(_context: unknown, text: string): void {
  clickTodoText(text);
}

// Space on a focused checkbox fires a click, which jsdom does not simulate.
function pressSpaceOnCheckbox(_context: unknown, text: string): void {
  const checkbox = rowControl(text, "toggle");
  checkbox.focus();
  checkbox.click();
}

function countShows(_context: unknown, text: string): void {
  expect(element("#todo-count").textContent).toBe(text);
}

function todoIsDone(_context: unknown, text: string): void {
  expect(isDone(text)).toBe(true);
}

function todoIsNotDone(_context: unknown, text: string): void {
  expect(isDone(text)).toBe(false);
}

function checkboxHasFocus(_context: unknown, text: string): void {
  expect(document.activeElement).toBe(rowControl(text, "toggle"));
}

describeFeature(loadFeatureFromText(completingTodos), (feature) => {
  feature.Background((background) => {
    background.Given("my list has {string} and {string}", openTwo);
  });

  feature.Scenario("Counting todos left", (scenario) => {
    scenario.Then("{string} is shown", countShows);
  });

  feature.Scenario("Marking a todo done with its checkbox", (scenario) => {
    scenario.When("I check {string}", toggle);
    scenario.Then("{string} is done", todoIsDone);
    scenario.And("{string} is shown", countShows);
  });

  feature.Scenario("Marking a todo done by clicking its text", (scenario) => {
    scenario.When("I click the text of {string}", clickText);
    scenario.Then("{string} is done", todoIsDone);
    scenario.And("{string} is shown", countShows);
  });

  feature.Scenario("Marking a done todo as not done", (scenario) => {
    scenario.When("I check {string}", toggle);
    scenario.And("I uncheck {string}", toggle);
    scenario.Then("{string} is not done", todoIsNotDone);
    scenario.And("{string} is shown", countShows);
  });

  feature.Scenario("Completing every todo", (scenario) => {
    scenario.When("I check {string}", toggle);
    scenario.And("I check {string}", toggle);
    scenario.Then("{string} is shown", countShows);
  });

  feature.Scenario("Focus stays on the checkbox", (scenario) => {
    scenario.When(
      "I press Space on the checkbox for {string}",
      pressSpaceOnCheckbox,
    );
    scenario.Then("the checkbox for {string} has focus", checkboxHasFocus);
  });
});
