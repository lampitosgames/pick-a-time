app.pagescript = (() => {
  let a = app;

  let $eTitle, $eDescription, $eStartDate, $eEndDate, $eSubmit;

  let titleValue = "";
  let descValue = "";
  let startDate = "";
  let endDate = "";

  const init = () => {
    $eTitle = $("#event-title");
    $eDescription = $("#event-description");
    $eStartDate = $("#event-start-date");
    $eEndDate = $("#event-end-date");
    $eSubmit = $("#event-create");

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
        $eStartDate.addClass("input-hidden");
        $eStartDate.val("");
      } else {
        $eStartDate.removeClass("input-hidden");
        $eStartDate.removeClass("input-hascontent");
      }
    });
    $eStartDate.on("input", () => {
      startDate = $eStartDate.val();
      if (startDate === "") {
        $eEndDate.addClass("input-hidden");
        $eEndDate.val("");
      } else {
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
    })
  }

  return {
    init
  }
})();