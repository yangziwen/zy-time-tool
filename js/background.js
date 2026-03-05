var currentTimestamp = '';
var currentDatetime = '';

// Manifest V3 要求在 onInstalled 中创建上下文菜单
chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        'id': 'zy_time_tool_menu',
        'type': 'normal',
        'title': '提取时间信息',
        'contexts': ['selection']
    });
});
        
// 使用 onClicked 监听器替代 onclick 属性
chrome.contextMenus.onClicked.addListener(function(info, tab) {
    if (!info || !info.selectionText) {
        return;
    }
    var text = info.selectionText.trim();

    // 检测日期时间格式 yyyy-MM-dd HH:mm:ss
    if (/^(\d{4})-(\d{2})-(\d{2})(?:\s(\d{2})\:(\d{2})\:(\d{2}))?$/.test(text)) {
        // 使用原生 Date 解析日期
        var date = new Date(text);
        var timestamp = date.getTime().toString();
        var datetime = text;

        // 保存到 storage，防止 Service Worker 终止后丢失
        chrome.storage.local.set({
            selectionTimestamp: timestamp,
            selectionDatetime: datetime
        });
        currentTimestamp = timestamp;
        currentDatetime = datetime;

        // 通知用户 - 通过 content script
        notifyUser(tab.id, '选中时间为 [ ' + datetime + ' ]\n对应的时间戳为 [ ' + timestamp + ' ]');
        return;
    }

    // 检测时间戳格式
    if (/^\d+$/.test(text)) {
        var timestamp = text;
        var date = new Date(parseInt(text));
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');
        var hours = String(date.getHours()).padStart(2, '0');
        var minutes = String(date.getMinutes()).padStart(2, '0');
        var seconds = String(date.getSeconds()).padStart(2, '0');
        var datetime = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;

        // 保存到 storage
        chrome.storage.local.set({
            selectionTimestamp: timestamp,
            selectionDatetime: datetime
        });
        currentTimestamp = timestamp;
        currentDatetime = datetime;

        // 通知用户
        notifyUser(tab.id, '选中的时间戳为 [ ' + timestamp + ' ]\n对应的时间为 [ ' + datetime + ' ]');
        return;
    }

    // 不是时间格式
    notifyUser(tab.id, '选中的内容 [ ' + text + ' ] 不是时间信息');
});

// 通过 content script 通知用户
function notifyUser(tabId, message) {
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: function(msg) {
            alert(msg);
        },
        args: [message]
    }).catch(function(err) {
        console.log('无法显示提示:', err);
    });
}

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message == 'current_selection_time') {
        // 从 storage 读取选中的时间戳
        chrome.storage.local.get(['selectionTimestamp'], function(result) {
            sendResponse(result.selectionTimestamp);
        });
        return true; // 异步响应需要返回 true
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