var knex = require('../../config/connection')
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const cheerio = require('cheerio');
const axios = require('axios');

const login = async(req, res ) => {
    try {
        let username = req.body.username;
        let password= req.body.password;
        var cari_email = await knex('l_users').where({
          user_email:username
        });
        if(cari_email.length==0){
          return res.status(404).send({
              auth: false,
              id: req.body.username,
              accessToken: null,
              message: "Error",
              errors: "User Not Found."
          })
        }
        var password_db = cari_email[0].user_password
        const password_req = req.body.password;
        var password_valid = bcrypt.compareSync(password_req, password_db); 
        if(!password_valid){
          return res.status(401).send({
            auth: false,
            id: req.body.id,
            accessToken: null,
            message: "Error",
            errors: "Invalid Password!"
          });
        }
        var email = cari_email[0].user_email;
        var id = cari_email[0].user_id;
        var role = cari_email[0].role_id;
        var name = cari_email[0].user_name;
        var client = cari_email[0].client_id;
        var token = 'Bearer ' + 
        jwt.sign(
            {
              email: email,id: id,role: role,client_id:client
            },process.env.TOKEN_SECRET , 
            {
              expiresIn: 86400 //24h expired
            }
        );
        res.status(200).send(
          {
            auth: true,
            id: req.body.id,
            menu: req.menu,
            username: name,
            accessToken: token,
            message: "Success",
            errors: null
          }
        );
    } 
    catch (e) {
      res.status(404).send({
        auth: false,
        id: req.body.username,
        accessToken:e ,
        message: "Error",
        errors: "Database Not Started"
       })
    }
}
const menu = async(req, res ) => {
  try {
      res.status(200).send(
        {
          
          message: "Success",
          desc: "",
          data: req.menu
        }
      );
  } 
  catch (e) {
    res.status(404).send({
      message: "Error",
      desc: "Database Error",
      data: null
     })
  }
}



module.exports = { login ,menu}