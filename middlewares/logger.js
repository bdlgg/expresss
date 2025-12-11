function logger(req, res, next) {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.url;
    const query = JSON.stringify(req.query);
    const body = JSON.stringify(req.body);
    console.log(`[${timestamp}] ${method} ${url}`);
    console.log(`Query params: ${query}`);
    if (method === 'POST' || method === 'PUT') {
        console.log(`Body: ${body}`);
    }
    res.locals.requestTime = timestamp;
    next();
}
module.exports = logger;