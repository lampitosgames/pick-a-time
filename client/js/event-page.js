app.pagescript = (() => {
  let $eTitle;
  let $eDescription;
  let $ePeopleList;
  let $eAddPerson;
  let $eAddPersonIcon;
  let $eSubmitPersonIcon;
  let $eNewPersonInput;
  let eventID;
  let eventData = {};

  const init = () => {
    $eTitle = $('#event-page-title');
    $eDescription = $('#event-page-description');
    $ePeopleList = $('.people-list-wrapper');
    $eAddPerson = $('#add-person');
    $eAddPersonIcon = $('#add-icon');
    $eSubmitPersonIcon = $('#submit-person-icon');
    $eNewPersonInput = $('#new-person-input');

    // Get event data via ajax
    eventID = window.location.href.split('?')[1].split('=')[1];
    app.ajax.get('/getEvent', { id: eventID }).then((response) => {
      setupPage(response);
    }).catch((err) => {
      handleError(err);
    });
  };

  const setupPage = (response) => {
    eventData = response;
    $eTitle[0].innerHTML = eventData.name;
    $eDescription[0].innerHTML = eventData.desc;
    $ePeopleList.prepend(Object.values(eventData.people).map(person => makeUserDiv(person)).join(''));
    $("#time-table-wrapper").append(app.tableBuilder.buildDateTable(new Date(eventData.startDate), new Date(eventData.endDate), 30));
    bindEvents();
  };

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

  const bindEvents = () => {
    $eAddPersonIcon.on('click', showNewPersonForm);
    $eNewPersonInput.on('input', (e) => {
      $(e.target).attr('size', $(e.target).val().length < 4 ? 1 : Math.min($(e.target).val().length - 2, 25));
    });
    app.keys.keyUpBound($eNewPersonInput[0], 'enter', () => { $eSubmitPersonIcon.trigger('click'); });
    app.keys.keyUpBound($eNewPersonInput[0], 'esc', hideNewPersonForm);

    bindNewUserEvent();
    bindDeleteEvent();
  }

  const bindDeleteEvent = () => {
    $('.delete-person').on('click', (e) => {
      const userElement = $(e.target).parent();
      const username = $(e.target).data('name');
      app.ajax.post('/deletePerson', { eventID, person: username })
        .then(() => {
          delete eventData.people[username];
          userElement.remove();
        })
        .catch(err => handleError(err));
    });
  };

  const bindNewUserEvent = () => {
    $eSubmitPersonIcon.on('click', () => {
      const name = $eNewPersonInput.val();
      if (name.length > 0) {
        if (!Object.prototype.hasOwnProperty.call(eventData.people, name)) {
          app.ajax.post('/addPerson', { eventID, person: name }).then((newPerson) => {
            eventData.people[newPerson.name] = newPerson;
            $ePeopleList.prepend(makeUserDiv(newPerson));
            bindDeleteEvent($(`i[data-name="${newPerson.name}"]`));
            hideNewPersonForm();
          });
        } else {
          handleError('Name already exists');
        }
      }
    });
  }

  const handleError = err => console.error(err);

  return {
    init,
  };
})();