var express = require('express');
var knex = require('../../config/connection');

const ReadRole = async (req, res) => {
    try {
        var data = await knex.table('l_roles');
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

const ReadRoleId = async (req, res) => {
    try {
        var data = await knex.table('l_roles').where({ role_id: req.query.id });
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

const CreateRole = async (req, res) => {
    try {
        var newRole = {
            role_name: req.body.role_name,
            role_desc: req.body.role_desc,
        };
        var q = await knex('l_roles').insert(newRole);
        return res.status(200).send({
            message: "Role Created Successfully",
            data: q
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

const UpdateRole = async (req, res) => {
    try {
        var w_id = req.body.role_id;
        var updateData = {
            role_name: req.body.role_name,
            role_desc: req.body.role_desc,
        };
        var q = await knex('l_roles').update(updateData).where({ role_id: w_id });
        return res.status(200).send({
            message: "Role Updated Successfully",
            data: q
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

const DeleteRole = async (req, res) => {
    try {
        var q = await knex('l_roles').where({ role_id: req.params.id }).del();
        return res.status(200).send({
            message: "Role Deleted Successfully",
            data: q
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

module.exports = { ReadRole, ReadRoleId, CreateRole, UpdateRole, DeleteRole };
