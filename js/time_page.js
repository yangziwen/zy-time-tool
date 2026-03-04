// 获取当前选中的时区
function getSelectedTimezone() {
    var timezoneSelect = document.getElementById('zy_timezone_select');
    return timezoneSelect ? timezoneSelect.value : 'Asia/Shanghai';
}

// 将时间戳转换为指定时区的日期时间字符串
function convertTimestampToDatetime(timestamp, timezone) {
    if (!timestamp || !/^\d+$/.test(timestamp.trim())) {
        return '时间戳不合法';
    }
    return moment(parseInt(timestamp)).tz(timezone).format('YYYY-MM-DD HH:mm:ss');
}

// 将指定时区的日期时间字符串转换为时间戳
function convertDatetimeToTimestamp(datetime, timezone) {
    var results = /^(\d{4})-(\d{2})-(\d{2})(?:\s(\d{2})\:(\d{2})\:(\d{2}))?$/.exec(datetime);
    if (results == null) {
        return '日期时间格式不合法';
    }
    return moment.tz(datetime, 'YYYY-MM-DD HH:mm:ss', timezone).format('x');
}

// 获取指定时区的当前时间
function getCurrentTime(timezone) {
    return moment().tz(timezone);
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
    var timezoneSelect = document.getElementById('zy_timezone_select');

    var inputValuesChanged = () => {
        var timezone = getSelectedTimezone();
        var timestamp = tsInput.value.trim();
        var datetime = convertDatetimeToTimestamp(dtInput.value.trim(), timezone)
        var timestampAcceptable = /^\d+$/.test(timestamp);
        var datetimeAcceptable = /^\d+$/.test(datetime);
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

    // 保存时区设置到 chrome.storage
    var saveTimezone = (timezone) => {
        chrome.storage.local.set({ selectedTimezone: timezone });
    };

    // 时区变化时，更新日期时间显示并保存时区设置
    timezoneSelect.onchange = () => {
        var timezone = getSelectedTimezone();
        // 保存时区设置
        saveTimezone(timezone);
        var timestamp = tsInput.value.trim();
        // 如果时间戳有效，重新转换为当前时区的日期时间
        if (/^\d+$/.test(timestamp)) {
            dtInput.value = convertTimestampToDatetime(timestamp, timezone);
        }
        inputValuesChanged();
    };

    tsInput.onkeyup = inputValuesChanged;

    tsInput.onchange = inputValuesChanged;

    dtInput.onkeyup = inputValuesChanged;

    dtInput.onchange = inputValuesChanged;

    currentTimeBtn.onclick = () => {
        var timezone = getSelectedTimezone();
        var now = getCurrentTime(timezone);
        tsInput.value = now.format('x');
        dtInput.value = now.format('YYYY-MM-DD HH:mm:ss');
        inputValuesChanged();
    }

    selectionTimeBtn.onclick = () => {
        chrome.runtime.sendMessage('current_selection_time', (selectionTimestamp) => {
            if (!selectionTimestamp) {
                return;
            }
            var timezone = getSelectedTimezone();
            var time = moment(parseInt(selectionTimestamp)).tz(timezone);
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
        var timezone = getSelectedTimezone();
        var timestamp = tsInput.value.trim();
        var datetime = convertTimestampToDatetime(timestamp, timezone);
        dtInput.value = datetime;
        inputValuesChanged();
    }

    dtToTsBtn.onclick = () => {
        var timezone = getSelectedTimezone();
        var datetime = dtInput.value.trim();
        tsInput.value = convertDatetimeToTimestamp(datetime, timezone);
        inputValuesChanged();
    }

    plusTimeBtn.onclick = () => {
        var timezone = getSelectedTimezone();
        var delta = parseInt(timeDeltaInput.value || 0);
        var unit = timeUnitSelect.value;
        if (delta == 0) {
            return;
        }
        var timestamp = tsInput.value.trim();
        var datetime = convertDatetimeToTimestamp(dtInput.value.trim(), timezone);
        if (/^\d+$/.test(timestamp)) {
            tsInput.value = moment(parseInt(timestamp)).add(delta, unit + 's').format('x');
        }
        if (/^\d+$/.test(datetime)) {
            dtInput.value = moment(parseInt(datetime)).tz(timezone).add(delta, unit + 's').format('YYYY-MM-DD HH:mm:ss');
        }
        inputValuesChanged();
    }

    minusTimeBtn.onclick = () => {
        var timezone = getSelectedTimezone();
        var delta = parseInt(timeDeltaInput.value || 0);
        var unit = timeUnitSelect.value;
        if (delta == 0) {
            return;
        }
        var timestamp = tsInput.value.trim();
        var datetime = convertDatetimeToTimestamp(dtInput.value.trim(), timezone);
        if (/^\d+$/.test(timestamp)) {
            tsInput.value = moment(parseInt(timestamp)).subtract(delta, unit + 's').format('x');
        }
        if (/^\d+$/.test(datetime)) {
            dtInput.value = moment(parseInt(datetime)).tz(timezone).subtract(delta, unit + 's').format('YYYY-MM-DD HH:mm:ss');
        }
        inputValuesChanged();
    }

    truncateTimeBtn.onclick = () => {
        var timezone = getSelectedTimezone();
        var unit = timeUnitSelect.value;
        var timestamp = tsInput.value.trim();
        if (/^\d+$/.test(timestamp)) {
            // 先转换到目标时区，再执行向下取整
            var tzTime = moment(parseInt(timestamp)).tz(timezone).startOf(unit);
            tsInput.value = tzTime.format('x');
            dtInput.value = tzTime.format('YYYY-MM-DD HH:mm:ss');
        }
        inputValuesChanged();
    }

    ceilingTimeBtn.onclick = () => {
        var timezone = getSelectedTimezone();
        var unit = timeUnitSelect.value;
        var timestamp = tsInput.value.trim();
        if (/^\d+$/.test(timestamp)) {
            // 先转换到目标时区，再执行向上取整
            var tzTime = moment(parseInt(timestamp)).tz(timezone).endOf(unit);
            tsInput.value = tzTime.format('x');
            dtInput.value = tzTime.format('YYYY-MM-DD HH:mm:ss');
        }
        inputValuesChanged();
    }

    // 恢复保存的时区设置
    chrome.storage.local.get(['selectedTimezone'], (result) => {
        if (result.selectedTimezone) {
            timezoneSelect.value = result.selectedTimezone;
        }
    });

    chrome.runtime.sendMessage('current_values', ({timestamp, datetime}) => {
        tsInput.value = timestamp;
        dtInput.value = datetime;
        inputValuesChanged();
    });

}, false);

