var express = require('express');
var knex = require('../../config/connection');

const ReadProduct = async (req, res) => {
    try {
        var data = await knex.table('l_products').where({client_id:req.data.client_id});
        return res.status(200).send({
            message: "Success",
            data: data
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

const ReadProductId = async (req, res) => {
    try {
        var data = await knex.table('l_products').where({ product_id: req.query.id });
        return res.status(200).send({
            message: "Success",
            data: data
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

const CreateProduct = async (req, res) => {
    try {
        console.log(req.body)
        var newApp = {
            type_product_id: req.body.type_product_id,
            product_number: req.body.product_number,
            product_name: req.body.product_name,
            product_desc: req.body.product_desc,
            product_brand: req.body.product_brand,
            product_base_price: req.body.product_base_price,
            unit_id: req.body.unit_id,
            client_id: req.data.client_id
        };
        
        var q = await knex('l_products').insert(newApp);
        return res.status(200).send({
            message: "App Created Successfully",
            data: q
        });
    } catch (e) {
        console.log(e)
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

const UpdateProduct = async (req, res) => {
    try {
        var w_id = req.body.product_id;
        var updateData = {
            type_product_id: req.body.type_product_id,
            product_number: req.body.product_number,
            product_name: req.body.product_name,
            product_desc: req.body.product_desc,
            product_brand: req.body.product_brand,
            product_base_price: req.body.product_base_price,
            unit_id: req.body.unit_id
        };
        var q = await knex('l_products').update(updateData).where({ product_id: w_id });
        return res.status(200).send({
            message: "App Updated Successfully",
            data: q
        });
    } catch (e) {
        console.log(e)
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
        
    }
};

const DeleteProduct = async (req, res) => {
    try {
    
        var q = await knex('l_products').where({ product_id: req.query.id }).del();
        return res.status(200).send({
            message: "App Deleted Successfully",
            data: q
        });
    } catch (e) {
        console.log(e);
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

module.exports = { ReadProduct, ReadProductId, CreateProduct, UpdateProduct, DeleteProduct };
