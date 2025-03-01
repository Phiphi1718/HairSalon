const filterAttributes = (allowedFields) => {
    return (req, res, next) => {
        Object.keys(req.body).forEach((key) => {
            if (!allowedFields.includes(key)) delete req.body[key];
        });
        next();
    };
};

module.exports = { filterAttributes };