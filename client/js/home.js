app.pagescript = (() => {
  //Init individual page elements
  let $eTitle, $eDescription, $eStartLabel, $eStartDate, $eEndLabel, $eEndDate, $eSubmit;

  //Store the user-entered values to send during a POST request
  let titleValue = "";
  let descValue = "";
  let startDate = "";
  let endDate = "";

  /**
   * Called on the homepage when the app starts
   */
  const init = () => {
    //Get all relevant elements on the page
    $eTitle = $("#event-title");
    $eDescription = $("#event-description");
    $eStartLabel = $("#event-start-label");
    $eStartDate = $("#event-start-date");
    $eEndLabel = $("#event-end-label");
    $eEndDate = $("#event-end-date");
    $eSubmit = $("#event-create");

    //When the "submit" button is clicked, send a post request
    $eSubmit.click((e) => {
      //TODO: validate input
      if (titleValue !== "" && descValue !== "" && startDate !== "" && endDate !== "") {
        app.ajax.post("/newEvent", { "name": titleValue, "desc": descValue, "startDate": startDate, "endDate": endDate })
          .then((res) => {
            console.dir(res);
            window.location.replace(`/event?id=${res.id}`);
          })
          .catch((err) => { console.dir(err); });
      }
    });

    //Bind the "enter" key to progress app state
    app.keys.keyUpBound($eTitle[0], "enter", () => {
      $eDescription.focus();
    });
    app.keys.keyUpBound($eDescription[0], "enter", () => {
      $eStartDate.focus();
    });
    app.keys.keyUpBound($eStartDate[0], "enter", () => {
      $eEndDate.focus();
    });
    app.keys.keyUpBound($eEndDate[0], "enter", () => {
      $eSubmit.trigger("click");
    });

    //The rest of this function is just styling-related jquery stuff
    $(".text-input-full").on("input", (e) => {
      if ($(e.target).val() === "") {
        $(e.target).attr("size", 14);
        $(e.target).removeClass("input-hascontent");
      } else {
        $(e.target).attr("size", $(e.target).val().length);
        $(e.target).addClass("input-hascontent");
      }
    });

    $eTitle.on("input", () => {
      titleValue = $eTitle.val();
      if (titleValue === "") {
        $eDescription.addClass("input-hidden");
        $eDescription.val("");
      } else {
        $eDescription.removeClass("input-hidden");
        $eDescription.removeClass("input-hascontent");
      }
    });
    $eDescription.on("input", () => {
      descValue = $eDescription.val();
      if (descValue === "") {
        $eStartLabel.addClass("input-hidden");
        $eStartDate.addClass("input-hidden");
        $eStartDate.val("");
      } else {
        $eStartLabel.removeClass("input-hidden");
        $eStartDate.removeClass("input-hidden");
        $eStartDate.removeClass("input-hascontent");
      }
    });
    $eStartDate.on("input", () => {
      startDate = $eStartDate.val();
      if (startDate === "") {
        $eEndLabel.addClass("input-hidden");
        $eEndDate.addClass("input-hidden");
        $eEndDate.val("");
      } else {
        $eEndLabel.removeClass("input-hidden");
        $eEndDate.removeClass("input-hidden");
        $eEndDate.removeClass("input-hascontent");
      }
    });
    $eEndDate.on("input", () => {
      endDate = $eEndDate.val();
      if (endDate === "") {
        $eSubmit.addClass("input-hidden");
      } else {
        $eSubmit.removeClass("input-hidden");
      }
    });
  }

  return {
    init
  }
})();