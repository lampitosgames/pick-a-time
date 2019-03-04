app.tableBuilder = (() => {
  // Just an enum of day names for mapping the return value of Date.getUTCDay()
  const dayNames = {
    0: 'sun',
    1: 'mon',
    2: 'tue',
    3: 'wed',
    4: 'thu',
    5: 'fri',
    6: 'sat',
  };

  /**
   * Creates an array of all the days between the start and end dates
   * @param  {Date}   start Start day of range
   * @param  {Date}   end   End day of range
   * @return {Array}        Array of dates between the start/end dates (inclusive)
   */
  const getDateRange = (start, end) => {
    let cur = start;
    const dateArr = [];
    for (let d = cur.getUTCDate(); cur <= end; ++d) {
      cur = new Date(start.getFullYear(), start.getUTCMonth(), d);
      dateArr.push(cur);
    }
    return dateArr;
  };

  /**
   * Helper function that builds an HTML table header with a column for every date in an array
   * @param  {Array}  dateArr Array of dates
   * @return {String}         Partial HTML string
   */
  const buildHeader = (dateArr) => {
    let html = '<thead class="picker-table-header"><tr><th></th>';

    for (let i = 0; i < dateArr.length; i++) {
      const curDate = dateArr[i];
      const dayName = dayNames[curDate.getUTCDay()];
      const day = curDate.getUTCDate() < 10 ? `0${curDate.getUTCDate()}` : curDate.getUTCDate();
      const month = curDate.getUTCMonth() < 9 ? `0${curDate.getUTCMonth() + 1}` : curDate.getUTCMonth() + 1;
      const dateString = `${dayName} ${day}/${month}`;
      html += `<th>${dateString}</th>`;
    }
    html += '</tr></thead>';
    return html;
  };

  /**
   * Helper function that builds an HTML table body with a row for every time step
   * @param  {Array}  dateArr  Array of dates
   * @param  {Int}    timestep How much time (in minutes) each row represents. Must divide into 60
   * @return {String}          Partial HTML string
   */
  const buildBody = (dateArr, timestep) => {
    let html = '<tbody class="picker-table-body">';
    for (let hh = 0; hh < 25; hh++) {
      for (let mm = 0; mm < 60; mm += timestep) {
        const hFormatted = hh % 12 === 0 ? 12 : hh % 12;

        const hString = hFormatted < 10 ? `0${hFormatted}` : `${hFormatted}`;
        const mString = mm < 10 ? `0${mm}` : `${mm}`;

        html += `<tr><th>${hString}:${mString}</th>`;

        for (let i = 0; i < dateArr.length; i++) {
          const curDate = dateArr[i];
          const day = curDate.getUTCDate() < 10 ? `0${curDate.getUTCDate()}` : curDate.getUTCDate();
          const month = curDate.getUTCMonth() < 9 ? `0${curDate.getUTCMonth() + 1}` : curDate.getUTCMonth() + 1;
          const year = curDate.getFullYear();
          const cellID = `${year}-${month}-${day}T${hString}:${mString}:00`;
          html += `<td class="time-cell" data-timestamp="${cellID}"></td>`;
        }
        html += '</tr>';
      }
    }
    html += '</tbody>';
    return html;
  };

  /**
   * Main function for this module. Constructs an HTML table with all required
   * classes/data for the given date range
   * @param  {Date} startDate Start of the date range
   * @param  {Date} endDate   End of the date range
   * @param  {Int}  timestep  Time (in minutes) between each table row. Must
   *                            divide evenly into an hour
   * @return {String}         Constructed HTML table string
   */
  const buildDateTable = (startDate, endDate, timestep) => {
    let html = '<table class="time-picker-table noselect">';
    const dates = getDateRange(startDate, endDate);
    html += buildHeader(dates);
    html += buildBody(dates, timestep);
    html += '</table>';
    return html;
  };

  return { buildDateTable };
})();
