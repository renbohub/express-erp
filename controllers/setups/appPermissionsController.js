var express = require('express');
var knex = require('../../config/connection');

const ReadAppPermission = async (req, res) => {
    try {
        var data = await knex.table('t_app_permissions')
        .join('l_apps','l_apps.app_id','t_app_permissions.app_id')
        .join('l_packages','l_packages.package_id','t_app_permissions.package_id');
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

const ReadAppPermissionId = async (req, res) => {
    try {
        var data = await knex.table('t_app_permissions').where({ app_permission_id: req.query.id });
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

const CreateAppPermission = async (req, res) => {
    try {
        var newAppPermission = {
            app_id: req.body.app_id,
            package_id: req.body.package_id,
        };
        var q = await knex('t_app_permissions').insert(newAppPermission);
        return res.status(200).send({
            message: "App Permission Created Successfully",
            data: q
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

const UpdateAppPermission = async (req, res) => {
    try {
        var w_id = req.body.app_permission_id;
        var updateData = {
            app_id: req.body.app_id,
            package_id: req.body.package_id,
        };
        var q = await knex('t_app_permissions').update(updateData).where({ app_permission_id: w_id });
        return res.status(200).send({
            message: "App Permission Updated Successfully",
            data: q
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

const DeleteAppPermission = async (req, res) => {
    try {
        var q = await knex('t_app_permissions').where({ app_permission_id: req.params.id }).del();
        return res.status(200).send({
            message: "App Permission Deleted Successfully",
            data: q
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

module.exports = { ReadAppPermission, ReadAppPermissionId, CreateAppPermission, UpdateAppPermission, DeleteAppPermission };
