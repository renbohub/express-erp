var express = require('express');
var knex = require('../../config/connection');

const ReadPackage = async (req, res) => {
    try {
        var data = await knex.table('l_packages');
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

const ReadPackageId = async (req, res) => {
    try {
        var data = await knex.table('l_packages').where({ package_id: req.query.id });
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

const CreatePackage = async (req, res) => {
    try {
        var newPackage = {
            package_name: req.body.package_name,
            package_code: req.body.package_code,
        };
        var q = await knex('l_packages').insert(newPackage);
        return res.status(200).send({
            message: "Package Created Successfully",
            data: q
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

const UpdatePackage = async (req, res) => {
    try {
        var w_id = req.body.package_id;
        var updateData = {
            package_name: req.body.package_name,
            package_code: req.body.package_code,
        };
        var q = await knex('l_packages').update(updateData).where({ package_id: w_id });
        return res.status(200).send({
            message: "Package Updated Successfully",
            data: q
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

const DeletePackage = async (req, res) => {
    try {
        var q = await knex('l_packages').where({ package_id: req.params.id }).del();
        return res.status(200).send({
            message: "Package Deleted Successfully",
            data: q
        });
    } catch (e) {
        res.status(400).send({
            message: "Database Issue",
            data: e
        });
    }
};

module.exports = { ReadPackage, ReadPackageId, CreatePackage, UpdatePackage, DeletePackage };
