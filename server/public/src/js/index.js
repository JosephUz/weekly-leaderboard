const juel = require('juel');
const jueue = require('jueue');

var refreshBtn = $('#refreshBtn'),
    addBtn = $('#addBtn'),
    scoreNbr = $('#scoreNbr'),
    userNameTxt = $('#userNameTxt'),
    currentUserFld = $('#currentUserFld');

var scope = juel.scope({
    leaders: [],
    own: []
});

juel.template.read();

juel.append("#usersCntr", "users", scope, {
    items: function (leaders, own) {
        return leaders.concat(own.length > 0 ? [{
            rank: '...',
            rankChanges: '...',
            userName: '...',
            score: '...',
            age: '...',
            userId: '...'
        }] : []).concat(own).map(item => {
            return juel.create("user", item, {
                hide: function (type) {
                    if (type == 1)
                        return item.rankChanges > 0 ? '' : 'd-none';
                    else if (type == 0)
                        return item.rankChanges == 0 ? '' : 'd-none';
                    else if (type == -1)
                        return item.rankChanges < 0 ? '' : 'd-none';
                }
            }).toHTML()
        });
    }
});

function getUser() {
    return jueue.promise(e => {
        post('/user/get', { userName: userNameTxt.val() }).then(res => {
            if (res.status) {
                if (res.data) {
                    setUser(res.data);
                    e.done(res.data);
                } else {
                    e.next();
                }
            } else {
                e.throw(new Error(res.message));
            }
        }).catch(e.throw);
    }, e => {
        post('/user/add', { userName: userNameTxt.val(), age: Math.floor(Math.random() * 63) }).then(res => {
            if (res.status) {
                setUser(res.data);
                e.done(res.data);
            } else {
                e.throw(new Error(res.message));
            }
        });
    });
}

function setUser(user) {
    if (user)
        currentUserFld.text('Current User: ' + user.userName);
    else
        currentUserFld.text('Current User');
}

function getList() {
    return jueue.promise(e => {
        getUser().then(user => {
            e.user = user;
            e.next();
        }).catch(e.throw)
    }, e => {
        post('/score/list', { userId: e.user.userId }).then(res => {
            if (res.status) {
                scope.leaders = res.data.leaders;
                scope.own = res.data.own;
                e.done();
            } else {
                e.throw(new Error(res.message));
            }
        }).catch(e.throw);
    });
}

function addScore() {
    return jueue.promise(e => {
        getUser().then(user => {
            e.user = user;
            e.next();
        }).catch(e.throw)
    }, e => {
        post('/score/add', { userId: e.user.userId, score: Number(scoreNbr.val()) }).then(res => {
            if (res.status) {
                e.done();
            } else {
                e.throw(new Error(res.message));
            }
        }).catch(e.throw);
    });
}

function showNotification(message, type) {
    $.notify(
        {
            icon: "add_alert",
            message: message
        },
        {
            type: type || 'info',
            timer: 3000,
            placement: {
                from: "top",
                align: "center"
            }
        }
    );
}

function post(url, data) {
    return jueue.promise(e => {
        $.ajax({
            url: url,
            method: "POST",
            contentType: "application/json",
            dataType: "json",
            data: JSON.stringify(data || {})
        }).done(function (response) {
            e.done(response);
        }).fail(function (jqXHR, textStatus) {
            e.throw(new Error(textStatus));
        });
    });
}

function init() {
    refreshBtn.on('click', function (e) {
        var spinner = new Spinner().spin();
        refreshBtn.append(spinner.el);

        getList().then(data => {
            spinner.el.remove();
        }).catch(err => {
            spinner.el.remove();
            showNotification(err.message, "danger");
        });
    });

    addBtn.on('click', function (e) {
        var spinner = new Spinner().spin();
        addBtn.append(spinner.el);

        addScore().then(data => {
            spinner.el.remove();
        }).catch(err => {
            spinner.el.remove();
            showNotification(err.message, "danger");
        });
    });

    var spinner = new Spinner().spin();
    refreshBtn.append(spinner.el);
    getList().then(data => {
        spinner.el.remove();
    }).catch(err => {
        spinner.el.remove();
        showNotification(err.message, "danger");
    });
}

$(document).ready(init);