function Message(id, type, to, cmd, data) {
    this.v = "1.1";

    if(id && id.length > 0)
        this.id = id;

    if (type && type.length > 0)
        this.type = type;

    if (to && to.length > 0)
        this.to = to;

    if (cmd && cmd.length > 0)
        this.cmd = cmd;

    if(data)
        this.data = data;
}

Message.prototype.getResponse = function (to, data) {
    return new Message(this.id, 'response', to, data);
}

Message.prototype.toString = function () {
    return JSON.stringify(this);
}

module.exports = Message;
