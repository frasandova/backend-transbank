
exports.createTokenTransbank = async (req, res) => {

    res.status(200).json({
        ok:true,
        msg: "createTokenTransbank"
    })
}


exports.putToken = async (req, res) => {
    const id = req.params.id;

    res.status(200).json({
        ok:true,
        msg: "putToken",
        id
    })
}

exports.deleteTokenTransbank = async (req, res) => {
    console.log('fsc')
    const query = req.query;
    res.status(200).json({
        ok:true,
        msg: "deleteTokenTransbank",
        query
    })
}

exports.sendFormTransbank = async (req, res) => {
    const body = req.body;
    res.status(200).json({
        ok:true,
        msg: "sendFormTransbank",
        body
    })
}

