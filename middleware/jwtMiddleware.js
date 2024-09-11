const jwt   = require('jsonwebtoken');
const knex  = require('../config/connection')


const verifyToken = async(req, res ,next) => {
    try {
        if(req.headers['x-access-token']==null){
            return res.status(500).send({
                auth: false,
                message: "Error",
                errors: "no header"
            }); 
        }
        
        let tokenHeader = req.headers['x-access-token'];

        if (tokenHeader.split(' ')[0] !== 'Bearer') {
            return res.status(500).send({
                auth: false,
                message: "Error",
                errors: "Incorrect token format"
            });
        }

        let token = tokenHeader.split(' ')[1];

        if (!token) {
            return res.status(403).send({
                auth: false,
                message: "Error",
                errors: "No token provided"
            });
        }

        jwt.verify(token, process.env.TOKEN_SECRET, async(err, decoded) => {
            if (err) {
                return res.status(500).send({
                    auth: false,
                    message: "Error",
                    errors: err
                });
            }
            req.userId = decoded.role;
            var data = await knex('l_users').where({
                role_id:req.userId
            }).join('l_clients','l_clients.client_id','l_users.client_id');

            var role_id = data[0].role_id;
            var cust_id = data[0].customer_id;
            var package_id = data[0].package_id;
            req.data = data[0];
            req.permit = await knex('t_route_permissions').where({
                role_id: role_id
            }).join('l_routes','l_routes.route_id','t_route_permissions.route_id');
            
            var mens = await knex('t_app_permissions').where({
                package_id: package_id
            }).join('l_apps','l_apps.app_id','t_app_permissions.app_id');
            
            const base64Images = mens.map(men => ({
                app_logo: men.app_logo.toString('base64'),
                app_permission_id: men.app_permission_id,
                app_id: men.app_id,
                package_id: men.package_id,
                app_name: men.app_name,
                app_url: men.app_url,
                app_code: men.app_code,
                created_at: men.created_at,
                updated_at: men.updated_at,
              }));

             
              req.menu = base64Images

            next();
        });
    }
    catch (e) {
        res.status(500).send({
          message: "Error",
          errors: "Invalid Password!"
        });
    }
}

module.exports ={
    verifyToken
}