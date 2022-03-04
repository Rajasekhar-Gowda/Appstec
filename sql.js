const sql = require('mssql');

/* SQL CONFIG */
const sql_config = {
		user: 'shuveen',
    password: '12345678',
    server: 'DESKTOP-QGTSTF2', 
    
    database: 't1',
    dialect: "mssql",
    port :54329,
    trustServerCertificate: true,
    dialectOptions: {
        instanceName:"SQLEXPRESS"
    },
    
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    }
};

sql.on('error', err => {
  console.log('SQL ERROR:');
  console.log(err);
})

var conx;
sql.connect(sql_config).then(pool => {
	conx = pool;
//	console.log("connected to database")
});

module.exports = function(query, params) {
	
	params = params || {}; // default to empty JSON if undefined
	
	var req = conx.request();

	// loop through params JSON and add them as input
	Object.keys(params).forEach(key => {
		req.input(key, params[key]);
	})
		
	return req.query(query).then(result => {
		return result.recordset;
	}).catch(err => {
		console.log(err);
		return null;
	});
}
