function convertTsToDt(timestamp) {
    if (!timestamp) {
        return '';
    }
    var datetime = new Date(parseInt(timestamp));
    var year = datetime.getFullYear();
    var month = formatNumber(datetime.getMonth() + 1);
    var date = formatNumber(datetime.getDate());
    var hour = formatNumber(datetime.getHours());
    var minute = formatNumber(datetime.getMinutes());
    var second = formatNumber(datetime.getSeconds());
    return `${year}-${month}-${date} ${hour}:${minute}:${second}`;
}

function formatNumber(value) {
    if (isNaN(value)) {
        return '';
    }
    if (value < 10) {
        return '0' + value;
    }
    return value;
}

var tsInput = document.getElementById('zy_ts_input');
var dtInput = document.getElementById('zy_dt_input');
var tsToDtBtn = document.getElementById('zy_ts_to_dt_btn');
var dtToTsBtn = document.getElementById('zy_dt_to_ts_btn');
var currentTimeBtn = document.getElementById('zy_current_time_btn');

currentTimeBtn.onclick = () => {
    var now = new Date();
    var timestamp = now.getTime();
    tsInput.value = timestamp;
    dtInput.value = convertTsToDt(timestamp);
}

tsToDtBtn.onclick = () => {
    var timestamp = tsInput.value;
    var datetime = convertTsToDt(timestamp);
    dtInput.value = datetime;
}

dtToTsBtn.onclick = () => {
    var datetime = dtInput.value.trim();
    var results = /^(\d{4})-(\d{2})-(\d{2})(?:\s(\d{2})\:(\d{2})\:(\d{2}))?$/.exec(datetime);
    var year = parseInt(results[1]);
    var month = parseInt(results[2]);
    var date = parseInt(results[3]);
    var hour = parseInt(results[4]) || 0;
    var minute = parseInt(results[5]) || 0;
    var second = parseInt(results[6]) || 0;
    var d = new Date();
    d.setYear(year);
    d.setMonth(month - 1);
    d.setDate(date);
    d.setHours(hour);
    d.setMinutes(minute);
    d.setSeconds(second);
    d.setMilliseconds(0);
    tsInput.value = d.getTime();
}