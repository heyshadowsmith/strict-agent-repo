Feature: Undo a deleted todo
    So that a mistaken delete is not permanent
    I can undo my most recent delete for a few seconds

    Background:
        Given my list has "Buy milk" and "Walk dog"

    Scenario: Restoring a deleted todo
        When I delete "Buy milk"
        And I click Undo
        Then my list shows "Buy milk" and "Walk dog" in that order
        And the undo offer is hidden

    Scenario: The undo offer expires
        When I delete "Buy milk"
        And 5 seconds pass
        Then the undo offer is hidden

    Scenario: Only the most recent delete can be undone
        When I delete "Buy milk"
        And I delete "Walk dog"
        And I click Undo
        Then my list shows only "Walk dog"

    Scenario: Deleting offers to undo
        When I delete "Buy milk"
        Then I see "Deleted “Buy milk”" with an Undo button

    Scenario: No undo offer before deleting anything
        Then the undo offer is hidden

    Scenario: The undo offer stays for a few seconds
        When I delete "Buy milk"
        And 4 seconds pass
        Then the undo offer is shown

    Scenario: Undo puts focus on the restored todo
        When I delete "Buy milk"
        And I click Undo
        Then the Delete button for "Buy milk" has focus

    Scenario: Restored todos survive reopening the app
        When I delete "Buy milk"
        And I click Undo
        And I reopen the app
        Then my list shows "Buy milk" and "Walk dog" in that order
