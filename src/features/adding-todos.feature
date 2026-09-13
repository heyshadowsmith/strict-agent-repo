Feature: Adding todos
    So that I can keep track of things to do
    I can add todos from the input at the top of the list

    Background:
        Given my list is empty

    Scenario: Adding a todo
        When I add "Buy milk"
        Then my list shows only "Buy milk"
        And "1 item left" is shown
        And the input is empty

    Scenario: New todos go to the end of the list
        When I add "Buy milk"
        And I add "Walk dog"
        Then my list shows "Buy milk" and "Walk dog" in that order

    Scenario: Surrounding spaces are trimmed
        When I add "   Buy milk   "
        Then my list shows only "Buy milk"

    Scenario: Blank todos are ignored
        When I add "   "
        Then my list is empty
        And "0 items left" is shown

    Scenario: Text is shown exactly as typed
        When I add "<b>Buy milk</b>"
        Then my list shows only "<b>Buy milk</b>"

    Scenario: Added todos are still there after reopening the app
        When I add "Buy milk"
        And I reopen the app
        Then my list shows only "Buy milk"
