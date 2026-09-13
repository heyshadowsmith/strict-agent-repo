Feature: Saved list
    So that I don't lose my todos
    The app saves my list in this browser and loads it when I open the app

    Scenario: Opening the app shows the saved list
        Given my saved list has "Buy milk" and a done "Walk dog"
        When I open the app
        Then my list shows "Buy milk" and "Walk dog" in that order
        And "Walk dog" is done
        And "1 item left" is shown

    Scenario: Starting with nothing saved
        Given nothing is saved
        When I open the app
        Then my list is empty
        And "0 items left" is shown

    Scenario: Saved data that can't be read is ignored
        Given the saved data is not valid JSON
        When I open the app
        Then my list is empty

    Scenario: Saved data that isn't a list is ignored
        Given the saved data is a single object instead of a list
        When I open the app
        Then my list is empty

    Scenario: Broken saved todos are skipped
        Given my saved list has "Buy milk" and a todo with no text
        When I open the app
        Then my list shows only "Buy milk"
