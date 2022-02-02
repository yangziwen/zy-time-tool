var selectionTimestamp;

var currentTimestamp = '';

var currentDatetime = '';

chrome.contextMenus.create({
    'id':'zy_time_tool_menu',
    'type':'normal',
    'title':'提取时间信息',
    'contexts':['selection'],
    'onclick': (info) => {
        if (!info || !info.selectionText) {
            alert('选中内容无效');
            return;
        }
        var text = info.selectionText.trim();
        if (/^(\d{4})-(\d{2})-(\d{2})(?:\s(\d{2})\:(\d{2})\:(\d{2}))?$/.test(text)) {
            var time = moment(text);
            var timestamp = time.format('x');
            var datetime = text;
            alert(`选中时间为 [ ${datetime} ]\n对应的时间戳为 [ ${timestamp} ]`);
            selectionTimestamp = timestamp;
            currentTimestamp = timestamp;
            currentDatetime = datetime;
            return;
        }
        if (/^\d{13}$/.test(text)) {
            var time = moment(parseInt(text));
            var timestamp = text;
            var datetime = time.format('YYYY-MM-DD HH:mm:ss');
            alert(`选中的时间戳为 [ ${timestamp} ]\n对应的时间为 [ ${datetime} ]`);
            selectionTimestamp = timestamp;
            currentTimestamp = timestamp;
            currentDatetime = datetime;
            return;
        }
        
        alert(`选中的内容 [ ${text} ] 不是时间信息`);

    }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    if (message == 'current_selection_time') {
        sendResponse(selectionTimestamp);
        return;
    }
    if (message.startsWith('current_timestamp_')) {
        currentTimestamp = message.replace('current_timestamp_', '');
        return;
    }
    if (message.startsWith('current_datetime_')) {
        currentDatetime = message.replace('current_datetime_', '');
        return;
    }
    if (message === 'current_values') {
        sendResponse({
            timestamp: currentTimestamp,
            datetime: currentDatetime
        });
    }
});