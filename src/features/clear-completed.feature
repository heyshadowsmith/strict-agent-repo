Feature: Clearing completed todos
    So that my list only shows what is left
    I can remove every done todo at once

    Scenario: Clearing removes only done todos
        Given my list has open "Buy milk" and done "Walk dog"
        When I click Clear completed
        Then my list shows only "Buy milk"
        And "1 item left" is shown

    Scenario: Nothing changes when no todos are done
        Given my list has open "Buy milk" and open "Walk dog"
        When I click Clear completed
        Then my list shows "Buy milk" and "Walk dog" in that order

    Scenario: Cleared todos stay gone after reopening the app
        Given my list has open "Buy milk" and done "Walk dog"
        When I click Clear completed
        And I reopen the app
        Then my list shows only "Buy milk"
