app.pagescript = (() => {
  let $eTitle;
  let $eDescription;
  let $ePeopleList;
  let $eAddPerson;
  let $eAddPersonIcon;
  let $eSubmitPersonIcon;
  let $eNewPersonInput;

  let preventNavigation = false;

  let eventID;
  let eventData = {};

  let touchDown = false;
  let mouseDown = false;

  let editingUser = '';

  const handleError = err => console.error(err);


  const makeUserDiv = (person) => {
    const userName = person.name;
    const userColor = person.color;
    return `<div class="person-name" style="background-color: ${userColor}" data-name="${userName}">${userName} <i data-name="${userName}" class="material-icons md-light md-small delete-person">cancel</i></div>`;
  };

  const showNewPersonForm = () => {
    $eAddPersonIcon.hide();
    $eSubmitPersonIcon.show();
    $eNewPersonInput.removeClass('new-person-input-hidden').val('').attr('size', 1);
    $eNewPersonInput[0].focus();
    $eAddPerson.addClass('adding-person');
  };

  const hideNewPersonForm = () => {
    $eAddPersonIcon.show();
    $eSubmitPersonIcon.hide();
    $eNewPersonInput.addClass('new-person-input-hidden').val('');
    $eAddPerson.removeClass('adding-person');
  };

  const toggleTimeCell = ($cell) => {
    if (editingUser === '') { return; }
    const cellID = $cell.data('timestamp');
    const cellActive = $cell.data('active');

    const person = eventData.people[editingUser];
    const timeArrayTimestampIndex = person.times.indexOf(cellID);

    $cell.data('active', !cellActive);
    if (!cellActive) {
      $cell.css('background-color', person.color);
      if (timeArrayTimestampIndex === -1) {
        person.times.push(cellID);
      }
    } else {
      $cell.removeAttr('style');
      if (timeArrayTimestampIndex > -1) {
        person.times.splice(timeArrayTimestampIndex, 1);
      }
    }
  };

  const showAllSchedules = () => {
    $('.time-cell').removeAttr('style');
    $('.time-cell').data('active', false);
    let meetingTimes = [];
    const nameList = Object.keys(eventData.people);
    if (nameList.length > 0) {
      meetingTimes = eventData.people[nameList[0]].times.map(time => time);
    }
    for (let p = 0; p < nameList.length; p++) {
      const person = eventData.people[nameList[p]];
      if (person.times.length !== 0) {
        for (let i = 0; i < person.times.length; i++) {
          const thisCell = $(`.time-cell[data-timestamp="${person.times[i]}"]`);
          thisCell.css('box-shadow', 'inset 0 0 100px 100px rgba(255, 255, 255, 0.8)');
          thisCell.css('background-color', person.color);
        }
        meetingTimes = meetingTimes.filter((mTime) => {
          const timeIndex = person.times.indexOf(mTime);
          return timeIndex > -1;
        });
      }
    }
    for (let m = 0; m < meetingTimes.length; m++) {
      const thisCell = $(`.time-cell[data-timestamp="${meetingTimes[m]}"]`);
      thisCell.removeAttr('style');
      thisCell.css('background-color', '#83B83B');
    }
  };

  const showUserSchedule = (user) => {
    $('.time-cell').removeAttr('style');
    $('.time-cell').data('active', false);
    const person = eventData.people[user];
    const userTimes = person.times;
    for (let i = 0; i < userTimes.length; i++) {
      const thisCell = $(`.time-cell[data-timestamp="${userTimes[i]}"]`);
      thisCell.css('background-color', person.color);
      thisCell.data('active', true);
    }
  };

  const uploadUserSchedule = (user) => {
    preventNavigation = true;
    app.ajax.post('/setPersonSchedule', { eventID, person: user, times: eventData.people[user].times })
      .then((res) => {
        eventData.people[user] = res;
        preventNavigation = false;
      }).catch((err) => {
        handleError(err);
        preventNavigation = false;
      });
  };

  const bindDeleteEvent = ($element) => {
    $element.on('click', (e) => {
      e.stopPropagation();
      const userElement = $(e.target).parent();
      const username = $(e.target).data('name');
      preventNavigation = true;
      app.ajax.post('/deletePerson', { eventID, person: username })
        .then(() => {
          preventNavigation = false;
          delete eventData.people[username];
          userElement.remove();
          editingUser = '';
          showAllSchedules();
        })
        .catch((err) => {
          handleError(err);
          preventNavigation = false;
        });
    });
  };

  const bindToggleEvent = ($element) => {
    $element.on('click', (e) => {
      const eUser = $(e.target).data('name');
      $('.person-name').removeClass('editing-person-schedule');
      if (editingUser === eUser) {
        editingUser = '';
        showAllSchedules();
        uploadUserSchedule(eUser);
        return;
      }
      if (editingUser !== '') {
        uploadUserSchedule(editingUser);
      }
      editingUser = eUser;
      $(e.target).addClass('editing-person-schedule');
      showUserSchedule(eUser);
    });
  };

  const bindNewUserEvent = () => {
    $eSubmitPersonIcon.on('click', () => {
      const name = $eNewPersonInput.val();
      if (name.length > 0) {
        if (!Object.prototype.hasOwnProperty.call(eventData.people, name)) {
          preventNavigation = true;
          app.ajax.post('/addPerson', { eventID, person: name }).then((newPerson) => {
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

    window.addEventListener('beforeunload', (e) => {
      if (preventNavigation || editingUser !== '') {
        e.preventDefault();
        e.returnValue = '';
      }
    });
  };

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

  const init = () => {
    $eTitle = $('#event-page-title');
    $eDescription = $('#event-page-description');
    $ePeopleList = $('.people-list-wrapper');
    $eAddPerson = $('#add-person');
    $eAddPersonIcon = $('#add-icon');
    $eSubmitPersonIcon = $('#submit-person-icon');
    $eNewPersonInput = $('#new-person-input');

    // This next line breaks ESLint, but the way eslint wants me to do it is silly
    const [, splitURL] = window.location.href.split('?');
    [, eventID] = splitURL.split('=');
    // eventID = window.location.href.split('?')[1].split('=')[1];
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
