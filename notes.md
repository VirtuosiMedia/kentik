# Notes

## Overview

From a visual design perspective, my general approach to this project was to provide a simple, but polished and functional interface with a great deal of attention paid to the UI and UX details, especially many of the edge cases. The emphasis is on allowing the user to view and interact with the data without superfluous UI or visual clutter. Animations have been choosen to either draw the user's attention to interactive elements or updated data. My design goal is that the user will feel instantly familiar with the user interface and that many of the small details will make using the interface satisfying.

For coding, I opted for simple. Other than D3 and a related library for dealing with the data format, there are no other external dependencies and I wrote the rest of the code from scratch. I tried to write clean, well-documented code that is representative of the code that I usually write. While I would normally recommend using a well-documented library in a team setting, for the purposes of this application, I felt it was better to show that I understood the fundamentals.

The third component of the application is the development infrastructure, which is detailed in the [read.me file](https://github.com/VirtuosiMedia/kentik/blob/master/readme.md). For the sake of time, I didn't implement everything in regards to the infrastructure that I could have, but what is there is enough to provide a basis for consistent development environments and dependency management and could easily be expanded to include test infrastructure, automated documentation, and deployment processes.

The project took a little longer than I anticipated, around 20 hours. Having not used it before, I ran into some early issues with D3 and the lack of documentation and examples that were out of date and incompatible with the latest version of the library. After rolling back to an earlier version, I then decided I wanted to spend the time to present a polished vertical slice of an application that reflects what I'm able to offer.

## Features

- A fully-sortable table view.
- An interactive SVG map view.
- Charts of individual neighborhoods appear when interacting with the map.
- Custom tooltips.
- A custom select element replacement for visual congruity.
- A custom autocomplete search input widget for searching for neighborhoods. The autocomplete search is flexible and allows for full string searching.
- Searching when on the map view will highlight the relevant neighborhoods until the number of results is reduced to 1.
- Filter the map view by year or in aggragate.
- The user can elect to cycle automatically through each neighborhood on the map view. This was added with dashboard functionality in mind.
- All views and elements are navigable via both the mouse and keyboard.
- A smooth scroll animation back to the top from the bottom of the table view.
- A custom icon webfont.
- A custom templating system with event delegation.
- Various animations.
- Quasi-responsive views. This could be improved with further time and additional responsive breakpoints.
- A repeatable development environment.
- A build process that can be expanded.

## Issues

- This demo application has not been extensively tested for cross-browser compatibility. It has only been tested on Google Chrome for Windows.
- Because of the issues I had with D3's newer version, I had to manually revert vendor files to older versions. Given more time, I would nail this down so that it becomes part of the build process instead and transition to the newer version.
- The dropdown menu in the navbar isn't fully keyboard navigable. This was a late addition and would just need more time.
- There is one particular UX edge case that I haven't yet solved in terms of what an optimal solution should be. When searching for 'Brightwood', both 'Brightwood' and 'Brightwood Park' appear as options. Even when selecting 'Brightwood', it will not eliminate 'Brightwood Park' from the search as it is still valid for the query. While the code isn't the problem, I would want to do some additional research for this use case to look for a best practice.
- I found a last minute bug where the user is unable to select an item from the autocomplete list with the mouse. However, it does work with the keyboard.

## Improvements

While this sample application is simple, there would be differences in how I would approach a more robust project. Here are a few areas in particular:

- A greater emphasis on business goals, user goals, and user research.
- A visual design phase, complete with the development of a user interface library, wireframes, and mockups.
- An application design phase with a complete specification for architecture, technologies, code standards, and developer documentation.
- Using or creating a templating system that accounts for localization.
- Security would be a first-class priority.
- Additional work on improving accessibility.
- Performance profiling.
- Automated unit, integration, and E2E testing.
- User testing, analytics, and iterative design.
- More developer and build tools.
- Risk management policies.
