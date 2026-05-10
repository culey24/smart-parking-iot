const mongoose = require("mongoose");
async function run() {
  await mongoose.connect("mongodb://admin:password@localhost:27017/smart-parking?authSource=admin");
  const config = await mongoose.connection.db.collection("mappingconfigs").findOne({ facilityId: "CAMPUS_PARKING_ALPHA" });
  if (!config) return console.log("No config found");

  const dbSensors = await mongoose.connection.db.collection("iotdevices").find({ deviceType: "SENSOR" }).toArray();
  let dbSensorIdx = 0;
  let boundCount = 0;

  const newLayout = config.layout.map(d => {
    if (d.type === "sensor" && !d.deviceId) {
      if (dbSensorIdx < dbSensors.length) {
        d.deviceId = dbSensors[dbSensorIdx].deviceId;
        dbSensorIdx++;
        boundCount++;
      }
    }
    return d;
  });

  await mongoose.connection.db.collection("mappingconfigs").updateOne(
    { facilityId: "CAMPUS_PARKING_ALPHA" },
    { $set: { layout: newLayout } }
  );

  console.log(`Bound ${boundCount} sensors to hardware IoT devices.`);
  process.exit(0);
}
run();
