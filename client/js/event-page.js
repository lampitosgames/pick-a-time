/**
 * Main page script for the event page
 */
app.pagescript = (() => {
  // Stored query selectors
  let $eTitle;
  let $eDescription;
  let $ePeopleList;
  let $eAddPerson;
  let $eAddPersonIcon;
  let $eSubmitPersonIcon;
  let $eNewPersonInput;

  // Event data from the server
  let eventID;
  let eventData = {};

  // Track mouse/touch input for selecting times
  let touchDown = false;
  let mouseDown = false;

  // Current user being edited. If empty string, display matching times
  let editingUser = '';
  // Should the user be prompted before they navigate away? Used if they have unsaved work or if a
  // promise is currently resolving
  let preventNavigation = false;

  /**
   * Simple error handling function. Currently it just prints the error to the console.
   * TODO: Add UI for this
   * @param  {Error} err An error to print
   */
  const handleError = err => console.error(err);

  /**
   * Helper function that constructs a person's entry into the list
   * @param  {Object} person Person data object
   * @return {HTML}          Person-name div
   */
  const makeUserDiv = (person) => {
    const userName = person.name;
    const userColor = person.color;
    return `<div class="person-name" style="background-color: ${userColor}" data-name="${userName}">${userName} <i data-name="${userName}" class="material-icons md-light md-small delete-person">cancel</i></div>`;
  };

  /**
   * When invoked, shows the UI to add a new person to the event
   */
  const showNewPersonForm = () => {
    $eAddPersonIcon.hide();
    $eSubmitPersonIcon.show();
    $eNewPersonInput.removeClass('new-person-input-hidden').val('').attr('size', 1);
    $eNewPersonInput[0].focus();
    $eAddPerson.addClass('adding-person');
  };

  /**
   * When invoked, hides the UI for adding a new person
   */
  const hideNewPersonForm = () => {
    $eAddPersonIcon.show();
    $eSubmitPersonIcon.hide();
    $eNewPersonInput.addClass('new-person-input-hidden').val('');
    $eAddPerson.removeClass('adding-person');
  };

  /**
   * Helper function that toggles an individual time cell
   * @param  {JQuery} $cell JQuery object reference to the individual cell
   */
  const toggleTimeCell = ($cell) => {
    // If the user isn't currently editing a schedule, do nothing
    if (editingUser === '') { return; }
    // Pull out data attributes from the cell element
    const cellID = $cell.data('timestamp');
    const cellActive = $cell.data('active');
    // Get the person object from their name
    const person = eventData.people[editingUser];
    // Find the index of this table in the person's schedule
    const timeArrayTimestampIndex = person.times.indexOf(cellID);
    // Toggle the active status of the cell
    $cell.data('active', !cellActive);
    // If the cell just became active
    if (!cellActive) {
      // Set the background to the user's color, and if the user doesn't have the timestamp in their
      // schedule, add it
      $cell.css('background-color', person.color);
      if (timeArrayTimestampIndex === -1) {
        person.times.push(cellID);
      }
    } else {
      // The cell just became inactive. Remove all styling
      $cell.removeAttr('style');
      // Remove the time from the user's schedule (if it was there already)
      if (timeArrayTimestampIndex > -1) {
        person.times.splice(timeArrayTimestampIndex, 1);
      }
    }
  };

  /**
   * Function that shows all people's schedules at once, and highlights matching times
   */
  const showAllSchedules = () => {
    // Remove all styling from the table cells
    $('.time-cell').removeAttr('style');
    $('.time-cell').data('active', false);
    // Create a list of meeting times. This will eventually be the union of all attendee schedules
    let meetingTimes = [];
    // If there are people in the event
    const nameList = Object.keys(eventData.people);
    if (nameList.length > 0) {
      // Copy the first person's schedule into the meeting times array
      meetingTimes = eventData.people[nameList[0]].times.map(time => time);
    }
    // Loop through every person
    for (let p = 0; p < nameList.length; p++) {
      const person = eventData.people[nameList[p]];
      // If this person has a schedule
      if (person.times.length !== 0) {
        // Loop through all of their cells and add faded color
        for (let i = 0; i < person.times.length; i++) {
          const thisCell = $(`.time-cell[data-timestamp="${person.times[i]}"]`);
          thisCell.css('box-shadow', 'inset 0 0 100px 100px rgba(255, 255, 255, 0.8)');
          thisCell.css('background-color', person.color);
        }
        // Filter the meeting times. Only leave in times that the current person also has in their
        // schedule
        meetingTimes = meetingTimes.filter((mTime) => {
          const timeIndex = person.times.indexOf(mTime);
          return timeIndex > -1;
        });
      }
    }
    // The meeting times array now holds ONLY times where everyone is available. Display these
    // table cells in green
    for (let m = 0; m < meetingTimes.length; m++) {
      const thisCell = $(`.time-cell[data-timestamp="${meetingTimes[m]}"]`);
      thisCell.removeAttr('style');
      thisCell.css('background-color', '#83B83B');
    }
  };

  /**
   * Displays an individual person's schedule
   * @param  {String} user The person's name
   */
  const showUserSchedule = (user) => {
    // Remove all styling from the table cells
    $('.time-cell').removeAttr('style');
    $('.time-cell').data('active', false);
    // Get the person's data from their name
    const person = eventData.people[user];
    const userTimes = person.times;
    // Loop through their schedule and style the corresponding table cell
    for (let i = 0; i < userTimes.length; i++) {
      const thisCell = $(`.time-cell[data-timestamp="${userTimes[i]}"]`);
      thisCell.css('background-color', person.color);
      thisCell.data('active', true);
    }
  };

  /**
   * This function makes a POST request to update a person's schedule
   * @param  {String} user The person's name
   */
  const uploadUserSchedule = (user) => {
    // Prevent navigation while the request is happening
    preventNavigation = true;
    // Send the request
    app.ajax.post('/setPersonSchedule', { eventID, person: user, times: eventData.people[user].times })
      .then((res) => {
        // Replace the user's data with the response. It will be a new user object
        eventData.people[user] = res;
        preventNavigation = false;
        // Catch and handle any errors
      }).catch((err) => {
        handleError(err);
        preventNavigation = false;
      });
  };

  /**
   * Helper function to bind the "delete user" button to its respective POST request
   * @param  {JQuery} $element The delete button JQuery pointer
   */
  const bindDeleteEvent = ($element) => {
    // When the user clicks the delete button
    $element.on('click', (e) => {
      // Stop event propagation (we don't want them to toggle the user)
      e.stopPropagation();
      // Grab relevant DOM elements
      const userElement = $(e.target).parent();
      const username = $(e.target).data('name');
      // Prevent navigation while the request is in progress
      preventNavigation = true;
      // Send a post request to delete the person from the event
      app.ajax.post('/deletePerson', { eventID, person: username })
        .then(() => {
          // REmove the person from local data and show all schedules
          preventNavigation = false;
          delete eventData.people[username];
          userElement.remove();
          editingUser = '';
          showAllSchedules();
        })
        .catch((err) => {
          // Handle errors
          handleError(err);
          preventNavigation = false;
        });
    });
  };

  /**
   * Binds the edit schedule toggle to each user's name
   * @param  {JQuery} $element A JQuery pointer to the user's name div
   */
  const bindToggleEvent = ($element) => {
    $element.on('click', (e) => {
      const eUser = $(e.target).data('name');
      // Remove the editing class from ALL users
      $('.person-name').removeClass('editing-person-schedule');
      // If this user was the one being edited, toggle edit mode off and save changes
      if (editingUser === eUser) {
        editingUser = '';
        showAllSchedules();
        uploadUserSchedule(eUser);
        return;
      }
      // If the user was previously in edit mode for another person, save changes before switching
      if (editingUser !== '') {
        uploadUserSchedule(editingUser);
      }
      // Enable edit mode for the clicked person
      editingUser = eUser;
      $(e.target).addClass('editing-person-schedule');
      showUserSchedule(eUser);
    });
  };

  /**
   * Binds the new user POST endpoint to the Add Person button
   */
  const bindNewUserEvent = () => {
    $eSubmitPersonIcon.on('click', () => {
      const name = $eNewPersonInput.val();
      // Ensure they entered a name
      if (name.length > 0) {
        // Ensure the name is unique
        if (!Object.prototype.hasOwnProperty.call(eventData.people, name)) {
          // Make a post request to add a person, passing in the relevant data
          preventNavigation = true;
          app.ajax.post('/addPerson', { eventID, person: name }).then((newPerson) => {
            // When the request finishes, construct their DOM element and bind events
            eventData.people[newPerson.name] = newPerson;
            $ePeopleList.prepend(makeUserDiv(newPerson));
            bindDeleteEvent($(`i[data-name="${newPerson.name}"]`));
            bindToggleEvent($(`div[data-name="${newPerson.name}"]`));
            hideNewPersonForm();
            $(`div[data-name="${newPerson.name}"]`).trigger('click');
            preventNavigation = false;
          });
        } else {
          handleError('Name already exists');
          preventNavigation = false;
        }
      }
    });
  };

  /**
   * Binds mouse events to the table cells. Fairly simple, with a little bit of touch support
   * to prevent lag. (Touch UX is still not ideal but it works)
   */
  const bindTimeCellClickEvent = () => {
    $(document).on('mouseup', (e) => {
      e.preventDefault();
      e.stopPropagation();
      touchDown = false;
      mouseDown = false;
    });
    $('.time-cell').on('touchstart', (e) => {
      e.stopPropagation();
      touchDown = true;
      toggleTimeCell($(e.target));
    });
    $('.time-cell').on('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!touchDown) {
        mouseDown = true;
        toggleTimeCell($(e.target));
      }
    });
    $('.time-cell').on('mouseover', (e) => {
      e.stopPropagation();
      if (mouseDown && !touchDown) {
        toggleTimeCell($(e.target));
      }
    });
  };

  /**
   * Helper function to bind all events to the page after the event loads and the data has been
   * injected into the DOM
   */
  const bindEvents = () => {
    $eAddPersonIcon.on('click', showNewPersonForm);
    $eNewPersonInput.on('input', (e) => {
      $(e.target).attr('size', $(e.target).val().length < 4 ? 1 : Math.min($(e.target).val().length - 2, 25));
    });
    app.keys.keyUpBound($eNewPersonInput[0], 'enter', () => { $eSubmitPersonIcon.trigger('click'); });
    app.keys.keyUpBound($eNewPersonInput[0], 'esc', hideNewPersonForm);
    bindNewUserEvent();
    bindDeleteEvent($('.delete-person'));
    bindToggleEvent($('.person-name'));
    bindTimeCellClickEvent();

    // Prompt the user before they navigate away if they have unsaved changes or if a request is
    // in progress
    window.addEventListener('beforeunload', (e) => {
      if (preventNavigation || editingUser !== '') {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  };

  /**
   * Helper function that injects event data into the DOM after it has loaded
   * @param  {Object} response Response object from the get request
   */
  const setupPage = (response) => {
    eventData = response;
    $eTitle[0].innerHTML = eventData.name;
    $eDescription[0].innerHTML = eventData.desc;
    $ePeopleList.prepend(Object.values(eventData.people).map(person => makeUserDiv(person)).join(''));
    $('#time-table-wrapper').append(app.tableBuilder.buildDateTable(new Date(eventData.startDate), new Date(eventData.endDate), 30));
    // Scroll down to roughly 6:00am
    $('#time-table-wrapper').scrollTop(400);
    bindEvents();
    showAllSchedules();
  };

  /**
   * Init the page, make a get request for the event data
   * @return {[type]} [description]
   */
  const init = () => {
    // Cache JQuery selectors. I probably missed a few
    $eTitle = $('#event-page-title');
    $eDescription = $('#event-page-description');
    $ePeopleList = $('.people-list-wrapper');
    $eAddPerson = $('#add-person');
    $eAddPersonIcon = $('#add-icon');
    $eSubmitPersonIcon = $('#submit-person-icon');
    $eNewPersonInput = $('#new-person-input');

    // Pull the eventID from the page URL
    // eventID = window.location.href.split('?')[1].split('=')[1]
    // Eslint wanted me to change the above line to this:
    const [, splitURL] = window.location.href.split('?');
    [, eventID] = splitURL.split('=');
    // Make a get request for the event data
    app.ajax.get('/getEvent', { id: eventID }).then((response) => {
      setupPage(response);
    }).catch((err) => {
      handleError(err);
    });
  };

  return {
    init,
  };
})();
