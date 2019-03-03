app.tableBuilder = (() => {
  const dayNames = {
    0: "sun",
    1: "mon",
    2: "tue",
    3: "wed",
    4: "thu",
    5: "fri",
    6: "sat"
  }

  /**
   * Main function for this module. Constructs an HTML table with all required
   * classes/data for the given date range
   * @param  {Date} startDate Start of the date range
   * @param  {Date} endDate   End of the date range
   * @param  {Int}  timestep  Time (in minutes) between each table row. Must divide evenly into an hour
   * @return {String}         HTML string
   */
  const buildDateTable = (startDate, endDate, timestep) => {
    let html = `<table class="time-picker-table noselect">`;
    let dates = getDateRange(startDate, endDate);
    html += buildHeader(dates);
    html += buildBody(dates, timestep);
    html += `</table>`

    return html;
  }

  const getDateRange = (start, end) => {
    let cur = start;
    let dateArr = [];
    for (let d = cur.getUTCDate(); cur <= end; ++d) {
      cur = new Date(start.getFullYear(), start.getUTCMonth(), d);
      dateArr.push(cur);
    }
    return dateArr;
  }

  const buildHeader = (dateArr) => {
    let html = `<thead class="picker-table-header"><tr><th></th>`;

    for (let i = 0; i < dateArr.length; i++) {
      curDate = dateArr[i];
      let dayName = dayNames[curDate.getUTCDay()];
      let day = curDate.getUTCDate() < 10 ? "0" + curDate.getUTCDate() : curDate.getUTCDate();
      let month = curDate.getUTCMonth() < 9 ? "0" + (curDate.getUTCMonth() + 1) : curDate.getUTCMonth() + 1;
      let dateString = dayName + " " + day + "/" + month;
      html += `<th>${dateString}</th>`;
    }
    html += `</tr></thead>`;
    return html;
  }

  const buildBody = (dateArr, timestep) => {
    let html = `<tbody class="picker-table-body">`;

    for (let hh = 0; hh < 25; hh++) {
      for (let mm = 0; mm < 60; mm += timestep) {
        let hFormatted = hh % 12 == 0 ? 12 : hh % 12;

        let hString = hFormatted < 10 ? "0" + hFormatted : "" + hFormatted;
        let mString = mm < 10 ? "0" + mm : "" + mm;

        html += `<tr><th>${hString}:${mString}</th>`;

        for (let i = 0; i < dateArr.length; i++) {
          let curDate = dateArr[i];
          let day = curDate.getUTCDate() < 10 ? "0" + curDate.getUTCDate() : curDate.getUTCDate();
          let month = curDate.getUTCMonth() < 9 ? "0" + (curDate.getUTCMonth() + 1) : curDate.getUTCMonth() + 1;
          let year = curDate.getFullYear();
          let cellID = year + "-" + month + "-" + day + "T" + hString + ":" + mString + ":00";
          html += `<td class="time-cell" data-timestamp="${cellID}"></td>`;
        }
        html += `</tr>`;
      }
    }
    html += `</tbody>`;
    return html;
  }

  return { buildDateTable };
})();