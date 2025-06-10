import {generateBarcode} from "../../../utils/utils";

export default async (req, res) => {
    res.setHeader("content-disposition", "attachment; filename=barcode.svg");
    return res.status(200).send(generateBarcode(req.query.id));
}