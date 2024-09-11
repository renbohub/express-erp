const express = require('express');
const knex = require('../../config/connection');

const ReadCustomer = async (req, res) => {
    try {
        const data = await knex.table('l_customers').where({
            client_id:req.data.client_id
        });
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

const ReadCustomerId = async (req, res) => {
    try {
        const data = await knex.table('l_customers').where({ customer_id: req.query.id });
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

const CreateCustomer = async (req, res) => {
    try {
        console.log(req.data.client_id)
        const newCustomer = {
            customer_name: req.body.customer_name,
            customer_company: req.body.customer_company,
            customer_email: req.body.customer_email,
            customer_address: req.body.customer_address,
            customer_allias: req.body.customer_allias,
            customer_number: req.body.customer_number,
            client_id: req.data.client_id,
        };
        const q = await knex('l_customers').insert(newCustomer);
        return res.status(200).send({
            message: "Customer Created Successfully",
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

const UpdateCustomer = async (req, res) => {
    try {
        const w_id = req.body.customer_id;
        const updateData = {
            customer_name: req.body.customer_name,
            customer_company: req.body.customer_company,
            customer_email: req.body.customer_email,
            customer_start: req.body.customer_start,
            customer_address: req.body.customer_address,
            customer_allias: req.body.customer_allias,
            customer_number: req.body.customer_number,
        };
        const q = await knex('l_customers').update(updateData).where({ customer_id: w_id });
        return res.status(200).send({
            message: "Customer Updated Successfully",
            data: q
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

const DeleteCustomer = async (req, res) => {
    try {
        const q = await knex('l_customers').where({ customer_id: req.query.id }).del();
        return res.status(200).send({
            message: "Customer Deleted Successfully",
            data: q
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

module.exports = { ReadCustomer, ReadCustomerId, CreateCustomer, UpdateCustomer, DeleteCustomer };
