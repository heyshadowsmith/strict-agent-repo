Feature: Editing todos
    So that I can fix or reword a todo
    I can edit its text in place

    Background:
        Given my list has "Buy milk" and "Walk dog"
        And I am editing "Buy milk"

    Scenario: The editor opens with the text selected
        Then the editor shows "Buy milk" with all of it selected
        And the editor has focus

    Scenario: Saving with Enter
        When I change the text to "Buy oat milk"
        And I press Enter
        Then my list shows "Buy oat milk" and "Walk dog" in that order
        And the Edit button for "Buy oat milk" has focus

    Scenario: Saving by leaving the editor
        When I change the text to "Buy oat milk"
        And I move focus out of the editor
        Then my list shows "Buy oat milk" and "Walk dog" in that order

    Scenario: Cancelling with Escape
        When I change the text to "Nope"
        And I press Escape
        Then my list shows "Buy milk" and "Walk dog" in that order
        And the Edit button for "Buy milk" has focus

    Scenario: Surrounding spaces are trimmed
        When I change the text to "  Buy oat milk  "
        And I press Enter
        Then my list shows "Buy oat milk" and "Walk dog" in that order

    Scenario: Blank text keeps the original
        When I change the text to "   "
        And I press Enter
        Then my list shows "Buy milk" and "Walk dog" in that order

    Scenario: Input method Enter does not save
        When I change the text to "Buy oat milk"
        And I pick an input method suggestion with Enter
        Then the editor is still open

    Scenario: Edits survive reopening the app
        When I change the text to "Buy oat milk"
        And I press Enter
        And I reopen the app
        Then my list shows "Buy oat milk" and "Walk dog" in that order
