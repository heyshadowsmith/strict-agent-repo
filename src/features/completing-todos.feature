Feature: Completing todos
    So that I can see what is left to do
    I can mark todos done and see how many are left

    Background:
        Given my list has "Buy milk" and "Walk dog"

    Scenario: Counting todos left
        Then "2 items left" is shown

    Scenario: Marking a todo done with its checkbox
        When I check "Buy milk"
        Then "Buy milk" is done
        And "1 item left" is shown

    Scenario: Marking a todo done by clicking its text
        When I click the text of "Buy milk"
        Then "Buy milk" is done
        And "1 item left" is shown

    Scenario: Marking a done todo as not done
        When I check "Buy milk"
        And I uncheck "Buy milk"
        Then "Buy milk" is not done
        And "2 items left" is shown

    Scenario: Completing every todo
        When I check "Buy milk"
        And I check "Walk dog"
        Then "0 items left" is shown

    Scenario: Focus stays on the checkbox
        When I press Space on the checkbox for "Buy milk"
        Then the checkbox for "Buy milk" has focus
