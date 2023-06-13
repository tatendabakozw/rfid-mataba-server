const express = require("express");
const router = express.Router();

router.post("/values", async (req, res) => {
  try {
    const { temp_val, humidity_val, distance_val, light_val, ph_value, ip_address, code } = req.body;
    const values = {
      temp: temp_val,
      humidity: humidity_val,
      distance: distance_val,
      light: light_val,
      ph_value: ph_value,
      ip_address: ip_address
    };
    console.log('items from arduino --- ',req.body);

    global.io.sockets.emit("values_updates", { values: req.body });

    return res.status(200).send({
      message: "Values Received",
      values: req.body,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error });
  }
});

router.get('/ip', async (req, res, next)=>{
  try {
    // const { ip_address } = req.body;
    return res.status(200).send({
      message: "Ip Received",
      values: "ip_address",
    });
  } catch (error) {
    next(error)
  }
})

router.post('/address', async (req, res, next)=>{
  try {
    const { address } = req.body;
    // console.log(address)
    global.io.sockets.emit("update_address", { address: address });
    return res.status(200).send({
      message: address,
      values: "ip_address",
    });
  } catch (error) {
    next(error)
  }
})


module.exports = router;
