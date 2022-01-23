var selectionTimestamp;

chrome.contextMenus.create({
    'id':'zy_time_tool_menu',
    'type':'normal',
    'title':'选取时间',
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
            return;
        }
        if (/\d{13}/.test(text)) {
            var time = moment(parseInt(text));
            var timestamp = text;
            var datetime = time.format('YYYY-MM-DD HH:mm:ss');
            alert(`选中的时间戳为 [ ${timestamp} ]\n对应的时间为 [ ${datetime} ]`);
            selectionTimestamp = timestamp;
            return;
        }
        
        alert(`选中的内容 [ ${text} ] 不是时间信息`);

    }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    if (message == 'current_selection_time') {
        sendResponse(selectionTimestamp);
    }
});