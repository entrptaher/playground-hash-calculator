const Datastore = require('nedb-promises');
const db = new Datastore({ filename: 'hash-workers.db', autoload: true, timestampData: true });

db.insert({producer: '', consumer: '', currentHash: ''}).then(data=>console.log(data))
db.count({}).then(data=>console.log(data))
db.update({ _id: '7al9QXeWmOp0AsUF' }, { $set: { currentHash: 'solar system' } }, { multi: true }).then(data=>console.log(data))
db.find({}).then(data=>console.log(data))
db.remove({ _id: '7al9QXeWmOp0AsUF' }).then(data=>console.log(data))