function process(info, tab) {
    console.dir(info);
    console.dir(arguments);
}


chrome.contextMenus.create({
    'type':'normal',
    'title':'选取时间',
    'contexts':['selection'],
    'id':'cn',
    'onclick': process
});