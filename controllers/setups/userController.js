var express = require('express');
var knex = require('../../config/connection');
const bcrypt = require('bcryptjs');
const saltRounds = 10;

const ReadUser = async (req, res) => {
    try {
        var data = await knex.table('l_users')
            .join('l_roles', 'l_roles.role_id', 'l_users.role_id')
            .where({
                client_id: req.data.client_id
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

const ReadUserId = async (req, res) => {
    try {
        var data = await knex.table('l_users')
            .join('l_roles', 'l_roles.role_id', 'l_users.role_id')
            .where({
                client_id: req.data.client_id,
                user_id: req.query.id
            });
        var model_1 = await knex.table('l_roles');
        return res.status(200).send({
            message: "Success",
            data: data,
            model: {
                roles: model_1
            }
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

const CreateUser = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.user_password, saltRounds);
        var newUser = {
            user_name: req.body.user_name,
            user_email: req.body.user_email,
            role_id: req.body.role_id,
            user_password: hashedPassword,
            client_id: req.data.client_id,
        };
        var q = await knex('l_users').insert(newUser);

        return res.status(200).send({
            message: "User Created Successfully",
            data: q
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

const UpdateUser = async (req, res) => {
    try {
        var w_id = req.body.user_id;
        var c_id = req.data.client_id;

        const hashedPassword = await bcrypt.hash(req.body.user_password, saltRounds);
        if (req.body.user_password == '1') {
            var updateData = {
                user_name: req.body.user_name,
                user_email: req.body.user_email,
                role_id: req.body.role_id,
            };
        } else {
            var updateData = {
                user_name: req.body.user_name,
                user_email: req.body.user_email,
                role_id: req.body.role_id,
                user_password: hashedPassword,
            };
        }
        console.log(updateData);
        var q = await knex('l_users').update(updateData).where({ user_id: w_id });

        return res.status(200).send({
            message: "User Updated Successfully",
            data: q
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

const DeleteUser = async (req, res) => {
    try {
        var q = await knex('l_users').where({ user_id: req.query.id }).del();
        return res.status(200).send({
            message: "User Deleted Successfully",
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

module.exports = { ReadUser, ReadUserId, CreateUser, UpdateUser, DeleteUser };
