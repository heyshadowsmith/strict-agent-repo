Feature: Deleting todos
    So that my list only has things I still need to do
    I can delete a todo, and keyboard focus stays in a sensible place

    Background:
        Given my list has "Buy milk", "Walk dog" and "Call mom"

    Scenario: Deleting a todo
        When I delete "Walk dog"
        Then my list shows "Buy milk" and "Call mom" in that order
        And "2 items left" is shown

    Scenario: Focus moves to the next todo
        When I delete "Buy milk"
        Then the Delete button for "Walk dog" has focus

    Scenario: Focus moves to the previous todo after deleting the last one
        When I delete "Call mom"
        Then the Delete button for "Walk dog" has focus

    Scenario: Focus moves to the input when the list becomes empty
        When I delete "Buy milk", "Walk dog" and "Call mom"
        Then the new todo input has focus

    Scenario: Deleted todos stay gone after reopening the app
        When I delete "Walk dog"
        And I reopen the app
        Then my list shows "Buy milk" and "Call mom" in that order
