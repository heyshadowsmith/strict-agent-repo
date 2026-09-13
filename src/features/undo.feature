Feature: Undo a deleted todo
    So that a mistaken delete is not permanent
    I can undo my most recent delete for a few seconds

    Background:
        Given my list has "Buy milk" and "Walk dog"

    Scenario: Restoring a deleted todo
        When I delete "Buy milk"
        And I click Undo
        Then my list shows "Buy milk" and "Walk dog" in that order

    Scenario: The undo offer expires
        When I delete "Buy milk"
        And 5 seconds pass
        Then the undo offer is hidden

    Scenario: Only the most recent delete can be undone
        When I delete "Buy milk"
        And I delete "Walk dog"
        And I click Undo
        Then my list shows only "Walk dog"
