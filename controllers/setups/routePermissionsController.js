var express = require('express');
var knex = require('../../config/connection');

const ReadRoutePermission = async (req, res) => {
    try {
        var data = await knex.table('t_route_permissions');
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

const ReadRoutePermissionId = async (req, res) => {
    try {
        var data = await knex.table('t_route_permissions').where({ route_permission_id: req.query.id });
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

const CreateRoutePermission = async (req, res) => {
    try {
        var newRoutePermission = {
            role_id: req.body.role_id,
            route_id: req.body.route_id,
        };
        var q = await knex('t_route_permissions').insert(newRoutePermission);
        return res.status(200).send({
            message: "Route Permission Created Successfully",
            data: q
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

const UpdateRoutePermission = async (req, res) => {
    try {
        var w_id = req.body.route_permission_id;
        var updateData = {
            role_id: req.body.role_id,
            route_id: req.body.route_id,
        };
        var q = await knex('t_route_permissions').update(updateData).where({ route_permission_id: w_id });
        return res.status(200).send({
            message: "Route Permission Updated Successfully",
            data: q
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

const DeleteRoutePermission = async (req, res) => {
    try {
        var q = await knex('t_route_permissions').where({ route_permission_id: req.params.id }).del();
        return res.status(200).send({
            message: "Route Permission Deleted Successfully",
            data: q
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

module.exports = { ReadRoutePermission, ReadRoutePermissionId, CreateRoutePermission, UpdateRoutePermission, DeleteRoutePermission };
