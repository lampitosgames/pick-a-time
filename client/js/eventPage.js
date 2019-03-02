app.pagescript = (() => {
  //Init individual page elements
  let $eTitle, $eDescription, $ePeopleList, $eAddPerson, $eAddPersonIcon, $eSubmitPersonIcon, $eNewPersonInput;
  //Initialize event ID (gets set in the init function)
  let eventID;
  let eventData = {};

  const handleError = (err) => console.error(err);

  const makeUserDiv = (person) => {
    let userName = person.name;
    let userColor = person.color;
    return `<div class="person-name" style="background-color: ${userColor}" data-name="${userName}">${userName} <i data-name="${userName}" class="material-icons md-light md-small delete-person">cancel</i></div>`
  }

  const showNewPersonForm = () => {
    $eAddPersonIcon.hide();
    $eSubmitPersonIcon.show();
    $eNewPersonInput.removeClass("new-person-input-hidden").val("").attr("size", 1);
    $eNewPersonInput[0].focus();
    $eAddPerson.addClass("adding-person");
  }

  const hideNewPersonForm = () => {
    $eAddPersonIcon.show();
    $eSubmitPersonIcon.hide();
    $eNewPersonInput.addClass("new-person-input-hidden").val("");
    $eAddPerson.removeClass("adding-person");
  }

  const bindDeleteEvent = ($element) => {
    $element.on('click', (e) => {
      let userElement = $(e.target).parent();
      let username = $(e.target).data("name");
      app.ajax.post("/deletePerson", { eventID, person: username })
        .then(() => {
          delete eventData.people[username];
          userElement.remove();
        })
        .catch((err) => handleError(err));
    });
  }

  const setupPage = (response) => {
    eventData = response;
    //Set the event title
    $eTitle[0].innerHTML = eventData.name;
    //Set the event description
    $eDescription[0].innerHTML = eventData.desc;
    //Show all the people
    $ePeopleList.prepend(Object.values(eventData.people).map((person) => makeUserDiv(person)).join(""));
    //Bind click event to generated 
    bindDeleteEvent($(".delete-person"));

    $eAddPersonIcon.on('click', showNewPersonForm);
    $eNewPersonInput.on('input', (e) => { $(e.target).attr("size", $(e.target).val().length < 4 ? 1 : Math.min($(e.target).val().length - 2, 25)) });
    app.keys.keyUpBound($eNewPersonInput[0], "enter", () => {
      $eSubmitPersonIcon.trigger("click");
    });
    app.keys.keyUpBound($eNewPersonInput[0], "esc", hideNewPersonForm);
    $eSubmitPersonIcon.on('click', () => {
      let name = $eNewPersonInput.val();
      if (name.length > 0) {
        if (!Object.prototype.hasOwnProperty.call(eventData.people, name)) {
          app.ajax.post("/addPerson", { eventID, person: name }).then((newPerson) => {
            eventData.people[newPerson.name] = newPerson;
            $ePeopleList.prepend(makeUserDiv(newPerson));
            bindDeleteEvent($(`i[data-name="${newPerson.name}"]`));
            hideNewPersonForm();
          });
        } else {
          handleError("Name already exists");
        }
      }
    });
  }

  /**
   * Called on the event page when the app starts
   */
  const init = () => {
    $eTitle = $("#event-page-title");
    $eDescription = $("#event-page-description");
    $ePeopleList = $(".people-list-wrapper");
    $eAddPerson = $("#add-person");
    $eAddPersonIcon = $("#add-icon");
    $eSubmitPersonIcon = $("#submit-person-icon");
    $eNewPersonInput = $("#new-person-input");

    //Get event data via ajax
    eventID = window.location.href.split("?")[1].split("=")[1];
    app.ajax.get("/getEvent", { "id": eventID }).then((response) => {
      setupPage(response);
    }).catch((err) => {
      handleError(err);
    });
  }

  return {
    init
  }
})();