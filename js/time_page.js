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

// 批量转换时间戳为日期时间
function convertTimestampsToDatetimes(timestamps, timezone) {
    return timestamps.map(function(ts) {
        return convertTimestampToDatetime(ts, timezone);
    });
}

// 批量转换日期时间为时间戳
function convertDatetimesToTimestamps(datetimes, timezone) {
    return datetimes.map(function(dt) {
        return convertDatetimeToTimestamp(dt, timezone);
    });
}

document.addEventListener('DOMContentLoaded', () => {

    var tsInput = document.getElementById('zy_ts_input');
    var dtInput = document.getElementById('zy_dt_input');
    var tsInputBatch = document.getElementById('zy_ts_input_batch');
    var dtInputBatch = document.getElementById('zy_dt_input_batch');
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
    var batchModeBtn = document.getElementById('zy_batch_mode_btn');

    // 批量模式状态
    var isBatchMode = false;

    // 获取当前模式下的输入元素
    function getTsInput() {
        return isBatchMode ? tsInputBatch : tsInput;
    }

    function getDtInput() {
        return isBatchMode ? dtInputBatch : dtInput;
    }

    // 切换批量模式
    function toggleBatchMode() {
        isBatchMode = !isBatchMode;

        if (isBatchMode) {
            document.body.classList.add('batch-mode');
            batchModeBtn.textContent = '单条模式';

            // 隐藏单条输入框，显示批量输入框
            tsInput.classList.add('hidden');
            tsInputBatch.classList.remove('hidden');
            dtInput.classList.add('hidden');
            dtInputBatch.classList.remove('hidden');

            // 同步数据：将单条数据复制到批量输入框
            if (tsInput.value.trim()) {
                tsInputBatch.value = tsInput.value;
            }
            if (dtInput.value.trim()) {
                dtInputBatch.value = dtInput.value;
            }
        } else {
            document.body.classList.remove('batch-mode');
            batchModeBtn.textContent = '批量模式';

            // 显示单条输入框，隐藏批量输入框
            tsInput.classList.remove('hidden');
            tsInputBatch.classList.add('hidden');
            dtInput.classList.remove('hidden');
            dtInputBatch.classList.add('hidden');

            // 同步数据：取批量输入框的第一行到单条输入框
            var tsLines = tsInputBatch.value.split('\n').filter(
                function (line) {
                    return line.trim();
                });
            var dtLines = dtInputBatch.value.split('\n').filter(
                function (line) {
                    return line.trim();
                });
            tsInput.value = tsLines[0] || '';
            dtInput.value = dtLines[0] || '';
        }

        inputValuesChanged();
    }

    function inputValuesChanged() {
        var timezone = getSelectedTimezone();
        var currentTsInput = getTsInput();
        var currentDtInput = getDtInput();
        var timestamp = currentTsInput.value.trim();
        var datetime = convertDatetimeToTimestamp(currentDtInput.value.trim(), timezone);
        var timestampAcceptable = /^\d+$/.test(timestamp);
        var datetimeAcceptable = /^\d+$/.test(datetime);

        if (isBatchMode) {
            // 批量模式下始终启用转换按钮
            tsToDtBtn.disabled = false;
            dtToTsBtn.disabled = false;
        } else {
            if (timestampAcceptable && datetimeAcceptable) {
                if (timestamp === datetime) {
                    tsToDtBtn.disabled = true;
                    dtToTsBtn.disabled = true;
                } else if (timestamp.substring(0, 10) + '000' == datetime) {
                    tsToDtBtn.disabled = true;
                    dtToTsBtn.disabled = false;
                } else {
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
        }
        chrome.runtime.sendMessage('current_timestamp_' + currentTsInput.value);
        chrome.runtime.sendMessage('current_datetime_' + currentDtInput.value);
    }

    // 保存时区设置到 chrome.storage
    function saveTimezone(timezone) {
        chrome.storage.local.set({ selectedTimezone: timezone });
    }

    // 时区变化时，更新日期时间显示并保存时区设置
    timezoneSelect.onchange = function() {
        var timezone = getSelectedTimezone();
        // 保存时区设置
        saveTimezone(timezone);

        if (isBatchMode) {
            // 批量模式：重新转换所有时间戳
            var timestamps = tsInputBatch.value.split('\n').filter(function(line) { return line.trim(); });
            if (timestamps.length > 0) {
                var results = convertTimestampsToDatetimes(timestamps, timezone);
                dtInputBatch.value = results.join('\n');
            }
        } else {
            var timestamp = tsInput.value.trim();
            // 如果时间戳有效，重新转换为当前时区的日期时间
            if (/^\d+$/.test(timestamp)) {
                dtInput.value = convertTimestampToDatetime(timestamp, timezone);
            }
        }
        inputValuesChanged();
    };

    tsInput.onkeyup = inputValuesChanged;
    tsInput.onchange = inputValuesChanged;
    dtInput.onkeyup = inputValuesChanged;
    dtInput.onchange = inputValuesChanged;
    tsInputBatch.onkeyup = inputValuesChanged;
    tsInputBatch.onchange = inputValuesChanged;
    dtInputBatch.onkeyup = inputValuesChanged;
    dtInputBatch.onchange = inputValuesChanged;

    batchModeBtn.onclick = toggleBatchMode;

    currentTimeBtn.onclick = function() {
        var timezone = getSelectedTimezone();
        var now = getCurrentTime(timezone);
        var currentTsInput = getTsInput();
        var currentDtInput = getDtInput();
        currentTsInput.value = now.format('x');
        currentDtInput.value = now.format('YYYY-MM-DD HH:mm:ss');
        inputValuesChanged();
    }

    selectionTimeBtn.onclick = function() {
        chrome.runtime.sendMessage('current_selection_time', function(selectionTimestamp) {
            if (!selectionTimestamp) {
                return;
            }
            var timezone = getSelectedTimezone();
            var time = moment(parseInt(selectionTimestamp)).tz(timezone);
            var currentTsInput = getTsInput();
            var currentDtInput = getDtInput();

            if (isBatchMode) {
                // 批量模式：追加到现有内容
                var existingTs = currentTsInput.value.trim();
                var existingDt = currentDtInput.value.trim();
                currentTsInput.value = existingTs ? existingTs + '\n' + time.format('x') : time.format('x');
                currentDtInput.value = existingDt ? existingDt + '\n' + time.format('YYYY-MM-DD HH:mm:ss') : time.format('YYYY-MM-DD HH:mm:ss');
            } else {
                currentTsInput.value = time.format('x');
                currentDtInput.value = time.format('YYYY-MM-DD HH:mm:ss');
            }
            inputValuesChanged();
        });
    }

    clearTimeBtn.onclick = function() {
        tsInput.value = '';
        dtInput.value = '';
        tsInputBatch.value = '';
        dtInputBatch.value = '';
        inputValuesChanged();
    }

    tsToDtBtn.onclick = function() {
        var timezone = getSelectedTimezone();

        if (isBatchMode) {
            // 批量转换
            var timestamps = tsInputBatch.value.split('\n').filter(function(line) { return line.trim(); });
            var results = convertTimestampsToDatetimes(timestamps, timezone);
            dtInputBatch.value = results.join('\n');
        } else {
            var timestamp = tsInput.value.trim();
            var datetime = convertTimestampToDatetime(timestamp, timezone);
            dtInput.value = datetime;
        }
        inputValuesChanged();
    }

    dtToTsBtn.onclick = function() {
        var timezone = getSelectedTimezone();

        if (isBatchMode) {
            // 批量转换
            var datetimes = dtInputBatch.value.split('\n').filter(function(line) { return line.trim(); });
            var results = convertDatetimesToTimestamps(datetimes, timezone);
            tsInputBatch.value = results.join('\n');
        } else {
            var datetime = dtInput.value.trim();
            tsInput.value = convertDatetimeToTimestamp(datetime, timezone);
        }
        inputValuesChanged();
    }

    plusTimeBtn.onclick = function() {
        var timezone = getSelectedTimezone();
        var delta = parseInt(timeDeltaInput.value || 0);
        var unit = timeUnitSelect.value;
        if (delta == 0) {
            return;
        }

        if (isBatchMode) {
            var timestamps = tsInputBatch.value.split('\n');
            var datetimes = dtInputBatch.value.split('\n');

            var tsResults = timestamps.map(function(ts) {
                if (/^\d+$/.test(ts.trim())) {
                    return moment(parseInt(ts.trim())).add(delta, unit + 's').format('x');
                }
                return ts;
            });
            tsInputBatch.value = tsResults.join('\n');

            var dtResults = datetimes.map(function(dt) {
                var converted = convertDatetimeToTimestamp(dt.trim(), timezone);
                if (/^\d+$/.test(converted)) {
                    return moment(parseInt(converted)).tz(timezone).add(delta, unit + 's').format('YYYY-MM-DD HH:mm:ss');
                }
                return dt;
            });
            dtInputBatch.value = dtResults.join('\n');
        } else {
            var timestamp = tsInput.value.trim();
            var datetime = convertDatetimeToTimestamp(dtInput.value.trim(), timezone);
            if (/^\d+$/.test(timestamp)) {
                tsInput.value = moment(parseInt(timestamp)).add(delta, unit + 's').format('x');
            }
            if (/^\d+$/.test(datetime)) {
                dtInput.value = moment(parseInt(datetime)).tz(timezone).add(delta, unit + 's').format('YYYY-MM-DD HH:mm:ss');
            }
        }
        inputValuesChanged();
    }

    minusTimeBtn.onclick = function() {
        var timezone = getSelectedTimezone();
        var delta = parseInt(timeDeltaInput.value || 0);
        var unit = timeUnitSelect.value;
        if (delta == 0) {
            return;
        }

        if (isBatchMode) {
            var timestamps = tsInputBatch.value.split('\n');
            var datetimes = dtInputBatch.value.split('\n');

            var tsResults = timestamps.map(function(ts) {
                if (/^\d+$/.test(ts.trim())) {
                    return moment(parseInt(ts.trim())).subtract(delta, unit + 's').format('x');
                }
                return ts;
            });
            tsInputBatch.value = tsResults.join('\n');

            var dtResults = datetimes.map(function(dt) {
                var converted = convertDatetimeToTimestamp(dt.trim(), timezone);
                if (/^\d+$/.test(converted)) {
                    return moment(parseInt(converted)).tz(timezone).subtract(delta, unit + 's').format('YYYY-MM-DD HH:mm:ss');
                }
                return dt;
            });
            dtInputBatch.value = dtResults.join('\n');
        } else {
            var timestamp = tsInput.value.trim();
            var datetime = convertDatetimeToTimestamp(dtInput.value.trim(), timezone);
            if (/^\d+$/.test(timestamp)) {
                tsInput.value = moment(parseInt(timestamp)).subtract(delta, unit + 's').format('x');
            }
            if (/^\d+$/.test(datetime)) {
                dtInput.value = moment(parseInt(datetime)).tz(timezone).subtract(delta, unit + 's').format('YYYY-MM-DD HH:mm:ss');
            }
        }
        inputValuesChanged();
    }

    truncateTimeBtn.onclick = function() {
        var timezone = getSelectedTimezone();
        var unit = timeUnitSelect.value;

        if (isBatchMode) {
            var timestamps = tsInputBatch.value.split('\n');

            var results = timestamps.map(function(ts) {
                if (/^\d+$/.test(ts.trim())) {
                    var tzTime = moment(parseInt(ts.trim())).tz(timezone).startOf(unit);
                    return tzTime.format('x');
                }
                return ts;
            });
            tsInputBatch.value = results.join('\n');

            // 更新日期时间显示
            var dtResults = results.map(function(ts) {
                if (/^\d+$/.test(ts.trim())) {
                    return moment(parseInt(ts.trim())).tz(timezone).format('YYYY-MM-DD HH:mm:ss');
                }
                return '时间戳不合法';
            });
            dtInputBatch.value = dtResults.join('\n');
        } else {
            var timestamp = tsInput.value.trim();
            if (/^\d+$/.test(timestamp)) {
                var tzTime = moment(parseInt(timestamp)).tz(timezone).startOf(unit);
                tsInput.value = tzTime.format('x');
                dtInput.value = tzTime.format('YYYY-MM-DD HH:mm:ss');
            }
        }
        inputValuesChanged();
    }

    ceilingTimeBtn.onclick = function() {
        var timezone = getSelectedTimezone();
        var unit = timeUnitSelect.value;

        if (isBatchMode) {
            var timestamps = tsInputBatch.value.split('\n');

            var results = timestamps.map(function(ts) {
                if (/^\d+$/.test(ts.trim())) {
                    var tzTime = moment(parseInt(ts.trim())).tz(timezone).endOf(unit);
                    return tzTime.format('x');
                }
                return ts;
            });
            tsInputBatch.value = results.join('\n');

            // 更新日期时间显示
            var dtResults = results.map(function(ts) {
                if (/^\d+$/.test(ts.trim())) {
                    return moment(parseInt(ts.trim())).tz(timezone).format('YYYY-MM-DD HH:mm:ss');
                }
                return '时间戳不合法';
            });
            dtInputBatch.value = dtResults.join('\n');
        } else {
            var timestamp = tsInput.value.trim();
            if (/^\d+$/.test(timestamp)) {
                var tzTime = moment(parseInt(timestamp)).tz(timezone).endOf(unit);
                tsInput.value = tzTime.format('x');
                dtInput.value = tzTime.format('YYYY-MM-DD HH:mm:ss');
            }
        }
        inputValuesChanged();
    }

    // 恢复保存的时区设置
    chrome.storage.local.get(['selectedTimezone'], function(result) {
        if (result.selectedTimezone) {
            timezoneSelect.value = result.selectedTimezone;
        }
    });

    chrome.runtime.sendMessage('current_values', function(data) {
        var timestamp = data.timestamp;
        var datetime = data.datetime;
        tsInput.value = timestamp;
        dtInput.value = datetime;
        inputValuesChanged();
    });

}, false);

