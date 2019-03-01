app.pagescript = (() => {
  //Init individual page elements
  let $eTitle, $eDescription;
  //Initialize event ID (gets set in the init function)
  let eventID;
  let eventData = {};

  //Event data object (will be unpopulated until get request responds)
  let titleValue = "";
  let descValue = "";
  let startDate = "";
  let endDate = "";

  /**
   * Called on the event page when the app starts
   */
  const init = () => {
    //Get event data via ajax
    eventID = window.location.href.split("?")[1].split("=")[1];
    app.ajax.get("/getEvent", { "id": eventID }).then((response) => {
      eventData = response;
      $("#title")[0].innerHTML = eventData.name;
    }).catch((err) => {
      console.error(err);
    });
  }

  return {
    init
  }
})();