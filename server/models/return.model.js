function model(obj) {
    return {
        status: obj.status === undefined ? true : obj.status,
        data: obj.data || null,
        code: obj.code || "ok",
        message: obj.message || ""
    }
}

module.exports = model;