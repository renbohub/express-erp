var express = require('express');
var knex = require('../../config/connection');

const ReadRoute = async (req, res) => {
    try {
        var data = await knex.table('l_routes');
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

const ReadRouteId = async (req, res) => {
    try {
        var data = await knex.table('l_routes').where({ route_id: req.query.id });
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

const CreateRoute = async (req, res) => {
    try {
        var newRoute = {
            route_name: req.body.route_name,
            route_url: req.body.route_url,
        };
        var q = await knex('l_routes').insert(newRoute);
        return res.status(200).send({
            message: "Route Created Successfully",
            data: q
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

const UpdateRoute = async (req, res) => {
    try {
        var w_id = req.body.route_id;
        var updateData = {
            route_name: req.body.route_name,
            route_url: req.body.route_url,
        };
        var q = await knex('l_routes').update(updateData).where({ route_id: w_id });
        return res.status(200).send({
            message: "Route Updated Successfully",
            data: q
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

const DeleteRoute = async (req, res) => {
    try {
        var q = await knex('l_routes').where({ route_id: req.params.id }).del();
        return res.status(200).send({
            message: "Route Deleted Successfully",
            data: q
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

module.exports = { ReadRoute, ReadRouteId, CreateRoute, UpdateRoute, DeleteRoute };
