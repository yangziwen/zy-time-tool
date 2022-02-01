function convertTimestampToDatetime(timestamp) {
    if (!timestamp || !/^\d{13}$/.test(timestamp.trim())) {
        return '时间戳不合法';
    }
    return moment(parseInt(timestamp)).format('YYYY-MM-DD HH:mm:ss');
}

function convertDatetimeToTimestamp(datetime) {
    var results = /^(\d{4})-(\d{2})-(\d{2})(?:\s(\d{2})\:(\d{2})\:(\d{2}))?$/.exec(datetime);
    if (results == null) {
        return '日期时间格式不合法';
    }
    return moment(datetime).format('x');
}

document.addEventListener('DOMContentLoaded', () => {

    var tsInput = document.getElementById('zy_ts_input');
    var dtInput = document.getElementById('zy_dt_input');
    var tsToDtBtn = document.getElementById('zy_ts_to_dt_btn');
    var dtToTsBtn = document.getElementById('zy_dt_to_ts_btn');
    var currentTimeBtn = document.getElementById('zy_current_time_btn');
    var selectionTimeBtn = document.getElementById('zy_selection_time_btn');
    var clearTimeBtn = document.getElementById('zy_clear_time_btn');
    var timeDeltaInput = document.getElementById('zy_time_delta_input');
    var timeUnitSelect = document.getElementById('zy_time_unit_select');
    var plusTimeBtn = document.getElementById('zy_plus_time_btn');
    var minusTimeBtn = document.getElementById('zy_minus_time_btn');
    var ceilingTimeBtn = document.getElementById('zy_ceiling_time_btn');
    var truncateTimeBtn = document.getElementById('zy_truncate_time_btn');

    var inputValuesChanged = () => {
        var timestamp = tsInput.value.trim();
        var datetime = convertDatetimeToTimestamp(dtInput.value.trim())
        var timestampAcceptable = /^\d{13}$/.test(timestamp);
        var datetimeAcceptable = /^\d{13}$/.test(datetime);
        if (timestampAcceptable && datetimeAcceptable) {
            if (timestamp === datetime) {
                tsToDtBtn.disabled = true;
                dtToTsBtn.disabled = true;
            } else if (timestamp.substring(0, 10) + '000' == datetime) {
                tsToDtBtn.disabled = true;
                dtToTsBtn.disabled = false;
            }else {
                tsToDtBtn.disabled = false;
                dtToTsBtn.disabled = false;
            }
        } else if (timestampAcceptable && !datetimeAcceptable) {
            tsToDtBtn.disabled = false;
            dtToTsBtn.disabled = true;
        } else if (!timestampAcceptable && datetimeAcceptable) {
            tsToDtBtn.disabled = true;
            dtToTsBtn.disabled = false;
        } else if (!timestampAcceptable && !datetimeAcceptable) {
            tsToDtBtn.disabled = true;
            dtToTsBtn.disabled = true;
        }
        chrome.runtime.sendMessage('current_timestamp_' + tsInput.value);
        chrome.runtime.sendMessage('current_datetime_' + dtInput.value);
    }

    tsInput.onkeyup = inputValuesChanged;

    tsInput.onchange = inputValuesChanged;

    dtInput.onkeyup = inputValuesChanged;

    dtInput.onchange = inputValuesChanged;

    currentTimeBtn.onclick = () => {
        var now = moment();
        tsInput.value = now.format('x');
        dtInput.value = now.format('YYYY-MM-DD HH:mm:ss');
        inputValuesChanged();
    }

    selectionTimeBtn.onclick = () => {
        chrome.runtime.sendMessage('current_selection_time', (selectionTimestamp) => {
            if (!selectionTimestamp) {
                return;
            }
            var time = moment(parseInt(selectionTimestamp));
            tsInput.value = time.format('x');
            dtInput.value = time.format('YYYY-MM-DD HH:mm:ss');
            inputValuesChanged();
        });
    }

    clearTimeBtn.onclick = () => {
        tsInput.value = '';
        dtInput.value = '';
        inputValuesChanged();
    }

    tsToDtBtn.onclick = () => {
        var timestamp = tsInput.value.trim();
        var datetime = convertTimestampToDatetime(timestamp);
        dtInput.value = datetime;
        inputValuesChanged();
    }

    dtToTsBtn.onclick = () => {
        var datetime = dtInput.value.trim();
        tsInput.value = convertDatetimeToTimestamp(datetime);
        inputValuesChanged();
    }

    plusTimeBtn.onclick = () => {
        var delta = parseInt(timeDeltaInput.value || 0);
        var unit = timeUnitSelect.value;
        if (delta == 0) {
            return;
        }
        var timestamp = tsInput.value.trim();
        var datetime = convertDatetimeToTimestamp(dtInput.value.trim());
        if (/^\d{13}$/.test(timestamp)) {
            tsInput.value = moment(parseInt(timestamp)).add(delta, unit + 's').format('x');
        }
        if (/^\d{13}$/.test(datetime)) {
            dtInput.value = moment(parseInt(datetime)).add(delta, unit + 's').format('YYYY-MM-DD HH:mm:ss');
        }
        inputValuesChanged();
    }

    minusTimeBtn.onclick = () => {
        var delta = parseInt(timeDeltaInput.value || 0);
        var unit = timeUnitSelect.value;
        if (delta == 0) {
            return;
        }
        var timestamp = tsInput.value.trim();
        var datetime = convertDatetimeToTimestamp(dtInput.value.trim());
        if (/^\d{13}$/.test(timestamp)) {
            tsInput.value = moment(parseInt(timestamp)).subtract(delta, unit + 's').format('x');
        }
        if (/^\d{13}$/.test(datetime)) {
            dtInput.value = moment(parseInt(datetime)).subtract(delta, unit + 's').format('YYYY-MM-DD HH:mm:ss');
        }
        inputValuesChanged();
    }

    truncateTimeBtn.onclick = () => {
        var unit = timeUnitSelect.value;
        var timestamp = tsInput.value.trim();
        var datetime = convertDatetimeToTimestamp(dtInput.value.trim());
        if (/^\d{13}$/.test(timestamp)) {
            tsInput.value = moment(parseInt(timestamp)).startOf(unit).format('x');
        }
        if (/^\d{13}$/.test(datetime)) {
            dtInput.value = moment(parseInt(datetime)).startOf(unit).format('YYYY-MM-DD HH:mm:ss');
        }
        inputValuesChanged();
    }

    ceilingTimeBtn.onclick = () => {
        var unit = timeUnitSelect.value;
        var timestamp = tsInput.value.trim();
        var datetime = convertDatetimeToTimestamp(dtInput.value.trim());
        if (/^\d{13}$/.test(timestamp)) {
            tsInput.value = moment(parseInt(timestamp)).endOf(unit).format('x');
        }
        if (/^\d{13}$/.test(datetime)) {
            dtInput.value = moment(parseInt(datetime)).endOf(unit).format('YYYY-MM-DD HH:mm:ss');
        }
        inputValuesChanged();
    }

    chrome.runtime.sendMessage('current_values', ({timestamp, datetime}) => {
        tsInput.value = timestamp;
        dtInput.value = datetime;
        inputValuesChanged();
    });

}, false);

