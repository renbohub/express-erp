var express = require('express');
var knex    = require('../../config/connection')


const ReadClient = async(req, res ) => {
  try {
    var data = {
      client_id : req.data.client_id ,
      client_name : req.data.client_name,
      client_company : req.data.client_company,
      client_email : req.data.client_email,
      client_start : req.data.client_start,
      client_expired : req.data.client_expired,
      client_address : req.data.client_address,
      client_allias : req.data.client_allias,
      client_main_logo: req.data.client_main_logo.toString('base64'),
      client_small_logo: req.data.client_small_logo.toString('base64'),
    }
    return res.status(200).send(
      {
        message: "Success",
        data: data
      }
    );
  } 
  catch (e) {
      
  }
}
const UpdateClient = async(req, res ) => {
  try {
    var client_id = req.data.client_id
    console.log(req.body)
    const updateData = {
        client_name: req.body.client_name,
        client_company: req.body.client_company,
        client_email: req.body.client_email,
        client_allias: req.body.client_allias,
        client_address: req.body.client_address
    };

    // Check for presence of logos and add to updateData accordingly
    if (req.body.client_main_logo !== undefined && req.body.client_small_logo !== undefined) {
        updateData.client_main_logo = Buffer.from(req.body.client_main_logo, 'base64');
        updateData.client_small_logo = Buffer.from(req.body.client_small_logo, 'base64');
    } else if (req.body.client_main_logo !== undefined) {
        updateData.client_main_logo = Buffer.from(req.body.client_main_logo, 'base64');
    } else if (req.body.client_small_logo !== undefined) {
        updateData.client_small_logo = Buffer.from(req.body.client_small_logo, 'base64');
    }
    var q = await knex('l_clients').update(updateData).where({ client_id: client_id });
    return res.status(200).send(
      {
        message: "Success",
        data: q
      }
    );
  } 
  catch (e) {
      
  }
}

module.exports = {ReadClient, UpdateClient}