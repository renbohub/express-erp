var express = require('express');
var knex = require('../../config/connection');

const ReadApp = async (req, res) => {
    try {
        var data = await knex.table('l_apps');
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

const ReadAppId = async (req, res) => {
    try {
        var data = await knex.table('l_apps').where({ app_id: req.query.id });
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

const CreateApp = async (req, res) => {
    try {
        var newApp = {
            app_name: req.body.app_name,
            app_url: req.body.app_url,
            app_code: req.body.app_code,
        };
        var q = await knex('l_apps').insert(newApp);
        return res.status(200).send({
            message: "App Created Successfully",
            data: q
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

const UpdateApp = async (req, res) => {
    try {
        var w_id = req.body.app_id;
        var updateData = {
            app_name: req.body.app_name,
            app_url: req.body.app_url,
            app_code: req.body.app_code,
        };
        var q = await knex('l_apps').update(updateData).where({ app_id: w_id });
        return res.status(200).send({
            message: "App Updated Successfully",
            data: q
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

const DeleteApp = async (req, res) => {
    try {
        var q = await knex('l_apps').where({ app_id: req.params.id }).del();
        return res.status(200).send({
            message: "App Deleted Successfully",
            data: q
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

module.exports = { ReadApp, ReadAppId, CreateApp, UpdateApp, DeleteApp };
